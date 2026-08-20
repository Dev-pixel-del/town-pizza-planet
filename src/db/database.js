// Town Pizza Planet — persistent data layer
// Uses MongoDB when MONGODB_URI is configured (recommended for Render),
// otherwise falls back to local JSON files for development.

require('dotenv').config();
const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, '..', '..', 'data');
const SESSIONS_FILE = path.join(DATA_DIR, 'sessions.json');
const ORDERS_FILE = path.join(DATA_DIR, 'orders.json');

let mode = 'file';
let mongoose = null;
let SessionModel = null;
let OrderModel = null;

const sessions = new Map();
const orders = [];

function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
}

function nowIso() {
  return new Date().toISOString();
}

function istDateParts(date = new Date()) {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Kolkata', year: 'numeric', month: '2-digit', day: '2-digit'
  }).formatToParts(date);
  return Object.fromEntries(parts.filter(p => p.type !== 'literal').map(p => [p.type, p.value]));
}

function todayKey() {
  const p = istDateParts();
  return `${p.year}${p.month}${p.day}`;
}

async function initMongo() {
  mongoose = require('mongoose');
  await mongoose.connect(process.env.MONGODB_URI, {
    serverSelectionTimeoutMS: 10000,
  });

  const sessionSchema = new mongoose.Schema({
    user_id: { type: String, unique: true, index: true },
    state: { type: String, default: 'IDLE' },
    lang: { type: String, default: null },
    cart: { type: Array, default: [] },
    pending_item: { type: Object, default: null },
    pending_combo: { type: Object, default: null },
    location: { type: Object, default: null },
    landmark: { type: String, default: null },
    address: { type: String, default: null },
    last_activity: { type: Number, default: 0 },
  }, { timestamps: false, collection: 'sessions' });

  const orderSchema = new mongoose.Schema({
    id: Number,
    order_id: { type: String, unique: true, index: true },
    user_id: { type: String, index: true },
    user_name: String,
    items: Array,
    subtotal: Number,
    total: Number,
    free_delivery: Boolean,
    payment_method: String,
    location: Object,
    landmark: String,
    address: String,
    status: { type: String, index: true },
    language: String,
    created_at: { type: Date, index: true },
    updated_at: Date,
  }, { collection: 'orders' });

  SessionModel = mongoose.models.TPP_Session || mongoose.model('TPP_Session', sessionSchema);
  OrderModel = mongoose.models.TPP_Order || mongoose.model('TPP_Order', orderSchema);

  const sessionDocs = await SessionModel.find().lean();
  sessionDocs.forEach(doc => sessions.set(doc.user_id, normalizeSession(doc)));

  const orderDocs = await OrderModel.find().sort({ created_at: -1 }).lean();
  orders.splice(0, orders.length, ...orderDocs.map(normalizeOrder));
  mode = 'mongo';

  console.log(`✅ MongoDB connected. Sessions: ${sessions.size}, Orders: ${orders.length}`);
}

function loadFile() {
  ensureDataDir();
  try {
    if (fs.existsSync(SESSIONS_FILE)) {
      const raw = JSON.parse(fs.readFileSync(SESSIONS_FILE, 'utf8'));
      Object.entries(raw).forEach(([userId, data]) => sessions.set(userId, normalizeSession(data)));
    }
  } catch (err) {
    console.warn('⚠️ Could not load sessions.json:', err.message);
  }
  try {
    if (fs.existsSync(ORDERS_FILE)) {
      const raw = JSON.parse(fs.readFileSync(ORDERS_FILE, 'utf8'));
      orders.splice(0, orders.length, ...raw.map(normalizeOrder));
    }
  } catch (err) {
    console.warn('⚠️ Could not load orders.json:', err.message);
  }
  mode = 'file';
  console.log(`✅ Local JSON database ready. Sessions: ${sessions.size}, Orders: ${orders.length}`);
}

async function initDatabase() {
  if (process.env.MONGODB_URI) {
    try {
      await initMongo();
      return;
    } catch (err) {
      console.error('❌ MongoDB connection failed:', err.message);
      if (process.env.REQUIRE_MONGODB === 'true') throw err;
      console.warn('⚠️ Falling back to local JSON storage.');
    }
  }
  loadFile();
}

function normalizeSession(data = {}) {
  return {
    user_id: data.user_id,
    state: data.state || 'IDLE',
    lang: data.lang || null,
    cart: Array.isArray(data.cart) ? data.cart : [],
    pending_item: data.pending_item || null,
    pending_combo: data.pending_combo || null,
    location: data.location || null,
    landmark: data.landmark || null,
    address: data.address || null,
    last_activity: data.last_activity || Date.now(),
  };
}

function normalizeOrder(data = {}) {
  return {
    id: data.id,
    order_id: data.order_id,
    user_id: data.user_id,
    user_name: data.user_name || 'Customer',
    items: Array.isArray(data.items) ? data.items : [],
    subtotal: Number(data.subtotal ?? data.total ?? 0),
    total: Number(data.total ?? 0),
    free_delivery: data.free_delivery !== false,
    payment_method: data.payment_method || 'COD',
    location: data.location || null,
    landmark: data.landmark || null,
    address: data.address || null,
    language: data.language || 'en',
    status: data.status || 'received',
    created_at: data.created_at instanceof Date ? data.created_at.toISOString() : (data.created_at || nowIso()),
    updated_at: data.updated_at instanceof Date ? data.updated_at.toISOString() : (data.updated_at || nowIso()),
  };
}

