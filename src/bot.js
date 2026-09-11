require('dotenv').config();

const QRCode = require('qrcode');
const { Client, RemoteAuth, LocalAuth } = require('whatsapp-web.js');
const { MongoStore } = require('wwebjs-mongo');
const puppeteer = require('puppeteer');
const mongoose = require('mongoose');
const { setWhatsAppClient } = require('./admin/server');
const whatsappState = require('./whatsappState');

let client = null;
let store = null;
let reconnectTimer = null;
let reconnectAttempts = 0;
let reconnecting = false;
let manualStop = false;
let initializing = false;
let resetting = false;

const STORE_NAME = process.env.STORE_NAME || 'Town Pizza Planet';
const ORDER_URL = (process.env.PUBLIC_ORDER_URL || process.env.RENDER_EXTERNAL_URL || 'https://town-pizza-planet-1.onrender.com').replace(/\/$/, '');
const OWNER_PHONE = String(process.env.OWNER_PHONE || '').replace(/\D/g, '');
const CLIENT_ID = process.env.WHATSAPP_CLIENT_ID || 'town-pizza-planet';
const DATA_PATH = process.env.WHATSAPP_DATA_PATH || './.wwebjs_auth';
const REMOTE_SESSION = `RemoteAuth-${CLIENT_ID}`;

function setState(status, ready = false) {
  global.__TPP_WHATSAPP_READY = ready;
  global.__TPP_WHATSAPP_STATUS = status;
  whatsappState.ready = ready;
  whatsappState.status = status;
}

function clearQr() {
  global.__TPP_QR_DATA_URL = null;
  whatsappState.qrDataUrl = null;
  whatsappState.qrCreatedAt = 0;
}

function normalizeChatId(id) {
  const raw = String(id || '').trim();
  if (!raw) return raw;
  if (raw.endsWith('@c.us') || raw.endsWith('@g.us') || raw.endsWith('@broadcast')) return raw;
  const digits = raw.replace(/\D/g, '');
  return digits ? `${digits}@c.us` : raw;
}

function buildAdapter(instance) {
  return {
    get raw() { return instance; },
    async sendMessage(chatId, text, options) {
      const target = normalizeChatId(chatId);
      return instance.sendMessage(target, text, options);
    },
    async close() {
      try { await instance.destroy(); } catch {}
    },
  };
}

function disconnectDetails(reason) {
  const raw = reason?.message ? reason : null;
  return raw ? { name: raw.name || null, message: raw.message || null, stack: raw.stack || null } : null;
}

async function initializeClient() {
  if (client || initializing) return client;
  initializing = true;
  manualStop = false;
  clearQr();
  setState('starting', false);

  try {
    let authStrategy;
    if (USE_LOCAL_AUTH) {
      console.log('💻 Using LocalAuth for local development.');
      authStrategy = new LocalAuth({ clientId: `${CLIENT_ID}-local`, dataPath: DATA_PATH });
    } else {
      if (!MONGODB_URI) throw new Error('MONGODB_URI is required on the hosted deployment.');
      if (!mongoose.connection.readyState) {
        await mongoose.connect(MONGODB_URI, { serverSelectionTimeoutMS: 15000 });
      }
      store = new MongoStore({ mongoose });
      authStrategy = new RemoteAuth({
        clientId: CLIENT_ID,
        store,
        dataPath: DATA_PATH,
        backupSyncIntervalMs: 300000,
      });
      console.log('☁️ Using RemoteAuth + MongoDB for persistent WhatsApp session.');
    }

    client = new Client({
      authStrategy,
      puppeteer: {
        headless: true,
        executablePath: puppeteer.executablePath(),
        args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage', '--disable-gpu'],
      },
      takeoverOnConflict: false,
      takeoverTimeoutMs: 0,
    });

    client.on('qr', async (qr) => {
      if (manualStop) return;
      try {
        const dataUrl = await QRCode.toDataURL(qr, {
          width: 720,
          margin: 4,
          errorCorrectionLevel: 'H',
        });
        global.__TPP_WHATSAPP_READY = false;
        whatsappState.ready = false;
        setState('awaiting_qr', false);
        global.__TPP_QR_DATA_URL = dataUrl;
        whatsappState.qrDataUrl = dataUrl;
        whatsappState.qrCreatedAt = Date.now();
        console.log('📱 WhatsApp QR ready. Open /qr on the restaurant device to scan.');
      } catch (err) {
        console.error('❌ QR generation failed:', err?.message || err);
        setState('qr_error', false);
      }
    });

    client.on('authenticated', () => {
      setState('authenticated', false);
      console.log('✅ WhatsApp authenticated. Finalizing session...');
    });

    client.on('ready', () => {
      reconnectAttempts = 0;
      clearQr();
      setState('ready', true);
      const me = client.info?.wid?._serialized || client.info?.wid?.user || 'unknown';
      console.log(`✅ ${STORE_NAME} WhatsApp bot is LIVE as ${me}`);
    });

    client.on('auth_failure', (message) => {
      clearQr();
      setState('auth_failure', false);
      console.error('❌ WhatsApp authentication failure:', message);
      scheduleReconnect('auth_failure');
    });

    client.on('change_state', (state) => {
      console.log(`ℹ️ WhatsApp state changed: ${state}`);
      if (state === 'CONNECTED') setState('ready', true);
      else if (state === 'OPENING') setState('starting', false);
      else if (state === 'TIMEOUT' || state === 'UNPAIRED' || state === 'CONFLICT') setState(String(state).toLowerCase(), false);
    });

    client.on('disconnected', (reason) => {
      const details = disconnectDetails(reason);
      setState('disconnected', false);
      clearQr();
      console.error('⚠️ WhatsApp disconnected:', JSON.stringify({ reason: String(reason || 'unknown'), details }));
      client = null;
      setWhatsAppClient(null);
      if (!manualStop && !resetting) scheduleReconnect(String(reason || 'disconnected'));
    });

    client.on('message', async (message) => {
      try {
        if (!message || message.fromMe || message.from.endsWith('@g.us') || message.from === 'status@broadcast') return;
        const text = String(message.body || '').trim();
        if (!text) return;
        const normalized = text.toLowerCase();
        const greeting = new Set([
          'hi','hello','hey','start','begin','namaste','salaam',
          'ನಮಸ್ಕಾರ','ನಮಸ್ತೆ','ಹಾಯ್','नमस्ते','हाय','سلام','ہیلو'
        ]);
        if (!greeting.has(normalized)) return;
        const phone = String(message.from || '').replace(/\D/g, '');
        const orderUrl = `${ORDER_URL}/order?phone=${encodeURIComponent(phone)}&v=2`;
        await client.sendMessage(message.from,
          `👋 *Welcome to ${STORE_NAME}!*\n\n🏠 *For home delivery, please click the link below:*\n\n👉 ${orderUrl}\n\n🍕 Select your language, choose your food, enter your delivery details and confirm your order online.\n\n💵 Cash on Delivery available.`
        );
      } catch (err) {
        console.error('⚠️ WhatsApp message handling failed:', err?.message || err);
      }
    });

    setWhatsAppClient(buildAdapter(client));
    setState('initializing', false);
    await client.initialize();
    return buildAdapter(client);
  } catch (err) {
    console.error('❌ WhatsApp initialize failed:', err?.stack || err);
    try { await client?.destroy(); } catch {}
    client = null;
    setWhatsAppClient(null);
    setState('init_failed', false);
    throw err;
  } finally {
    initializing = false;
  }
}

