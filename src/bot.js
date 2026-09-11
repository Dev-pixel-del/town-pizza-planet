require('dotenv').config();

const QRCode = require('qrcode');
const P = require('pino');
const { MongoClient } = require('mongodb');
const { setWhatsAppClient } = require('./admin/server');
const whatsappState = require('./whatsappState');

let makeWASocket;
let DisconnectReason;
let Browsers;

let sock = null;
let adapter = null;
let mongo = null;
let reconnectTimer = null;
let reconnecting = false;
let manualStop = false;
let reconnectAttempts = 0;

const STORE_NAME = process.env.STORE_NAME || 'Town Pizza Planet';
const OWNER_PHONE = String(process.env.OWNER_PHONE || '').replace(/\D/g, '');
const ORDER_URL = (process.env.PUBLIC_ORDER_URL || process.env.RENDER_EXTERNAL_URL || 'https://town-pizza-planet-1.onrender.com').replace(/\/$/, '');
const MONGODB_URI = process.env.MONGODB_URI || '';
const AUTH_DB_NAME = process.env.WHATSAPP_AUTH_DB || 'town_pizza_planet';
const AUTH_COLLECTION_NAME = process.env.WHATSAPP_AUTH_COLLECTION || 'whatsapp_auth';

function disconnectDetails(lastDisconnect) {
  const err = lastDisconnect?.error;
  return {
    name: err?.name || null,
    message: err?.message || null,
    stack: err?.stack || null,
    statusCode: err?.output?.statusCode ?? err?.statusCode ?? null,
    data: err?.data ?? null,
  };
}

function normalizeJid(jid) {
  const raw = String(jid || '').trim();
  if (!raw) return raw;
  if (raw.endsWith('@c.us')) return raw.replace(/@c\.us$/, '@s.whatsapp.net');
  if (raw.endsWith('@lid')) return raw;
  if (raw.includes('@')) return raw;
  const digits = raw.replace(/\D/g, '');
  return digits ? `${digits}@s.whatsapp.net` : raw;
}

function buildAdapter(socket) {
  return {
    get raw() { return socket; },
    async sendMessage(jid, content, options) {
      const target = normalizeJid(jid);
      const payload = typeof content === 'string' ? { text: content } : content;
      return socket.sendMessage(target, payload, options);
    },
    async close() {
      return socket?.end?.(new Error('Town Pizza Planet shutdown'));
    },
  };
}

async function ensureLibraries() {
  if (!makeWASocket) {
    const wa = require('@whiskeysockets/baileys');
    makeWASocket = wa.default || wa.makeWASocket;
    DisconnectReason = wa.DisconnectReason || {};
    Browsers = wa.Browsers;
  }
}

function toBufferDeep(value) {
  if (Buffer.isBuffer(value)) return value;
  if (value instanceof Uint8Array) return Buffer.from(value);
  if (value instanceof ArrayBuffer) return Buffer.from(value);
  if (!value || typeof value !== 'object') return value;

  // BSON Binary instances can arrive from MongoDB as driver objects.
  if (value?._bsontype === 'Binary' && typeof value.value === 'function') {
    try { return Buffer.from(value.value(true)); } catch {}
  }
  if (value?._bsontype === 'Binary' && value.buffer != null) {
    try { return Buffer.from(value.buffer); } catch {}
  }

  // BufferJSON / legacy JSON Buffer representation.
  if (value.type === 'Buffer' && Array.isArray(value.data)) {
    return Buffer.from(value.data);
  }
  if (value.type === 'Buffer' && typeof value.data === 'string') {
    return Buffer.from(value.data, 'base64');
  }

  // Plain numeric-key objects can be the result of malformed/legacy BSON
  // serialization. Preserve only byte-like shapes as Buffers.
  const keys = Object.keys(value);
  if (keys.length && keys.every(k => /^\d+$/.test(k))) {
    const nums = keys.sort((a,b) => Number(a)-Number(b)).map(k => value[k]);
    if (nums.every(n => Number.isInteger(n) && n >= 0 && n <= 255)) {
      return Buffer.from(nums);
    }
  }

  if (Array.isArray(value)) return value.map(toBufferDeep);
  const out = {};
  for (const [key, child] of Object.entries(value)) out[key] = toBufferDeep(child);
  return out;
}


function decodeBinaryString(value) {
  if (typeof value !== 'string' || !value) return value;
  // Most persisted key material is base64. Decode only when it is plausibly
  // binary key material; leave ordinary strings alone.
  const compact = value.replace(/\s+/g, '');
  const looksBase64 = compact.length >= 16 && compact.length % 4 === 0 && /^[A-Za-z0-9+/]+={0,2}$/.test(compact);
  if (looksBase64) {
    try {
      const decoded = Buffer.from(compact, 'base64');
      if (decoded.length >= 8) return decoded;
    } catch {}
  }
  const looksHex = compact.length >= 16 && compact.length % 2 === 0 && /^[0-9a-fA-F]+$/.test(compact);
  if (looksHex) {
    try {
      const decoded = Buffer.from(compact, 'hex');
      if (decoded.length >= 8) return decoded;
    } catch {}
  }
  return value;
}

