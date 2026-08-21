require('dotenv').config();
const puppeteer = require('puppeteer');
const { Client, LocalAuth, RemoteAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const { MongoStore } = (() => {
  try { return require('wwebjs-mongo'); } catch { return { MongoStore: null }; }
})();
const { handleMessage } = require('./handlers/conversationHandler');
const { initDatabase, getMongoose } = require('./db/database');
const fmt = require('./utils/formatter');
const { setWhatsAppClient } = require('./admin/server');

const OWNER_PHONE = process.env.OWNER_PHONE || '';
const STORE_NAME = process.env.STORE_NAME || 'Town Pizza Planet';
const RESTRICT_HOURS = process.env.RESTRICT_HOURS === 'true';
const OPEN_HOUR = Number(process.env.OPEN_HOUR || 10);
const CLOSE_HOUR = Number(process.env.CLOSE_HOUR || 23);

let client;

function buildAuthStrategy() {
  const mongoose = getMongoose();
  if (mongoose && MongoStore) {
    const store = new MongoStore({ mongoose });
    console.log('🔐 Using RemoteAuth + MongoDB for persistent WhatsApp session.');
    return new RemoteAuth({
      store,
      clientId: 'town-pizza-planet',
      backupSyncIntervalMs: 300000,
    });
  }
  console.warn('⚠️ Using LocalAuth. On Render, configure MONGODB_URI so the WhatsApp session survives restarts.');
  return new LocalAuth({ dataPath: '.wwebjs_auth' });
}

function buildClient() {
  const puppeteerConfig = {
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-gpu',
      '--no-first-run',
      '--disable-background-networking',
      '--disable-background-timer-throttling',
      '--disable-renderer-backgrounding',
    ],
  };
  const executablePath = process.env.PUPPETEER_EXECUTABLE_PATH || puppeteer.executablePath();
  console.log(`🌐 Chrome executable: ${executablePath}`);
  puppeteerConfig.executablePath = executablePath;

  return new Client({
    authStrategy: buildAuthStrategy(),
    puppeteer: puppeteerConfig,
  });
}

async function startWhatsApp() {
  client = buildClient();

  client.on('qr', qr => {
    global.__TPP_WHATSAPP_READY = false;
    console.log('\n📱 Scan this QR code with WhatsApp:\n');
    qrcode.generate(qr, { small: true });
    console.log('\nWhatsApp → Linked Devices → Link a Device\n');
  });

  client.on('ready', () => {
    global.__TPP_WHATSAPP_READY = true;
    console.log(`✅ ${STORE_NAME} WhatsApp bot is LIVE as ${client.info.wid.user}`);
  });

  client.on('auth_failure', msg => {
    global.__TPP_WHATSAPP_READY = false;
    console.error('❌ WhatsApp authentication failed:', msg);
  });

  client.on('disconnected', reason => {
    global.__TPP_WHATSAPP_READY = false;
    console.error('⚠️ WhatsApp disconnected:', reason);
    setTimeout(() => client.initialize().catch(err => console.error('Reconnect failed:', err.message)), 5000);
  });

  client.on('message', async message => {
    try {
      if (message.from.includes('@g.us') || message.from === 'status@broadcast' || message.fromMe) return;
      if (!message.body && !message.location) return;

      if (RESTRICT_HOURS) {
        const hour = Number(new Intl.DateTimeFormat('en-US', { hour: '2-digit', hour12: false, timeZone: 'Asia/Kolkata' }).format(new Date()));
        if (hour < OPEN_HOUR || hour >= CLOSE_HOUR) {
          await message.reply(fmt.storeClosedMessage('en'));
          return;
        }
      }

      let contactName = 'Customer';
      try {
        const contact = await message.getContact();
        contactName = contact.pushname || contact.name || contact.shortName || 'Customer';
      } catch {}

      const location = message.location ? {
        latitude: message.location.latitude,
        longitude: message.location.longitude,
        name: message.location.name,
        address: message.location.address,
        url: message.location.url,
      } : null;

      const result = await handleMessage(message.from, message.body || '', contactName, location);
      for (const reply of result.replies || []) {
        if (reply) await message.reply(reply);
      }

      if (result.notifyOwner && OWNER_PHONE) {
        const ownerId = OWNER_PHONE.replace(/\D/g, '') + '@c.us';
        try { await client.sendMessage(ownerId, result.notifyOwner.message); }
        catch (err) { console.error('⚠️ Owner notification failed:', err.message); }
      }
    } catch (err) {
      console.error('❌ Message handling error:', err);
      try { await message.reply('😥 Sorry, something went wrong. Please type *hi* to restart.'); } catch {}
    }
  });

  setWhatsAppClient(client);
  await client.initialize();
  return client;
}

async function shutdown() {
  try { if (client) await client.destroy(); } catch {}
}

module.exports = { startWhatsApp, shutdown };
