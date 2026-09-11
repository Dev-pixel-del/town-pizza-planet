// Town Pizza Planet — admin state store
// Keeps non-menu-code operational settings in one JSON/Mongo document.
const fs = require('fs');
const path = require('path');
const { getMongoose, getDatabaseMode } = require('../db/database');

const DATA_DIR = path.join(process.cwd(), 'data');
const STATE_FILE = path.join(DATA_DIR, 'admin_state.json');
let state = null;
let Model = null;

const DEFAULT_ZONES = [
  { id: 'devara-hipparagi', name: 'Devara Hipparagi', type: 'inside', minOrder: 0, deliveryCharge: 30, freeAbove: 199, estimatedMinutes: 30, enabled: true },
  { id: 'devoor', name: 'Devoor', type: 'outside', minOrder: 399, deliveryCharge: 50, freeAbove: 999, estimatedMinutes: 45, enabled: true },
  { id: 'ingalagi', name: 'Ingalagi', type: 'outside', minOrder: 399, deliveryCharge: 50, freeAbove: 999, estimatedMinutes: 45, enabled: true },
  { id: 'padaganur', name: 'Padaganur', type: 'outside', minOrder: 399, deliveryCharge: 50, freeAbove: 999, estimatedMinutes: 45, enabled: true },
  { id: 'mulasavalagi', name: 'Mulasavalagi', type: 'outside', minOrder: 399, deliveryCharge: 50, freeAbove: 999, estimatedMinutes: 45, enabled: true },
  { id: 'kannolli', name: 'Kannolli', type: 'outside', minOrder: 399, deliveryCharge: 60, freeAbove: 999, estimatedMinutes: 45, enabled: true },
  { id: 'shivanagi', name: 'Shivanagi', type: 'outside', minOrder: 399, deliveryCharge: 60, freeAbove: 999, estimatedMinutes: 45, enabled: true },
  { id: 'nivalkhed', name: 'Nivalkhed', type: 'outside', minOrder: 399, deliveryCharge: 50, freeAbove: 999, estimatedMinutes: 45, enabled: true },
];

const DEFAULT_TEMPLATES = {
  received: '🔔 *ORDER RECEIVED*\\nYour order #{order_id} has been received by Town Pizza Planet.',
  preparing: '🔥 *ORDER PREPARING*\\nYour order #{order_id} is now being prepared.',
  ready: '✅ *ORDER READY*\\nYour order #{order_id} is ready for dispatch.',
  out_for_delivery: '🛵 *OUT FOR DELIVERY*\\nYour order #{order_id} is on the way.',
  delivered: '🎉 *ORDER DELIVERED*\\nThank you for ordering from Town Pizza Planet!',
  daily_summary: '📊 *TOWN PIZZA PLANET — DAILY SUMMARY*\\nOrders: {orders}\\nSales: ₹{sales}\\nTop item: {top_item}',
};

function defaultState() {
  const businessHours = {};
  for (let d = 0; d < 7; d++) businessHours[d] = { open: '10:00', close: '23:00', enabled: true };
  return {
    version: 1,
    settings: {
      manualClosed: false,
      pauseNewOrders: false,
      enforceBusinessHours: false,
      businessHours,
      dailySummaryEnabled: false,
      dailySummaryHour: 23,
      dailySummaryMinute: 0,
      announcement: { enabled: false, text: '' },
      banner: { enabled: false, eyebrow: '', title: '', body: '', villages: '' },
      campaign: { enabled: false, title: '', body: '', startsOn: '', endsOn: '' },
      daySpecials: { 0: [], 1: [], 2: [], 3: [], 4: [], 5: [], 6: [] },
      comboOfDay: { 0: null, 1: null, 2: null, 3: null, 4: null, 5: null, 6: null },
    },
    availability: {},
    menuOverrides: {},
    customItems: [],
    customCategories: [],
    deletedItems: [],
    rawMaterials: [],
    expenseCategories: ['Ingredients'],
    packOverrides: { combo: {}, family: {} },
    deliveryZones: DEFAULT_ZONES.map(z => ({ ...z })),
    drivers: [],
    expenses: [],
    blockedCustomers: [],
    translations: {},
    messageTemplates: { ...DEFAULT_TEMPLATES },
    orderMeta: {},
    pushSubscriptions: [],
    pushConfig: { vapidPublicKey: '', vapidPrivateKey: '', subject: 'mailto:owner@townpizzaplanet.local' },
    auditLog: [],
    errorLog: [],
    lastDailySummaryDate: null,
  };
}