function normalizeCredsBinary(creds) {
  const out = toBufferDeep(creds || {});
  const directPairs = [
    ['noiseKey', 'private'], ['noiseKey', 'public'],
    ['pairingEphemeralKeyPair', 'private'], ['pairingEphemeralKeyPair', 'public'],
    ['signedIdentityKey', 'private'], ['signedIdentityKey', 'public'],
    ['signedPreKey', 'signature'],
  ];
  for (const [parent, child] of directPairs) {
    if (typeof out?.[parent]?.[child] === 'string') out[parent][child] = decodeBinaryString(out[parent][child]);
  }
  if (typeof out?.signedPreKey?.keyPair?.private === 'string') out.signedPreKey.keyPair.private = decodeBinaryString(out.signedPreKey.keyPair.private);
  if (typeof out?.signedPreKey?.keyPair?.public === 'string') out.signedPreKey.keyPair.public = decodeBinaryString(out.signedPreKey.keyPair.public);
  if (typeof out?.identityId === 'string') out.identityId = decodeBinaryString(out.identityId);
  if (typeof out?.backupToken === 'string') out.backupToken = decodeBinaryString(out.backupToken);
  return out;
}

function credsHaveUsablePrivateKeys(creds) {
  const checks = [
    creds?.noiseKey?.private,
    creds?.signedIdentityKey?.private,
    creds?.signedPreKey?.keyPair?.private,
    creds?.pairingEphemeralKeyPair?.private,
  ];
  return checks.every(v => Buffer.isBuffer(v) || v instanceof Uint8Array);
}

function serializeForMongo(value) {
  const { BufferJSON } = require('@whiskeysockets/baileys');
  return JSON.parse(JSON.stringify(value, BufferJSON.replacer));
}

function reviveFromMongo(value) {
  if (value == null) return value;
  try {
    const { BufferJSON } = require('@whiskeysockets/baileys');
    const normalized = JSON.parse(JSON.stringify(value, (key, child) => {
      if (child && typeof child === 'object' && child._bsontype === 'Binary' && typeof child.toString === 'function') {
        try { return { type: 'Buffer', data: Buffer.from(child.value(true)).toString('base64') }; } catch {}
      }
      return child;
    }));
    return toBufferDeep(JSON.parse(JSON.stringify(normalized), BufferJSON.reviver));
  } catch {
    return toBufferDeep(value);
  }
}

function clearStatus() {
  global.__TPP_WHATSAPP_READY = false;
  global.__TPP_QR_DATA_URL = null;
  whatsappState.ready = false;
  whatsappState.status = 'starting';
}

async function openMongoAuth() {
  if (!MONGODB_URI) throw new Error('MONGODB_URI is not configured.');
  if (!mongo) {
    mongo = new MongoClient(MONGODB_URI, {
      maxPoolSize: 3,
      minPoolSize: 0,
      serverSelectionTimeoutMS: 15000,
      connectTimeoutMS: 15000,
    });
    await mongo.connect();
  }

  const db = mongo.db(AUTH_DB_NAME);
  const collection = db.collection(AUTH_COLLECTION_NAME);

  // V30 uses an in-project auth-state adapter instead of mongo-baileys.
  // This prevents BSON Binary / plain-object values from reaching Node crypto.
  const WAProto = require('@whiskeysockets/baileys/WAProto');
  const { initAuthCreds } = require('@whiskeysockets/baileys/lib/Utils/auth-utils');

  const readData = async (id) => {
    try {
      const doc = await collection.findOne({ _id: id });
      if (!doc) return null;
      const data = { ...doc };
      delete data._id;
      return reviveFromMongo(data);
    } catch (err) {
      console.error(`❌ WhatsApp auth read failed (${id}):`, err?.message || err);
      return null;
    }
  };

  const writeData = async (data, id) => {
    const encoded = serializeForMongo(data);
    await collection.replaceOne({ _id: id }, encoded, { upsert: true });
  };

  const removeData = async (id) => {
    await collection.deleteOne({ _id: id });
  };

  const savedCreds = await readData('auth_creds');
  let creds = normalizeCredsBinary(reviveFromMongo(savedCreds?.creds) || initAuthCreds());

  // Earlier auth versions could persist key bytes as strings. Do not let a
  // malformed/legacy state reach libsignal: start a clean QR session instead.
  if (savedCreds?.creds && !credsHaveUsablePrivateKeys(creds)) {
    console.warn('⚠️ Stored WhatsApp auth state has invalid private-key types. Clearing WhatsApp auth state and starting a fresh QR session.');
    await collection.deleteMany({});
    creds = initAuthCreds();
  }
  const state = {
    creds,
    keys: {
      get: async (type, ids) => {
        const out = {};
        await Promise.all(ids.map(async id => {
          let value = await readData(`${type}-${id}`);
          if (type === 'app-state-sync-key' && value) {
            value = WAProto.proto.Message.AppStateSyncKeyData.fromObject(value);
          }
          out[id] = value;
        }));
        return out;
      },
      set: async data => {
        const tasks = [];
        for (const category of Object.keys(data || {})) {
          for (const [id, value] of Object.entries(data[category] || {})) {
            const key = `${category}-${id}`;
            tasks.push(value ? writeData(value, key) : removeData(key));
          }
        }
        await Promise.all(tasks);
      },
    },
  };

  return {
    state,
    saveCreds: async () => writeData({ creds: state.creds }, 'auth_creds'),
  };
}

