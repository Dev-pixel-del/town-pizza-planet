require('dns').setServers(['1.1.1.1']);

require('dotenv').config();
const { app, setWhatsAppClient, initAdminStore } = require('./admin/server');
const { initDatabase } = require('./db/database');
const { shutdown } = require('./bot');
const { initOwnerAlerts } = require('./ownerAlerts');
const { statusMessage } = require('./utils/formatter');

const PORT = Number(process.env.PORT || process.env.ADMIN_PORT || 3000);

global.__TPP_WHATSAPP_READY = false;
global.__TPP_STATUS_MESSAGE = statusMessage;

(async () => {
  try {
    await initDatabase();
    await initAdminStore();
    await initOwnerAlerts();

    app.listen(PORT, '0.0.0.0', () => {
      console.log(`🌐 Town Pizza Planet web server listening on port ${PORT}`);
      console.log(`❤️ Health: /healthz`);
    });

    // WhatsApp Web is intentionally not started on Render.
    // Customer orders use the owner PWA alert system instead.
  } catch (err) {
    console.error('❌ Startup failed:', err);
    process.exit(1);
  }
})();

process.on('SIGINT', async () => { await shutdown(); process.exit(0); });
process.on('SIGTERM', async () => { await shutdown(); process.exit(0); });