function scheduleReconnect(reason) {
  if (reconnectTimer || manualStop || resetting || reconnectAttempts >= 8) {
    if (reconnectAttempts >= 8) setState('retry_limit', false);
    return;
  }
  reconnectAttempts += 1;
  const delay = Math.min(30000, 3000 * reconnectAttempts);
  console.log(`🔁 WhatsApp reconnect scheduled in ${Math.round(delay / 1000)}s (${reason}).`);
  reconnectTimer = setTimeout(async () => {
    reconnectTimer = null;
    try {
      setState('reconnecting', false);
      await initializeClient();
    } catch (err) {
      console.error('❌ WhatsApp reconnect attempt failed:', err?.message || err);
      scheduleReconnect(err?.message || 'reconnect_failed');
    }
  }, delay);
}

async function startWhatsApp() {
  if (global.__TPP_WHATSAPP_READY && client) return buildAdapter(client);
  if (reconnecting) return client ? buildAdapter(client) : null;
  reconnecting = true;
  try {
    return await initializeClient();
  } finally {
    reconnecting = false;
  }
}

async function resetWhatsAppAuth() {
  if (resetting) return false;
  resetting = true;
  manualStop = true;
  clearTimeout(reconnectTimer);
  reconnectTimer = null;
  reconnectAttempts = 0;
  setState('resetting', false);
  clearQr();

  try { await client?.logout(); } catch (err) { console.warn('⚠️ WhatsApp logout during reset:', err?.message || err); }
  try { await client?.destroy(); } catch {}
  client = null;
  setWhatsAppClient(null);

  // RemoteAuth stores the browser profile in MongoDB GridFS. Remove that
  // session explicitly so the next initialization must request a QR.
  try {
    if (!USE_LOCAL_AUTH && mongoose.connection.readyState) {
      const db = mongoose.connection.db;
      await db.collection(`whatsapp-${REMOTE_SESSION}.files`).deleteMany({});
      await db.collection(`whatsapp-${REMOTE_SESSION}.chunks`).deleteMany({});
      console.log('🧹 WhatsApp RemoteAuth session cleared.');
    }
  } finally {
    manualStop = false;
    resetting = false;
  }

  await initializeClient();
  return true;
}

async function shutdown() {
  manualStop = true;
  clearTimeout(reconnectTimer);
  reconnectTimer = null;
  reconnecting = false;
  clearQr();
  setState('stopped', false);
  try { await client?.destroy(); } catch {}
  client = null;
  setWhatsAppClient(null);
}

module.exports = { startWhatsApp, resetWhatsAppAuth, shutdown };