async function connectWhatsApp() {
  await ensureLibraries();
  manualStop = false;
  clearStatus();
  global.__TPP_WHATSAPP_STATUS = 'starting';

  const { state, saveCreds } = await openMongoAuth();

  const logger = P({ level: 'silent' });
  const socket = makeWASocket({
    auth: state,
    logger,
    browser: Browsers ? Browsers.ubuntu('Town Pizza Planet') : undefined,
    printQRInTerminal: false,
    markOnlineOnConnect: false,
    syncFullHistory: false,
    generateHighQualityLinkPreview: false,
  });

  sock = socket;
  adapter = buildAdapter(socket);
  setWhatsAppClient(adapter);

  socket.ev.on('creds.update', saveCreds);

  socket.ev.on('connection.update', async (update) => {
    const { connection, lastDisconnect, qr } = update;

    if (qr) {
      global.__TPP_WHATSAPP_READY = false;
      global.__TPP_WHATSAPP_STATUS = 'awaiting_qr';
      whatsappState.ready = false;
      whatsappState.status = 'awaiting_qr';
      try {
        global.__TPP_QR_DATA_URL = await QRCode.toDataURL(qr, {
          width: 720,
          margin: 4,
          errorCorrectionLevel: 'H',
        });
        whatsappState.qrDataUrl = global.__TPP_QR_DATA_URL;
        whatsappState.lastDisconnect = null;
        whatsappState.qrCreatedAt = Date.now();
        whatsappState.status = 'awaiting_qr';
        console.log('📱 WhatsApp QR ready. Open /qr on the restaurant device to scan.');
      } catch (err) {
        console.error('❌ QR generation failed:', err?.message || err);
      }
    }

    if (connection === 'open') {
      reconnectAttempts = 0;
      global.__TPP_WHATSAPP_READY = true;
      global.__TPP_WHATSAPP_STATUS = 'ready';
      global.__TPP_QR_DATA_URL = null;
      whatsappState.ready = true;
      whatsappState.status = 'ready';
      whatsappState.qrDataUrl = null;
      whatsappState.qrCreatedAt = 0;
      whatsappState.lastDisconnect = null;
      const me = socket.user?.id || 'unknown';
      console.log(`✅ ${STORE_NAME} WhatsApp bot is LIVE as ${me}`);
    }

    if (connection === 'close') {
      global.__TPP_WHATSAPP_READY = false;
      const code = lastDisconnect?.error?.output?.statusCode ?? lastDisconnect?.error?.statusCode ?? 0;
      const details = disconnectDetails(lastDisconnect);
      const loggedOut = code === DisconnectReason.loggedOut;
      const restartRequired = code === DisconnectReason.restartRequired;
      const badSession = code === DisconnectReason.badSession;
      global.__TPP_WHATSAPP_STATUS = loggedOut ? 'logged_out' : (badSession ? 'bad_session' : 'disconnected');
      whatsappState.ready = false;
      whatsappState.status = global.__TPP_WHATSAPP_STATUS;
      whatsappState.lastDisconnect = { code: code || null, ...details, at: Date.now() };
      if (loggedOut || badSession) { whatsappState.qrDataUrl = null; whatsappState.qrCreatedAt = 0; }
      console.error('⚠️ WhatsApp connection closed:', JSON.stringify({code: code || 'unknown', loggedOut, restartRequired, badSession, ...details}));

      if (manualStop) return;

      // QR is required again after an explicit logout or invalid auth state.
      // The safe reset action in admin/server.js clears auth and calls start again.
      if (loggedOut || badSession) {
        global.__TPP_WHATSAPP_STATUS = loggedOut ? 'logged_out' : 'bad_session';
        whatsappState.status = global.__TPP_WHATSAPP_STATUS;
        return;
      }

      if (!reconnectTimer && reconnectAttempts < 8) {
        reconnectAttempts += 1;
        const delay = restartRequired ? 1000 : Math.min(30000, 3000 * reconnectAttempts);
        reconnectTimer = setTimeout(async () => {
          reconnectTimer = null;
          if (manualStop) return;
          try {
            global.__TPP_WHATSAPP_STATUS = 'reconnecting';
            whatsappState.status = 'reconnecting';
            await connectWhatsApp();
          } catch (err) {
            global.__TPP_WHATSAPP_STATUS = 'disconnected';
            whatsappState.status = 'disconnected';
            console.error('❌ WhatsApp reconnect failed:', err?.message || err);
          }
        }, delay);
      } else if (reconnectAttempts >= 8) {
        global.__TPP_WHATSAPP_STATUS = 'retry_limit';
        whatsappState.status = 'retry_limit';
        console.error('⏸️ WhatsApp reconnect limit reached. Use the admin WhatsApp reset action to start a fresh QR session.');
      }
    }
  });

  socket.ev.on('messages.upsert', async ({ messages, type }) => {
    if (type !== 'notify') return;

    for (const message of messages || []) {
      try {
        if (!message?.message || message.key?.fromMe) continue;
        const from = message.key.remoteJid;
        if (!from || from.endsWith('@g.us') || from === 'status@broadcast') continue;

        const text = String(
          message.message.conversation ||
          message.message.extendedTextMessage?.text ||
          message.message.buttonsResponseMessage?.selectedButtonId ||
          message.message.listResponseMessage?.singleSelectReply?.selectedRowId ||
          ''
        ).trim();

        if (!text) continue;

        const normalized = text.toLowerCase();
        const greeting = new Set([
          'hi','hello','hey','start','begin','namaste','salaam',
          'ನಮಸ್ಕಾರ','ನಮಸ್ತೆ','ಹಾಯ್','नमस्ते','हाय','سلام','ہیلو'
        ]);

        if (greeting.has(normalized)) {
          const phone = String(from).replace(/\D/g, '');
          const orderUrl = `${ORDER_URL}/order?phone=${encodeURIComponent(phone)}&v=2`;
          await adapter.sendMessage(from,
            `👋 *Welcome to ${STORE_NAME}!*\n\n🏠 *For home delivery, please click the link below:*\n\n👉 ${orderUrl}\n\n🍕 Select your language, choose your food, enter your delivery details and confirm your order online.\n\n💵 Cash on Delivery available.`
          );
        }
      } catch (err) {
        console.error('⚠️ WhatsApp message handling failed:', err?.message || err);
      }
    }
  });

  global.__TPP_WHATSAPP_STATUS = state.creds.registered ? 'connecting' : 'awaiting_qr';
  whatsappState.status = global.__TPP_WHATSAPP_STATUS;
  return adapter;
}

