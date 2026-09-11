require('dotenv').config();

const QRCode = require('qrcode');
const P = require('pino');
const { MongoClient } = require('mongodb');
const { setWhatsAppClient } = require('./admin/server');

let makeWASocket;
let DisconnectReason;
let Browsers;
let useMongoDBAuthState;

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
  if (!useMongoDBAuthState) {
    const helper = require('mongo-baileys');
    useMongoDBAuthState = helper.useMongoDBAuthState;
  }
}

function clearStatus() {
  global.__TPP_WHATSAPP_READY = false;
  global.__TPP_QR_DATA_URL = null;
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

  const db = mongo.db('town_pizza_planet');
  const collection = db.collection('whatsapp_auth');
  return useMongoDBAuthState(collection);
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
      try {
        global.__TPP_QR_DATA_URL = await QRCode.toDataURL(qr, {
          width: 720,
          margin: 4,
          errorCorrectionLevel: 'H',
        });
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
      const me = socket.user?.id || 'unknown';
      console.log(`✅ ${STORE_NAME} WhatsApp bot is LIVE as ${me}`);
    }

    if (connection === 'close') {
      global.__TPP_WHATSAPP_READY = false;
      global.__TPP_QR_DATA_URL = null;
      const code = lastDisconnect?.error?.output?.statusCode ?? lastDisconnect?.error?.statusCode ?? 0;
      const loggedOut = code === DisconnectReason.loggedOut;
      global.__TPP_WHATSAPP_STATUS = loggedOut ? 'logged_out' : 'disconnected';
      console.error(`⚠️ WhatsApp connection closed. code=${code || 'unknown'}${loggedOut ? ' (logged out)' : ''}`);

      if (manualStop || loggedOut) {
        if (loggedOut) console.log('🔒 WhatsApp logged out. A new QR scan is required.');
        return;
      }

      if (!reconnectTimer && reconnectAttempts < 5) {
        reconnectAttempts += 1;
        reconnectTimer = setTimeout(async () => {
          reconnectTimer = null;
          if (manualStop) return;
          try {
            global.__TPP_WHATSAPP_STATUS = 'reconnecting';
            await connectWhatsApp();
          } catch (err) {
            global.__TPP_WHATSAPP_STATUS = 'disconnected';
            console.error('❌ WhatsApp reconnect failed:', err?.message || err);
          }
        }, Math.min(30000, 5000 * reconnectAttempts));
      } else if (reconnectAttempts >= 5) {
        global.__TPP_WHATSAPP_STATUS = 'retry_limit';
        console.error('⏸️ WhatsApp reconnect limit reached. No Chromium restart loop is used.');
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

async function shutdown() {
  manualStop = true;
  clearTimeout(reconnectTimer);
  reconnectTimer = null;
  reconnecting = false;
  clearStatus();
  global.__TPP_WHATSAPP_STATUS = 'stopped';

  try { await adapter?.close?.(); } catch {}
  try { await mongo?.close?.(); } catch {}
  sock = null;
  adapter = null;
  mongo = null;
  setWhatsAppClient(null);
}

module.exports = {
  startWhatsApp,
  shutdown,
};
