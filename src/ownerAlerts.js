require('dotenv').config();
const crypto = require('crypto');
const {
  getState, updateState, getOrderMeta, appendAudit, appendError,
} = require('./admin/adminStore');
const { getAllOrders, getOrderById, updateOrderStatus } = require('./db/database');

const ALERT_WINDOW_MS = 2 * 60 * 1000;
const REPEAT_MS = 20 * 1000;
const WATCH_MS = 3000;
let webPushModule = null;
let initialized = false;

function b64url(buf) {
  return Buffer.from(buf).toString('base64').replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'');
}
function generateVapidKeys() {
  const { publicKey, privateKey } = crypto.generateKeyPairSync('ec', {
    namedCurve: 'prime256v1',
    publicKeyEncoding: { format: 'jwk' },
    privateKeyEncoding: { format: 'jwk' },
  });
  const pub = Buffer.concat([Buffer.from([4]), Buffer.from(publicKey.x, 'base64url'), Buffer.from(publicKey.y, 'base64url')]);
  const priv = Buffer.from(privateKey.d, 'base64url');
  return { publicKey: b64url(pub), privateKey: b64url(priv) };
}

async function loadWebPush() {
  if (!webPushModule) webPushModule = await import('web-push-neo');
  return webPushModule;
}

async function ensureVapid() {
  const state = getState();
  if (state.pushConfig?.vapidPublicKey && state.pushConfig?.vapidPrivateKey) {
    return state.pushConfig;
  }
  const keys = generateVapidKeys();
  const subject = process.env.PUSH_VAPID_SUBJECT || state.pushConfig?.subject || 'mailto:owner@townpizzaplanet.local';
  await updateState(s => {
    s.pushConfig = { vapidPublicKey: keys.publicKey, vapidPrivateKey: keys.privateKey, subject };
    return s;
  });
  console.log('🔐 Owner web-push VAPID keys created and persisted in admin state.');
  return getState().pushConfig;
}

async function sendPush(subscription, payload, ttl=90) {
  try {
    const wp = await loadWebPush();
    const v = getState().pushConfig;
    return await wp.sendNotification(subscription, JSON.stringify(payload), {
      TTL: ttl,
      urgency: 'high',
      topic: `tpp-${String(payload.orderId || 'alert').slice(-24)}`,
      vapidDetails: { subject: v.subject, publicKey: v.vapidPublicKey, privateKey: v.vapidPrivateKey },
      signal: AbortSignal.timeout(10000),
    });
  } catch (err) {
    const status = Number(err?.statusCode || err?.status || 0);
    if (status === 404 || status === 410) {
      await updateState(s => { s.pushSubscriptions = (s.pushSubscriptions || []).filter(x => x.endpoint !== subscription.endpoint); return s; });
    }
    throw err;
  }
}

async function broadcast(payload, ttl=90) {
  const subs = [...(getState().pushSubscriptions || [])];
  let sent = 0;
  for (const sub of subs) {
    try { await sendPush(sub, payload, ttl); sent++; }
    catch (err) { console.error('⚠️ Owner push failed:', err?.message || err); }
  }
  return sent;
}

async function setAlert(orderId, patch) {
  await updateState(s => {
    const id = String(orderId);
    const current = s.orderMeta[id] || {};
    s.orderMeta[id] = { ...current, ownerAlert: { ...(current.ownerAlert || {}), ...patch } };
    return s;
  });
  return getOrderMeta(orderId).ownerAlert || {};
}

function alertView(order) {
  const meta = getOrderMeta(order.order_id) || {};
  const a = meta.ownerAlert || {};
  return {
    state: a.state || null,
    createdAt: a.createdAt || null,
    deadlineAt: a.deadlineAt || null,
    acknowledgedAt: a.acknowledgedAt || null,
    cancellationReason: a.cancellationReason || null,
    pending: a.state === 'pending' && order.status === 'received',
  };
}

async function createOrderAlert(order) {
  if (!order?.order_id) return;
  await ensureVapid();
  const createdAt = new Date(order.created_at || Date.now()).getTime();
  const deadlineAt = createdAt + ALERT_WINDOW_MS;
  await setAlert(order.order_id, { state: 'pending', createdAt: new Date(createdAt).toISOString(), deadlineAt: new Date(deadlineAt).toISOString(), acknowledgedAt: null, cancellationReason: null, lastPushAt: null });
  const sent = await broadcast({
    type: 'new-order', orderId: order.order_id, title: '🚨 NEW ORDER — TOWN PIZZA PLANET',
    body: `${order.user_name || 'Customer'} • ₹${Number(order.total || 0).toLocaleString('en-IN')} • ${order.delivery_zone || 'Delivery'}`,
    url: `/admin/?order=${encodeURIComponent(order.order_id)}`,
    deadlineAt,
  }, 60);
  await setAlert(order.order_id, { lastPushAt: new Date().toISOString(), lastPushSent: sent });
  return sent;
}

