// Shared in-process WhatsApp state for the QR/status web endpoints.
module.exports = {
  ready: false,
  status: 'starting',
  qrDataUrl: null,
  qrCreatedAt: 0,
  userId: null,
  lastDisconnect: null,
};
