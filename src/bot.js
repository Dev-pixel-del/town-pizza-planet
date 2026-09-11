require('dotenv').config();
const path = require('path');
const fs = require('fs');

const puppeteer = require('puppeteer');
const {
  Client,
  LocalAuth,
  RemoteAuth,
  MessageMedia,
} = require('whatsapp-web.js');

const QRCode = require('qrcode');

const { MongoStore } = (() => {
  try {
    return require('wwebjs-mongo');
  } catch {
    return { MongoStore: null };
  }
})();

const { handleMessage } = require('./handlers/conversationHandler');
const { getMongoose } = require('./db/database');
const { setWhatsAppClient } = require('./admin/server');
const ui = require('./ui/whatsappUI');

const OWNER_PHONE = process.env.OWNER_PHONE || '';
const STORE_NAME = process.env.STORE_NAME || 'Town Pizza Planet';

const USE_LOCAL_AUTH =
  String(process.env.LOCAL_AUTH || '').toLowerCase() === 'true';

const RESTRICT_HOURS =
  String(process.env.RESTRICT_HOURS || '').toLowerCase() === 'true';

const OPEN_HOUR = Number(process.env.OPEN_HOUR || 10);
const CLOSE_HOUR = Number(process.env.CLOSE_HOUR || 23);

let client = null;
let reconnectTimer = null;
let reconnecting = false;

async function waitForWhatsAppReady(timeoutMs = 15000) {
  const start = Date.now();
  while (client && !global.__TPP_WHATSAPP_READY && Date.now() - start < timeoutMs) {
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  return Boolean(client && global.__TPP_WHATSAPP_READY);
}

async function sendWhatsAppActionSafe(action, attempts = 3) {
  if (!client) throw new Error('WhatsApp client is not initialized.');
  const ready = await waitForWhatsAppReady(15000);
  if (!ready) throw new Error('WhatsApp client is not ready.');
  let lastError;
  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    try {
      return await action();
    } catch (err) {
      lastError = err;
      const message = String(err?.message || err);
      const transient = /Execution context was destroyed|Target closed|Session closed|detached|not connected|Protocol error/i.test(message);
      if (!transient || attempt === attempts) break;
      await new Promise(resolve => setTimeout(resolve, 1200 * attempt));
    }
  }
  throw lastError || new Error('WhatsApp send failed.');
}

async function sendWhatsAppMessageSafe(chatId, text, attempts = 3) {
  return sendWhatsAppActionSafe(() => client.sendMessage(chatId, text), attempts);
}

global.__TPP_WHATSAPP_READY = false;
global.__TPP_WHATSAPP_STATUS = 'starting';
global.__TPP_QR_DATA_URL = null;

/* ============================================================
   AUTH STRATEGY
   ============================================================ */

function buildAuthStrategy() {
  if (USE_LOCAL_AUTH) {
    const dataPath = path.resolve(process.cwd(), '.wwebjs_auth');

    console.log(
      `🔐 Using LocalAuth for local testing: ${dataPath}`
    );

    return new LocalAuth({
      clientId: 'town-pizza-planet-local',
      dataPath,
      rmMaxRetries: 3,
    });
  }

  const mongoose = getMongoose();

  if (mongoose && MongoStore) {
    console.log(
      '🔐 Using RemoteAuth + MongoDB for persistent WhatsApp session.'
    );

    return new RemoteAuth({
      store: new MongoStore({ mongoose }),
      clientId: 'town-pizza-planet',
      backupSyncIntervalMs: 300000,
      dataPath: path.resolve(process.cwd(), '.wwebjs_remote'),
    });
  }

  console.log(
    '⚠️ MongoDB RemoteAuth unavailable. Falling back to LocalAuth.'
  );

  return new LocalAuth({
    clientId: 'town-pizza-planet-local',
    dataPath: path.resolve(process.cwd(), '.wwebjs_auth'),
    rmMaxRetries: 3,
  });
}