async function repeatPendingAlerts() {
  const now = Date.now();
  const orders = getAllOrders();
  for (const order of orders) {
    if (order.status !== 'received') continue;
    const meta = getOrderMeta(order.order_id) || {};
    const a = meta.ownerAlert || {};
    if (a.state !== 'pending' || !a.deadlineAt) continue;
    const deadline = new Date(a.deadlineAt).getTime();
    if (!Number.isFinite(deadline)) continue;
    if (now >= deadline) continue;
    const last = a.lastPushAt ? new Date(a.lastPushAt).getTime() : 0;
    if (now - last < REPEAT_MS) continue;
    try {
      const sent = await broadcast({
        type: 'new-order', orderId: order.order_id, title: '🚨 REMINDER — UNACKNOWLEDGED ORDER',
        body: `${order.user_name || 'Customer'} • ₹${Number(order.total || 0).toLocaleString('en-IN')} • ${Math.max(0, Math.ceil((deadline-now)/1000))}s left`,
        url: `/admin/?order=${encodeURIComponent(order.order_id)}`,
        deadlineAt: deadline,
      }, 60);
      await setAlert(order.order_id, { lastPushAt: new Date().toISOString(), lastPushSent: sent });
    } catch (err) { await appendError(err?.message || String(err), { task:'owner-alert-repeat', orderId:order.order_id }); }
  }
}

async function expirePendingOrders() {
  const now = Date.now();
  for (const order of getAllOrders()) {
    if (order.status !== 'received') continue;
    const meta = getOrderMeta(order.order_id) || {};
    const a = meta.ownerAlert || {};
    if (a.state !== 'pending' || !a.deadlineAt) continue;
    const deadline = new Date(a.deadlineAt).getTime();
    if (!Number.isFinite(deadline) || now < deadline) continue;
    try {
      const fresh = getOrderById(order.order_id);
      if (!fresh || fresh.status !== 'received') continue;
      await updateOrderStatus(order.order_id, 'cancelled');
      await setAlert(order.order_id, { state:'expired', cancellationReason:'Restaurant did not acknowledge the order within 2 minutes.', expiredAt:new Date().toISOString() });
      await appendAudit('order.auto_cancelled_unacknowledged', { orderId: order.order_id, deadlineAt: a.deadlineAt }, 'system');
    } catch (err) { await appendError(err?.message || String(err), { task:'owner-alert-expiry', orderId:order.order_id }); }
  }
}

async function acknowledgeOrder(orderId) {
  const order = getOrderById(orderId);
  if (!order) throw new Error('Order not found');
  const meta = getOrderMeta(orderId) || {};
  const a = meta.ownerAlert || {};
  if (order.status === 'cancelled' || a.state === 'expired') return { ok:false, expired:true };
  if (a.state !== 'pending') return { ok:true, already:true };
  const deadline = new Date(a.deadlineAt || 0).getTime();
  if (Number.isFinite(deadline) && Date.now() >= deadline) {
    await expirePendingOrders();
    return { ok:false, expired:true };
  }
  await setAlert(orderId, { state:'acknowledged', acknowledgedAt:new Date().toISOString() });
  await appendAudit('order.owner_alert_acknowledged', { orderId }, 'admin');
  return { ok:true, expired:false };
}

async function saveSubscription(subscription, meta={}) {
  if (!subscription?.endpoint) throw new Error('Invalid push subscription.');
  const now=new Date().toISOString();
  const deviceId=String(meta.deviceId||'').trim().slice(0,120) || crypto.createHash('sha256').update(String(subscription.endpoint)).digest('hex').slice(0,24);
  await updateState(s => {
    const list = Array.isArray(s.pushSubscriptions) ? s.pushSubscriptions : [];
    const clean = list.filter(x => x?.endpoint !== subscription.endpoint && x?.deviceId !== deviceId);
    clean.push({ deviceId, label:String(meta.label||'This device').slice(0,80), userAgent:String(meta.userAgent||'').slice(0,300), endpoint: subscription.endpoint, expirationTime: subscription.expirationTime || null, keys: { p256dh: subscription.keys?.p256dh || '', auth: subscription.keys?.auth || '' }, addedAt: clean.find(x=>x?.deviceId===deviceId)?.addedAt || now, updatedAt:now });
    s.pushSubscriptions = clean.slice(-20);
    return s;
  });
  return true;
}
function getSubscriptionStatus(){
  const list=Array.isArray(getState().pushSubscriptions)?getState().pushSubscriptions:[];
  return list.map(x=>({deviceId:x.deviceId||null,label:x.label||'This device',userAgent:x.userAgent||'',addedAt:x.addedAt||x.updatedAt||null,updatedAt:x.updatedAt||null,endpoint:x.endpoint||''}));
}
async function removeSubscription(endpoint) {
  await updateState(s=>{s.pushSubscriptions=(s.pushSubscriptions||[]).filter(x=>x.endpoint!==endpoint);return s;});
}
async function testPush() {
  await ensureVapid();
  return broadcast({ type:'test', title:'🔔 Town Pizza Planet Alerts', body:'Order alert system is connected.', url:'/admin/' }, 60);
}
async function initOwnerAlerts() {
  if (initialized) return;
  initialized = true;
  await ensureVapid();
  setInterval(() => expirePendingOrders().catch(e=>console.error('owner alert expiry:',e)), WATCH_MS);
  setInterval(() => repeatPendingAlerts().catch(e=>console.error('owner alert repeat:',e)), REPEAT_MS);
  console.log('🔔 Owner order-alert engine ready (2-minute acknowledgement window).');
}

module.exports = { initOwnerAlerts, ensureVapid, saveSubscription, getSubscriptionStatus, removeSubscription, testPush, createOrderAlert, acknowledgeOrder, expirePendingOrders, alertView };