function ensureDir() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
}

function mergeDefaults(input) {
  const base = defaultState();
  if (!input || typeof input !== 'object') return base;
  const out = { ...base, ...input };
  out.settings = { ...base.settings, ...(input.settings || {}) };
  out.settings.businessHours = { ...base.settings.businessHours, ...(input.settings?.businessHours || {}) };
  out.settings.announcement = { ...base.settings.announcement, ...(input.settings?.announcement || {}) };
  out.settings.banner = { ...base.settings.banner, ...(input.settings?.banner || {}) };
  out.settings.campaign = { ...base.settings.campaign, ...(input.settings?.campaign || {}) };
  out.settings.daySpecials = { ...base.settings.daySpecials, ...(input.settings?.daySpecials || {}) };
  out.settings.comboOfDay = { ...base.settings.comboOfDay, ...(input.settings?.comboOfDay || {}) };
  out.packOverrides = { ...base.packOverrides, ...(input.packOverrides || {}) };
  out.messageTemplates = { ...base.messageTemplates, ...(input.messageTemplates || {}) };
  out.deliveryZones = Array.isArray(input.deliveryZones) && input.deliveryZones.length ? input.deliveryZones : base.deliveryZones;
  out.drivers = Array.isArray(input.drivers) ? input.drivers : [];
  out.expenses = Array.isArray(input.expenses) ? input.expenses : [];
  out.blockedCustomers = Array.isArray(input.blockedCustomers) ? input.blockedCustomers : [];
  out.auditLog = Array.isArray(input.auditLog) ? input.auditLog : [];
  out.errorLog = Array.isArray(input.errorLog) ? input.errorLog : [];
  out.orderMeta = input.orderMeta && typeof input.orderMeta === 'object' ? input.orderMeta : {};
  out.pushSubscriptions = Array.isArray(input.pushSubscriptions) ? input.pushSubscriptions : [];
  out.pushConfig = { ...base.pushConfig, ...(input.pushConfig || {}) };
  out.menuOverrides = input.menuOverrides && typeof input.menuOverrides === 'object' ? input.menuOverrides : {};
  out.customItems = Array.isArray(input.customItems) ? input.customItems : [];
  out.customCategories = Array.isArray(input.customCategories) ? input.customCategories : [];
  out.rawMaterials = Array.isArray(input.rawMaterials) ? input.rawMaterials : [];
  out.expenseCategories = Array.isArray(input.expenseCategories) && input.expenseCategories.length ? input.expenseCategories : ['Ingredients'];
  out.deletedItems = Array.isArray(input.deletedItems) ? input.deletedItems.map(x => String(x).toUpperCase()) : [];
  out.availability = input.availability && typeof input.availability === 'object' ? input.availability : {};
  out.translations = input.translations && typeof input.translations === 'object' ? input.translations : {};
  return out;
}

async function initAdminStore() {
  const mongo = getMongoose();
  if (getDatabaseMode() === 'mongo' && mongo) {
    Model = mongo.models.TPP_AdminState || mongo.model('TPP_AdminState', new mongo.Schema({ key: { type: String, unique: true, index: true }, payload: { type: Object } }, { collection: 'admin_state' }));
    const doc = await Model.findOne({ key: 'main' }).lean();
    state = mergeDefaults(doc?.payload || null);
    if (!doc) await Model.create({ key: 'main', payload: state });
    return state;
  }
  ensureDir();
  try {
    state = mergeDefaults(JSON.parse(fs.readFileSync(STATE_FILE, 'utf8')));
  } catch {
    state = defaultState();
    fs.writeFileSync(STATE_FILE, JSON.stringify(state, null, 2));
  }
  return state;
}