/* ============================================================
   CREATE WHATSAPP CLIENT
   ============================================================ */

function buildClient() {
  const executablePath =
    process.env.PUPPETEER_EXECUTABLE_PATH ||
    puppeteer.executablePath();

  console.log(`🌐 Chrome executable: ${executablePath}`);

  return new Client({
    authStrategy: buildAuthStrategy(),

    puppeteer: {
      headless: USE_LOCAL_AUTH ? false : true,
      executablePath,

      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu',
        '--disable-extensions',
        '--disable-default-apps',
        '--disable-sync',
        '--disable-translate',
        '--disable-component-update',
        '--disable-background-networking',
        '--disable-notifications',
        '--disable-print-preview',
        '--disable-hang-monitor',
        '--metrics-recording-only',
        '--mute-audio',
        '--no-default-browser-check',
        '--password-store=basic',
        '--use-mock-keychain',
        '--renderer-process-limit=2',
        '--no-first-run',
      ],
    },

    qrMaxRetries: 30,
  });
}

/* ============================================================
   SEND REPLY
   ============================================================ */

async function sendReply(chatId, reply) {
  if (typeof reply === 'string') {
    return sendWhatsAppMessageSafe(chatId, reply);
  }

  if (!reply || !reply.type) {
    return null;
  }

  if (reply.type === 'text') {
    return sendWhatsAppMessageSafe(chatId, reply.body);
  }

  if (reply.type === 'buttons') {
    return sendWhatsAppActionSafe(() => client.sendMessage(
      chatId,
      ui.makeButtonsObject(reply)
    ));
  }

  if (reply.type === 'list') {
    return sendWhatsAppActionSafe(() => client.sendMessage(
      chatId,
      ui.makeListObject(reply)
    ));
  }

  if (reply.type === 'image') {
    if (!reply.filePath || !fs.existsSync(reply.filePath)) {
      console.error(
        `⚠️ Image file not found: ${reply.filePath}`
      );
      return null;
    }

    return sendWhatsAppActionSafe(() => client.sendMessage(
      chatId,
      MessageMedia.fromFilePath(reply.filePath),
      {
        caption: reply.caption || '',
      }
    ));
  }

  return null;
}

/* ============================================================
   START WHATSAPP
   ============================================================ */