function persistSession(session) {
  if (mode === 'mongo' && SessionModel) {
    SessionModel.updateOne({ user_id: session.user_id }, { $set: session }, { upsert: true }).catch(err =>
      console.error('⚠️ Session persistence failed:', err.message)
    );
    return;
  }
  ensureDataDir();
  const out = Object.fromEntries(sessions.entries());
  fs.writeFileSync(SESSIONS_FILE, JSON.stringify(out, null, 2));
}

function persistOrders() {
  if (mode === 'mongo' && OrderModel) {
    Promise.all(orders.map(order =>
      OrderModel.updateOne({ order_id: order.order_id }, { $set: order }, { upsert: true }).exec()
    )).catch(err => console.error('⚠️ Order persistence failed:', err.message));
    return;
  }
  ensureDataDir();
  fs.writeFileSync(ORDERS_FILE, JSON.stringify(orders, null, 2));
}

function getSession(userId) {
  if (!sessions.has(userId)) {
    const session = normalizeSession({ user_id: userId });
    sessions.set(userId, session);
    persistSession(session);
  }
  return sessions.get(userId);
}

function touch(userId) {
  const session = getSession(userId);
  session.last_activity = Date.now();
  persistSession(session);
  return session;
}

function updateSessionState(userId, state) { const s = getSession(userId); s.state = state; touch(userId); }
function updateSessionCart(userId, cart) { const s = getSession(userId); s.cart = cart; touch(userId); }
function setPendingItem(userId, item) { const s = getSession(userId); s.pending_item = item || null; touch(userId); }
function setPendingCombo(userId, combo) { const s = getSession(userId); s.pending_combo = combo || null; touch(userId); }
function setLanguage(userId, lang) { const s = getSession(userId); s.lang = lang; touch(userId); }
function setLocation(userId, location) { const s = getSession(userId); s.location = location || null; touch(userId); }
function setLandmark(userId, landmark) { const s = getSession(userId); s.landmark = landmark || null; touch(userId); }
function setAddress(userId, address) { const s = getSession(userId); s.address = address || null; touch(userId); }

function resetSession(userId) {
  const existing = sessions.get(userId);
  const session = normalizeSession({ user_id: userId, lang: existing?.lang || null });
  sessions.set(userId, session);
  persistSession(session);
}

function generateOrderId() {
  const prefix = `TPP-${todayKey()}`;
  const todayOrders = orders.filter(o => String(o.order_id || '').startsWith(prefix));
  let seq = 0;
  for (const order of todayOrders) {
    const n = Number(String(order.order_id).split('-').pop());
    if (Number.isFinite(n)) seq = Math.max(seq, n);
  }
  return `${prefix}-${String(seq + 1).padStart(3, '0')}`;
}

async function createOrder(userId, userName, items, subtotal, total, details = {}) {
  const orderId = generateOrderId();
  const now = nowIso();
  const order = normalizeOrder({
    id: orders.length + 1,
    order_id: orderId,
    user_id: userId,
    user_name: userName || 'Customer',
    items,
    subtotal,
    total,
    free_delivery: true,
    payment_method: 'COD',
    location: details.location || null,
    landmark: details.landmark || null,
    address: details.address || null,
    language: details.language || 'en',
    status: 'received',
    created_at: now,
    updated_at: now,
  });
  orders.push(order);

  if (mode === 'mongo' && OrderModel) {
    await OrderModel.create(order);
  } else {
    persistOrders();
  }
  return orderId;
}

async function updateOrderStatus(orderId, status) {
  const order = orders.find(o => o.order_id === orderId);
  if (!order) return null;
  order.status = status;
  order.updated_at = nowIso();
  if (mode === 'mongo' && OrderModel) {
    await OrderModel.updateOne({ order_id: orderId }, { $set: { status, updated_at: order.updated_at } });
  } else {
    persistOrders();
  }
  return order;
}

function getOrders(status = null, limit = 100) {
  const filtered = status ? orders.filter(o => o.status === status) : orders;
  return filtered.slice().reverse().slice(0, Math.max(1, Math.min(limit, 500)));
}

function getTodayOrders() {
  const key = todayKey();
  return orders.filter(o => String(o.order_id || '').startsWith(`TPP-${key}`)).slice().reverse();
}

function getTodayStats() {
  const list = getTodayOrders();
  const nonCancelled = list.filter(o => o.status !== 'cancelled');
  return {
    count: nonCancelled.length,
    revenue: nonCancelled.reduce((sum, o) => sum + Number(o.total || 0), 0),
    received: list.filter(o => o.status === 'received').length,
    preparing: list.filter(o => o.status === 'preparing').length,
    ready: list.filter(o => o.status === 'ready').length,
    outForDelivery: list.filter(o => o.status === 'out_for_delivery').length,
    delivered: list.filter(o => o.status === 'delivered').length,
    cancelled: list.filter(o => o.status === 'cancelled').length,
  };
}

function getOrderById(orderId) { return orders.find(o => o.order_id === orderId) || null; }
function getTodayOrderCount() { return getTodayOrders().length; }
function getMongoose() { return mongoose; }
function getDatabaseMode() { return mode; }

module.exports = {
  initDatabase,
  getSession,
  updateSessionState,
  updateSessionCart,
  setPendingItem,
  setPendingCombo,
  setLanguage,
  setLocation,
  setLandmark,
  setAddress,
  resetSession,
  createOrder,
  updateOrderStatus,
  getOrders,
  getTodayOrders,
  getTodayStats,
  getOrderById,
  generateOrderId,
  getTodayOrderCount,
  getMongoose,
  getDatabaseMode,
};