async function startWhatsApp() {
  if (adapter && global.__TPP_WHATSAPP_READY) return adapter;
  if (reconnecting) return adapter;
  reconnecting = true;
  try {
    return await connectWhatsApp();
  } finally {
    reconnecting = false;
  }
}

async function resetWhatsAppAuth() {
  manualStop = true;
  clearTimeout(reconnectTimer);
  reconnectTimer = null;
  reconnecting = false;
  reconnectAttempts = 0;
  global.__TPP_WHATSAPP_READY = false;
  global.__TPP_WHATSAPP_STATUS = 'resetting';
  whatsappState.ready = false;
  whatsappState.status = 'resetting';
  whatsappState.qrDataUrl = null;
  whatsappState.qrCreatedAt = 0;
  whatsappState.lastDisconnect = null;

  try { await adapter?.close?.(); } catch {}
  sock = null;
  adapter = null;
  setWhatsAppClient(null);

  try {
    if (mongo) {
      const db = mongo.db(AUTH_DB_NAME);
      await db.collection(AUTH_COLLECTION_NAME).drop().catch(err => {
        if (err?.codeName !== 'NamespaceNotFound') throw err;
      });
    }
  } finally {
    try { await mongo?.close?.(); } catch {}
    mongo = null;
  }

  manualStop = false;
  await connectWhatsApp();
  return true;
}

async function shutdown() {
  manualStop = true;
  clearTimeout(reconnectTimer);
  reconnectTimer = null;
  reconnecting = false;
  clearStatus();
  global.__TPP_WHATSAPP_STATUS = 'stopped';
  whatsappState.status = 'stopped';
  whatsappState.ready = false;
  whatsappState.qrDataUrl = null;
  whatsappState.qrCreatedAt = 0;

  try { await adapter?.close?.(); } catch {}
  try { await mongo?.close?.(); } catch {}
  sock = null;
  adapter = null;
  mongo = null;
  setWhatsAppClient(null);
}

module.exports = {
  startWhatsApp,
  resetWhatsAppAuth,
  shutdown,
};
