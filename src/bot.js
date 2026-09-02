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

const qrcode = require('qrcode-terminal');
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
    return client.sendMessage(chatId, reply);
  }

  if (!reply || !reply.type) {
    return null;
  }

  if (reply.type === 'text') {
    return client.sendMessage(chatId, reply.body);
  }

  if (reply.type === 'buttons') {
    return client.sendMessage(
      chatId,
      ui.makeButtonsObject(reply)
    );
  }

  if (reply.type === 'list') {
    return client.sendMessage(
      chatId,
      ui.makeListObject(reply)
    );
  }

  if (reply.type === 'image') {
    if (!reply.filePath || !fs.existsSync(reply.filePath)) {
      console.error(
        `⚠️ Image file not found: ${reply.filePath}`
      );
      return null;
    }

    return client.sendMessage(
      chatId,
      MessageMedia.fromFilePath(reply.filePath),
      {
        caption: reply.caption || '',
      }
    );
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

    QRCode.toDataURL(qr, {
      width: 520,
      margin: 2,
      errorCorrectionLevel: 'M',
    })
      .then((value) => {
        global.__TPP_QR_DATA_URL = value;
      })
      .catch(() => {});

    console.log('\n📱 New WhatsApp QR generated.\n');

    qrcode.generate(qr, {
      small: true,
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

    console.error(
      '⚠️ WhatsApp disconnected:',
      reason
    );
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
        const baseUrl = process.env.PUBLIC_ORDER_URL || '';
        const phone = String(message.from || '').replace(/\D/g, '');
        const orderUrl = baseUrl ? `${baseUrl.replace(/\/$/, '')}/order?phone=${encodeURIComponent(phone)}` : `/order?phone=${encodeURIComponent(phone)}`;
        await client.sendMessage(message.from,
          `👋 *Welcome to ${STORE_NAME}!*\n\n🍕 Order your favourites with our quick online menu.\n\n👉 ${orderUrl}\n\nOpen the link to choose your language, browse the menu, add items to your cart and checkout with Cash on Delivery.`
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
          await client.sendMessage(
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

  return client;
}

/* ============================================================
   SHUTDOWN
   ============================================================ */

async function shutdown() {
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