async function startWhatsApp() {
  /*
   * IMPORTANT:
   * Database initialization is intentionally NOT done here.
   * server.js initializes the database before calling this function.
   */

  if (client) {
    console.log('⚠️ WhatsApp client already exists.');
    return client;
  }

  client = buildClient();

  /* ----------------------------------------------------------
     QR
     ---------------------------------------------------------- */

  client.on('qr', (qr) => {
    global.__TPP_WHATSAPP_READY = false;
    global.__TPP_WHATSAPP_STATUS = 'awaiting_qr';

    // Keep the QR out of Render logs. Render's log viewer can mangle the
    // terminal-art QR and make it effectively unscannable. The full-quality
    // QR is exposed through /qr and /api/qr instead.
    QRCode.toDataURL(qr, {
      width: 720,
      margin: 4,
      errorCorrectionLevel: 'H',
    })
      .then((value) => {
        global.__TPP_QR_DATA_URL = value;
        console.log('📱 WhatsApp QR ready. Open /qr on the restaurant device to scan.');
      })
      .catch((err) => {
        console.error('⚠️ Could not prepare WhatsApp QR for web display:', err?.message || err);
      });
  });

  /* ----------------------------------------------------------
     AUTHENTICATED
     ---------------------------------------------------------- */

  client.on('authenticated', () => {
    global.__TPP_WHATSAPP_STATUS = 'authenticated';

    console.log(
      '✅ WhatsApp authenticated. Waiting for client ready...'
    );
  });

  /* ----------------------------------------------------------
     LOADING
     ---------------------------------------------------------- */

  client.on('loading_screen', (percent, message) => {
    console.log(
      `🌐 WhatsApp Web loading: ${percent}% — ${message}`
    );
  });

  /* ----------------------------------------------------------
     READY
     ---------------------------------------------------------- */

  client.on('ready', () => {
    global.__TPP_WHATSAPP_READY = true;
    global.__TPP_WHATSAPP_STATUS = 'ready';
    global.__TPP_QR_DATA_URL = null;

    const whatsappNumber =
      client.info?.wid?.user || 'unknown';

    console.log(
      `✅ ${STORE_NAME} WhatsApp bot is LIVE as ${whatsappNumber}`
    );
  });

  /* ----------------------------------------------------------
     AUTH FAILURE
     ---------------------------------------------------------- */

  client.on('auth_failure', (msg) => {
    global.__TPP_WHATSAPP_READY = false;
    global.__TPP_WHATSAPP_STATUS = 'auth_failure';
    global.__TPP_QR_DATA_URL = null;

    console.error(
      '❌ WhatsApp authentication failed:',
      msg
    );
  });

  /* ----------------------------------------------------------
     DISCONNECTED
     ---------------------------------------------------------- */

  client.on('disconnected', (reason) => {
    global.__TPP_WHATSAPP_READY = false;
    global.__TPP_WHATSAPP_STATUS = 'disconnected';
    global.__TPP_QR_DATA_URL = null;

    console.error('⚠️ WhatsApp disconnected:', reason);

    // Keep the restaurant bot recoverable after QR timeout or a transient
    // WhatsApp-Web disconnect. Do not create a second client; reinitialize
    // the existing client so its event handlers remain intact.
    if (!reconnecting && client) {
      reconnecting = true;
      clearTimeout(reconnectTimer);
      reconnectTimer = setTimeout(async () => {
        try {
          console.log('🔄 Reinitializing WhatsApp client after disconnect...');
          global.__TPP_WHATSAPP_STATUS = 'reconnecting';
          global.__TPP_QR_DATA_URL = null;
          await client.initialize();
        } catch (err) {
          console.error('❌ WhatsApp reinitialize failed:', err?.message || err);
        } finally {
          reconnecting = false;
        }
      }, 3000);
    }
  });

  /* ----------------------------------------------------------
     INCOMING MESSAGE
     ---------------------------------------------------------- */

  client.on('message', async (message) => {
    try {
      /*
       * Ignore:
       * - WhatsApp groups
       * - status broadcasts
       * - messages sent by this account itself
       */

      if (
        message.from.includes('@g.us') ||
        message.from === 'status@broadcast' ||
        message.fromMe
      ) {
        return;
      }

      /*
       * Button / list selection ID
       */

      const interactiveId =
        message.selectedButtonId ||
        message.selectedRowId ||
        '';

      const messageText =
        interactiveId ||
        message.body ||
        '';

      if (!messageText && !message.location) {
        return;
      }

      /* --------------------------------------------------------
         BUSINESS HOURS
         -------------------------------------------------------- */

      if (RESTRICT_HOURS) {
        const hour = Number(
          new Intl.DateTimeFormat('en-US', {
            hour: '2-digit',
            hour12: false,
            timeZone: 'Asia/Kolkata',
          }).format(new Date())
        );

        if (
          hour < OPEN_HOUR ||
          hour >= CLOSE_HOUR
        ) {
          await message.reply(
            '🏠 We are currently closed. Please try again during business hours.'
          );

          return;
        }
      }

      /* --------------------------------------------------------
         CUSTOMER NAME
         -------------------------------------------------------- */

      let contactName = 'Customer';

      try {
        const contact = await message.getContact();

        contactName =
          contact.pushname ||
          contact.name ||
          contact.shortName ||
          'Customer';
      } catch {
        // Keep default Customer
      }

      /* --------------------------------------------------------
         CONVERSATION HANDLER
         -------------------------------------------------------- */

      const greetingWords = ['hi','hello','hey','start','begin','namaste','salaam','ನಮಸ್ಕಾರ','ನಮಸ್ತೆ','ಹಾಯ್','नमस्ते','हाय','سلام','ہیلو'];
      const normalizedText = String(messageText || '').trim().toLowerCase();

      // Free, reliable customer ordering interface: WhatsApp is the entry point;
      // the interactive catalogue/checkout lives on our animated web app.
      if (greetingWords.includes(normalizedText)) {
        const baseUrl = (process.env.PUBLIC_ORDER_URL || process.env.RENDER_EXTERNAL_URL || 'https://town-pizza-planet-1.onrender.com').replace(/\/$/, '');
        const phone = String(message.from || '').replace(/\D/g, '');
        const orderUrl = `${baseUrl}/order?phone=${encodeURIComponent(phone)}&v=2`;
        await sendWhatsAppMessageSafe(
          message.from,
          `👋 *Welcome to ${STORE_NAME}!*\n\n🍕 *Online Ordering*\n\n👉 ${orderUrl}\n\nTap the link to choose your language, browse the animated menu, add items to your cart, and checkout with Cash on Delivery.`
        );
        return;
      }

      const result = await handleMessage(
        message.from,
        messageText,
        contactName
      );

      /* --------------------------------------------------------
         SEND BOT REPLIES
         -------------------------------------------------------- */

      for (const reply of result.replies || []) {
        await sendReply(
          message.from,
          reply
        );
      }

      /* --------------------------------------------------------
         OWNER NOTIFICATION
         -------------------------------------------------------- */

      if (
        result.notifyOwner &&
        OWNER_PHONE
      ) {
        const ownerId =
          OWNER_PHONE.replace(/\D/g, '') +
          '@c.us';

        try {
          await sendWhatsAppMessageSafe(
            ownerId,
            result.notifyOwner.message
          );
        } catch (err) {
          console.error(
            '⚠️ Owner notification failed:',
            err.message
          );
        }
      }
    } catch (err) {
      console.error(
        '❌ Message handling error:',
        err
      );

      try {
        await message.reply(
          '😥 Sorry, something went wrong. Please type *hi* to restart.'
        );
      } catch {
        // Ignore reply failure
      }
    }
  });

  /*
   * Make the WhatsApp client available to the admin server.
   */

  setWhatsAppClient(client);

  /*
   * Start WhatsApp.
   *
   * This is the ONLY place where initialize() is called.
   * server.js calls startWhatsApp() exactly once.
   */

  await client.initialize();

  if (!global.__TPP_MEMORY_MONITOR) {
    global.__TPP_MEMORY_MONITOR = setInterval(() => {
      const m = process.memoryUsage();
      const rssMb = Math.round(m.rss / 1024 / 1024);
      const heapMb = Math.round(m.heapUsed / 1024 / 1024);
      console.log(`🧠 Memory: RSS ${rssMb} MB, heap ${heapMb} MB`);
    }, 300000);
    global.__TPP_MEMORY_MONITOR.unref?.();
  }

  return client;
}

/* ============================================================
   SHUTDOWN
   ============================================================ */

async function shutdown() {
  clearTimeout(reconnectTimer);
  reconnectTimer = null;
  reconnecting = false;

  if (global.__TPP_MEMORY_MONITOR) {
    clearInterval(global.__TPP_MEMORY_MONITOR);
    global.__TPP_MEMORY_MONITOR = null;
  }

  if (!client) {
    return;
  }

  try {
    await client.destroy();
  } catch {
    // Ignore shutdown errors
  }

  client = null;

  global.__TPP_WHATSAPP_READY = false;
  global.__TPP_WHATSAPP_STATUS = 'stopped';
  global.__TPP_QR_DATA_URL = null;
}

/*
 * IMPORTANT:
 *
 * DO NOT call startWhatsApp() here.
 *
 * server.js is responsible for starting the bot.
 */

module.exports = {
  startWhatsApp,
  shutdown,
};