function getState() {
  if (!state) state = defaultState();
  return state;
}

async function persist() {
  if (!state) return;
  if (Model) {
    await Model.updateOne({ key: 'main' }, { $set: { payload: state } }, { upsert: true });
    return;
  }
  ensureDir();
  fs.writeFileSync(STATE_FILE, JSON.stringify(state, null, 2));
}

async function updateState(mutator) {
  const next = await mutator(getState());
  state = mergeDefaults(next || state);
  await persist();
  return state;
}

async function appendAudit(action, details = {}, actor = 'admin') {
  const s = getState();
  s.auditLog.unshift({ id: cryptoLikeId(), at: new Date().toISOString(), actor, action, details });
  s.auditLog = s.auditLog.slice(0, 500);
  await persist();
}

async function appendError(message, details = {}) {
  const s = getState();
  s.errorLog.unshift({ id: cryptoLikeId(), at: new Date().toISOString(), message: String(message), details });
  s.errorLog = s.errorLog.slice(0, 300);
  await persist();
}

function cryptoLikeId() {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 9)}`;
}

function clone(obj) { return JSON.parse(JSON.stringify(obj)); }
function getSettings() { return getState().settings; }
function getDeliveryZones() { return clone(getState().deliveryZones).filter(z => z.enabled !== false); }
function getAllDeliveryZones() { return clone(getState().deliveryZones); }
function getMenuOverride(id) { return getState().menuOverrides[String(id).toUpperCase()] || {}; }
function getPackOverride(type, id) { return getState().packOverrides?.[type]?.[String(id).toUpperCase()] || {}; }
function getAvailability(id, fallback = true) {
  const key = String(id).toUpperCase();
  return Object.prototype.hasOwnProperty.call(getState().availability, key) ? Boolean(getState().availability[key]) : fallback;
}
function isBlocked(phone) {
  const digits = String(phone || '').replace(/\D/g, '');
  return getState().blockedCustomers.some(x => String(x.phone || '').replace(/\D/g, '') === digits && x.enabled !== false);
}
function getOrderMeta(orderId) { return getState().orderMeta[String(orderId)] || {}; }

async function applyRawMaterialsForOrder(order, itemsOverride=null) {
  const items=Array.isArray(itemsOverride)?itemsOverride:(order?.items||[]);
  const orderId=String(order?.order_id||'');
  if(!orderId || !items.length) return false;
  let changed=false;
  await updateState(s=>{
    const meta=s.orderMeta[orderId]||{};
    if(meta.rawMaterialsApplied) return s;
    for(const item of items){
      if(item?.isCombo) continue;
      const category=String(item?.category||'').trim();
      if(!category) continue;
      const qty=Math.max(0,Number(item?.qty||0));
      if(!qty) continue;
      for(const m of (s.rawMaterials||[])){
        if(String(m.category||'')!==category) continue;
        const usage=Math.max(0,Number(m.usagePerDish||0));
        if(!usage) continue;
        m.quantity=Math.max(0,Number(m.quantity||0)-usage*qty);
        m.lastUsedAt=new Date().toISOString();
        changed=true;
      }
    }
    s.orderMeta[orderId]={...meta,rawMaterialsApplied:true};
    return s;
  });
  return changed;
}

module.exports = {
  initAdminStore,
  getState,
  updateState,
  persist,
  appendAudit,
  appendError,
  getSettings,
  getDeliveryZones,
  getAllDeliveryZones,
  getMenuOverride,
  getPackOverride,
  getAvailability,
  isBlocked,
  getOrderMeta,
  applyRawMaterialsForOrder,
  clone,
};
