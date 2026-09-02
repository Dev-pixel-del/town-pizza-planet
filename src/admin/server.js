require('dotenv').config();
const crypto = require('crypto');
const path = require('path');
const express = require('express');
const { createOrderRouter } = require('../web/orderApi');
const {
  getOrders,
  getTodayOrders,
  getTodayStats,
  updateOrderStatus,
  getOrderById,
} = require('../db/database');

const app = express();
const sessions = new Map();
let whatsappClient = null;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'change-me-now';
const COOKIE_NAME = 'tpp_admin_session';

app.disable('x-powered-by');
app.use(express.json({ limit: '100kb' }));
app.use(express.static(path.join(__dirname, 'public')));
app.use('/order', createOrderRouter(() => whatsappClient));
app.use('/api/order', createOrderRouter(() => whatsappClient));

function createToken() { return crypto.randomBytes(32).toString('hex'); }
function parseCookies(req) {
  const header = req.headers.cookie || '';
  return Object.fromEntries(header.split(';').filter(Boolean).map(pair => {
    const i = pair.indexOf('=');
    return [decodeURIComponent(pair.slice(0, i).trim()), decodeURIComponent(pair.slice(i + 1).trim())];
  }));
}
function requireAuth(req, res, next) {
  const token = parseCookies(req)[COOKIE_NAME];
  if (token && sessions.has(token)) return next();
  return res.status(401).json({ success: false, error: 'Unauthorized' });
}

app.get('/healthz', (req, res) => {
  res.json({ status: 'ok', service: 'Town Pizza Planet', whatsapp: global.__TPP_WHATSAPP_READY === true });
});

app.post('/api/login', (req, res) => {
  const password = String(req.body?.password || '');
  if (!password || password !== ADMIN_PASSWORD) return res.status(401).json({ success: false, error: 'Invalid password' });
  const token = createToken();
  sessions.set(token, { createdAt: Date.now() });
  res.setHeader('Set-Cookie', `${COOKIE_NAME}=${encodeURIComponent(token)}; HttpOnly; Path=/; SameSite=Lax${process.env.NODE_ENV === 'production' ? '; Secure' : ''}`);
  res.json({ success: true });
});

app.post('/api/logout', requireAuth, (req, res) => {
  const token = parseCookies(req)[COOKIE_NAME];
  sessions.delete(token);
  res.setHeader('Set-Cookie', `${COOKIE_NAME}=; Max-Age=0; HttpOnly; Path=/; SameSite=Lax`);
  res.json({ success: true });
});

app.get('/api/me', requireAuth, (req, res) => res.json({ success: true, store: process.env.STORE_NAME || 'Town Pizza Planet' }));

app.get('/api/orders/today', requireAuth, (req, res) => res.json({ success: true, orders: getTodayOrders() }));
app.get('/api/orders', requireAuth, (req, res) => {
  const limit = Number(req.query.limit) || 100;
  res.json({ success: true, orders: getOrders(req.query.status || null, limit) });
});
app.get('/api/stats', requireAuth, (req, res) => res.json({ success: true, stats: getTodayStats() }));

app.put('/api/orders/:orderId/status', requireAuth, async (req, res) => {
  const valid = ['received', 'preparing', 'ready', 'out_for_delivery', 'delivered', 'cancelled'];
  const status = String(req.body?.status || '');
  if (!valid.includes(status)) return res.status(400).json({ success: false, error: 'Invalid status' });

  const order = await updateOrderStatus(req.params.orderId, status);
  if (!order) return res.status(404).json({ success: false, error: 'Order not found' });

  if (whatsappClient && order.user_id && global.__TPP_STATUS_MESSAGE) {
    try {
      const message = global.__TPP_STATUS_MESSAGE(status, order.order_id, order.language || 'en');
      await whatsappClient.sendMessage(order.user_id, message);
    } catch (err) {
      console.error('Status notification failed:', err.message);
    }
  }

  res.json({ success: true, order });
});

app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'public', 'index.html')));
app.get('/qr', (req, res) => res.sendFile(path.join(__dirname, 'public', 'qr.html')));

app.get('/api/qr', (req, res) => {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  res.json({
    status: global.__TPP_WHATSAPP_STATUS || 'starting',
    ready: global.__TPP_WHATSAPP_READY === true,
    qr: global.__TPP_QR_DATA_URL || null
  });
});

function setWhatsAppClient(client) { whatsappClient = client; }

module.exports = { app, setWhatsAppClient };
