require('dns').setServers(['1.1.1.1']);

require('dotenv').config();
const { app, setWhatsAppClient } = require('./admin/server');
const { initDatabase } = require('./db/database');
const { startWhatsApp, shutdown } = require('./bot');
const { statusMessage } = require('./utils/formatter');

const PORT = Number(process.env.PORT || process.env.ADMIN_PORT || 3000);

global.__TPP_WHATSAPP_READY = false;
global.__TPP_STATUS_MESSAGE = statusMessage;

(async () => {
  try {
    await initDatabase();

    app.listen(PORT, '0.0.0.0', () => {
      console.log(`🌐 Town Pizza Planet web server listening on port ${PORT}`);
      console.log(`❤️ Health: /healthz`);
    });

    const client = await startWhatsApp();
    setWhatsAppClient(client);
  } catch (err) {
    console.error('❌ Startup failed:', err);
    process.exit(1);
  }
})();

process.on('SIGINT', async () => { await shutdown(); process.exit(0); });
process.on('SIGTERM', async () => { await shutdown(); process.exit(0); });
