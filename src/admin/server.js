require('dotenv').config();
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const express = require('express');
const {
  getOrders,
  getTodayOrders,
  getTodayStats,
  updateOrderStatus,
  getOrderById,
  getAllOrders,
} = require('../db/database');
const { createOrderRouter } = require('../web/orderApi');
const { categories, bestsellers } = require('../data/menu');
const { combos } = require('../data/combos');
const { familyPacks } = require('../data/familyPacks');
const { getCatalog } = require('../web/orderData');
const {
  initAdminStore,
  getState,
  getSettings,
  getAllDeliveryZones,
  updateState,
  appendAudit,
  appendError,
  getOrderMeta,
  clone,
} = require('./adminStore');

const app = express();
const sessions = new Map();
const loginAttempts = new Map();
let whatsappClient = null;
const COOKIE_NAME = 'tpp_admin_session';
const SESSION_TTL_MS = 12 * 60 * 60 * 1000;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'change-me-now';

app.disable('x-powered-by');
app.use(express.json({ limit: '12mb' }));
app.use(express.static(path.join(__dirname, 'public')));
app.use('/order', express.static(path.join(process.cwd(), 'public', 'order')));
app.use('/product-images', express.static(path.join(process.cwd(), 'public', 'product-images')));
app.use('/combo-images', express.static(path.join(process.cwd(), 'public', 'combo-images')));
app.use('/family-packs', express.static(path.join(process.cwd(), 'public', 'family-packs')));
app.use('/uploads', express.static(path.join(process.cwd(), 'public', 'uploads')));
app.use('/order', createOrderRouter(() => whatsappClient));
app.use('/api/order', createOrderRouter(() => whatsappClient));

function createToken() { return crypto.randomBytes(32).toString('hex'); }
function parseCookies(req) {
  const header = req.headers.cookie || '';
  return Object.fromEntries(header.split(';').filter(Boolean).map(pair => {
    const i = pair.indexOf('='); return [decodeURIComponent(pair.slice(0, i).trim()), decodeURIComponent(pair.slice(i + 1).trim())];
  }));
}
function clientIp(req) { return String(req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown').split(',')[0].trim(); }
function requireAuth(req, res, next) {
  const token = parseCookies(req)[COOKIE_NAME];
  const session = token ? sessions.get(token) : null;
  if (!session) return res.status(401).json({ success: false, error: 'Unauthorized' });
  if (Date.now() - session.createdAt > SESSION_TTL_MS) { sessions.delete(token); return res.status(401).json({ success:false,error:'Session expired' }); }
  session.lastSeen = Date.now();
  req.adminSession = session;
  next();
}
function safeNumber(v, fallback = 0) { const n = Number(v); return Number.isFinite(n) ? n : fallback; }
function digits(v) { return String(v || '').replace(/\D/g, ''); }
function isoDay(d = new Date()) { return new Date(d).toISOString().slice(0, 10); }
function withinDate(iso, from, to) {
  const day = isoDay(iso);
  return (!from || day >= from) && (!to || day <= to);
}
function allOrders() { return getAllOrders().map(decorateOrder); }
function decorateOrder(order) {
  const meta = clone(getOrderMeta(order.order_id) || {});
  const edited = meta.edits && typeof meta.edits === 'object' ? meta.edits : {};
  const out = { ...order, ...edited };
  out.items = Array.isArray(edited.items) ? edited.items : order.items;
  out.total = safeNumber(edited.total, order.total);
  out.subtotal = safeNumber(edited.subtotal, order.subtotal);
  out.delivery_charge = safeNumber(edited.delivery_charge, order.delivery_charge);
  out.admin = {
    notes: meta.notes || '',
    customerNote: meta.customerNote || '',
    driver: meta.driver || '',
    driverPhone: meta.driverPhone || '',
    driverAssignedAt: meta.driverAssignedAt || null,
    driverAutoAssigned: Boolean(meta.driverAutoAssigned),
    restaurantNote: meta.restaurantNote || out.restaurant_note || '',
    feedback: meta.feedback || null,
    codCollected: Boolean(meta.codCollected),
    cashReceived: safeNumber(meta.cashReceived),
    updatedAt: meta.updatedAt || null,
  };
  return out;
}
function getOrder(id) { const o = getOrderById(id); return o ? decorateOrder(o) : null; }
async function assignDriverToOrder(orderId, driver, auto=false) {
  if (!driver) return null;
  const now = new Date().toISOString();
  await updateState(s=>{
    const current=s.orderMeta[orderId]||{};
    s.orderMeta[orderId]={...current,driver:driver.name||'',driverPhone:driver.phone||'',driverAssignedAt:current.driverAssignedAt||now,driverAutoAssigned:Boolean(auto)};
    return s;
  });
  await appendAudit(auto?'order.driver_auto_assigned':'order.driver_assigned',{orderId,driver:driver.name,driverPhone:driver.phone});
  return driver;
}
async function ensureDriverAssignment(order) {
  const meta=getOrderMeta(order.order_id)||{};
  if (meta.driver || order.status==='cancelled') return meta;
  const age=Date.now()-new Date(order.created_at||Date.now()).getTime();
  if (age < 5*60*1000) return meta;
  const first=clone(getState().drivers||[]).find(d=>d.active!==false);
  if (!first) return meta;
  await assignDriverToOrder(order.order_id,first,true);
  return getOrderMeta(order.order_id)||{};
}
async function autoAssignPendingDrivers() {
  try {
    const activeStatuses=new Set(['received','preparing','ready','out_for_delivery']);
    for (const raw of getAllOrders()) {
      if (!activeStatuses.has(raw.status)) continue;
      await ensureDriverAssignment(raw);
    }
  } catch (err) { await appendError(err.message,{task:'auto-driver-assignment'}); }
}
function customerKey(order) { return digits(String(order.user_id || '').split('@')[0]); }
function formatMoney(n) { return `₹${safeNumber(n).toLocaleString('en-IN')}`; }
function statusLabel(s) { return String(s || '').replaceAll('_', ' '); }
function itemCost(itemId, packType = null) {
  const s = getState();
  if (packType) return safeNumber(s.packOverrides?.[packType]?.[itemId]?.cost, 0);
  return safeNumber(s.menuOverrides?.[itemId]?.cost, 0);
}
function orderFoodCost(order) {
  return (order.items || []).reduce((sum, item) => sum + itemCost(item.id, item.isCombo ? (item.packType || 'combo') : null) * safeNumber(item.qty, 0), 0);
}
function orderProfit(order) { return safeNumber(order.total) - orderFoodCost(order); }
function filteredOrders(query = {}) {
  let list = allOrders();
  if (query.status && query.status !== 'all') list = list.filter(o => o.status === query.status);
  if (query.zone) list = list.filter(o => String(o.delivery_zone_id || o.delivery_zone || '').toLowerCase() === query.zone.toLowerCase());
  if (query.source) list = list.filter(o => String(o.source || '').toLowerCase() === query.source.toLowerCase());
  if (query.payment) list = list.filter(o => String(o.payment_method || '').toLowerCase() === query.payment.toLowerCase());
  if (query.from || query.to) list = list.filter(o => withinDate(o.created_at, query.from, query.to));
  if (query.search) {
    const q = String(query.search).toLowerCase();
    list = list.filter(o => [o.order_id, o.user_name, o.user_id, o.address, o.landmark, o.delivery_zone].join(' ').toLowerCase().includes(q));
  }
  return list.slice(0, Math.min(Math.max(Number(query.limit) || 200, 1), 1000));
}
function csvEscape(v) { const s = String(v ?? ''); return `"${s.replace(/"/g, '""')}"`; }
function sendCsv(res, filename, rows) {
  const csv = rows.map(r => r.map(csvEscape).join(',')).join('\n');
  res.setHeader('Content-Type', 'text/csv; charset=utf-8');
  res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
  res.send(csv);
}
function renderTemplate(template, order) {
  return String(template || '')
    .replaceAll('{order_id}', order.order_id || '')
    .replaceAll('{customer}', order.user_name || 'Customer')
    .replaceAll('{total}', formatMoney(order.total))
    .replaceAll('{zone}', order.delivery_zone || '')
    .replaceAll('{status}', statusLabel(order.status));
}
function buildNewOrderMessage(order) {
  return ['🔔 *TOWN PIZZA PLANET — ORDER*',`🆔 ${order.order_id}`,`👤 ${order.user_name}`,`📱 ${digits(order.user_id)}`,...(order.items || []).map((i, n) => `${n + 1}. ${i.name} × ${i.qty} — ₹${safeNumber(i.price) * safeNumber(i.qty)}`),'',`💰 *TOTAL: ${formatMoney(order.total)}*`,`🚚 ${order.delivery_zone || 'Delivery'}`,`🏠 ${order.address || ''}`,order.landmark ? `📌 ${order.landmark}` : null,`💵 ${order.payment_method || 'COD'}`].filter(Boolean).join('\n');
}
async function sendStatusNotificationSafe(client, chatId, message) {
  if (!client || !chatId) return false;
  if (global.__TPP_WHATSAPP_READY !== true) {
    const started = Date.now(); while (global.__TPP_WHATSAPP_READY !== true && Date.now() - started < 15000) await new Promise(r => setTimeout(r, 500));
  }
  if (global.__TPP_WHATSAPP_READY !== true) return false;
  for (let attempt = 1; attempt <= 3; attempt++) {
    try { await client.sendMessage(chatId, message); return true; } catch (err) {
      const msg = String(err?.message || err); const transient = /Execution context was destroyed|Target closed|Session closed|detached|not connected|Protocol error/i.test(msg);
      if (!transient || attempt === 3) { console.error('Status notification failed:', msg); return false; }
      await new Promise(r => setTimeout(r, 1200 * attempt));
    }
  }
  return false;
}
function overview(list) {
  const nonCancelled = list.filter(o => o.status !== 'cancelled');
  const revenue = nonCancelled.reduce((s, o) => s + safeNumber(o.total), 0);
  const foodCost = nonCancelled.reduce((s, o) => s + orderFoodCost(o), 0);
  const expenses = getState().expenses.filter(e => withinDate(e.date, list.length ? isoDay(list[list.length - 1].created_at) : null, null));
  return { orders:list.length, sales:revenue, averageOrder:list.length ? revenue/list.length : 0, foodCost, grossProfit:revenue-foodCost, expenses:expenses.reduce((s,e)=>s+safeNumber(e.amount),0), pending:list.filter(o=>['received','preparing','ready','out_for_delivery'].includes(o.status)).length };
}

app.get('/healthz', (req, res) => res.json({ status:'ok', service:'Town Pizza Planet', whatsapp:global.__TPP_WHATSAPP_READY === true }));
app.post('/api/login', async (req, res) => {
  const ip = clientIp(req); const now = Date.now(); const attempt = loginAttempts.get(ip) || { count:0, started:now };
  if (now - attempt.started > 10 * 60 * 1000) { attempt.count=0; attempt.started=now; }
  const password = String(req.body?.password || '');
  if (attempt.count >= 7) return res.status(429).json({ success:false,error:'Too many login attempts. Try again later.' });
  if (!password || password !== ADMIN_PASSWORD) { attempt.count++; loginAttempts.set(ip, attempt); return res.status(401).json({ success:false,error:'Invalid password' }); }
  loginAttempts.delete(ip); const token=createToken(); sessions.set(token,{ createdAt:now,lastSeen:now });
  const secure = req.secure === true || String(req.headers['x-forwarded-proto'] || '').toLowerCase() === 'https';
  res.setHeader('Set-Cookie', `${COOKIE_NAME}=${encodeURIComponent(token)}; HttpOnly; Path=/; SameSite=Lax${secure ? '; Secure' : ''}`);
  res.json({ success:true });
});
app.post('/api/logout', requireAuth, (req,res)=>{const token=parseCookies(req)[COOKIE_NAME];sessions.delete(token);res.setHeader('Set-Cookie',`${COOKIE_NAME}=; Max-Age=0; HttpOnly; Path=/; SameSite=Lax`);res.json({success:true});});
app.get('/api/me', requireAuth, (req,res)=>res.json({success:true,store:process.env.STORE_NAME||'Town Pizza Planet',sessionExpiresAt:req.adminSession.createdAt+SESSION_TTL_MS}));

app.get('/api/dashboard', requireAuth, async (req,res)=>{
  await autoAssignPendingDrivers();
  const today = getTodayOrders().map(decorateOrder); const stats = getTodayStats();
  const last7 = allOrders().filter(o=>new Date(o.created_at)>=new Date(Date.now()-6*86400000));
  const byDay = {}; last7.forEach(o=>{const d=isoDay(o.created_at);if(o.status!=='cancelled')byDay[d]=(byDay[d]||0)+safeNumber(o.total);});
  const trend=[]; for(let i=6;i>=0;i--){const d=new Date();d.setDate(d.getDate()-i);const key=isoDay(d);trend.push({date:key,label:key.slice(5),sales:byDay[key]||0});}
  const topItems = {}; last7.forEach(o=>(o.items||[]).forEach(i=>{const k=i.id||i.name;topItems[k]=topItems[k]||{id:k,name:i.name,qty:0,sales:0};topItems[k].qty+=safeNumber(i.qty);topItems[k].sales+=safeNumber(i.qty)*safeNumber(i.price);}));
  res.json({success:true,stats,orders:today.slice(0,80),trend,topItems:Object.values(topItems).sort((a,b)=>b.qty-a.qty).slice(0,10),overview:overview(today),system:{database:require('../db/database').getDatabaseMode(),whatsapp:global.__TPP_WHATSAPP_READY===true,uptime:process.uptime(),memory:process.memoryUsage().rss}});
});

app.get('/api/orders/today', requireAuth, (req,res)=>res.json({success:true,orders:getTodayOrders().map(decorateOrder)}));
app.get('/api/orders', requireAuth, async (req,res)=>{const list=filteredOrders(req.query);for(const o of list) await ensureDriverAssignment(o);res.json({success:true,orders:list.map(o=>decorateOrder(o))});});
app.get('/api/orders/:orderId', requireAuth, (req,res)=>{const order=getOrder(req.params.orderId);if(!order)return res.status(404).json({success:false,error:'Order not found'});res.json({success:true,order});});
app.put('/api/orders/:orderId/status', requireAuth, async (req,res)=>{
  const valid=['received','preparing','ready','out_for_delivery','delivered','cancelled']; const status=String(req.body?.status||''); if(!valid.includes(status))return res.status(400).json({success:false,error:'Invalid status'});
  const order=await updateOrderStatus(req.params.orderId,status); if(!order)return res.status(404).json({success:false,error:'Order not found'});
  await appendAudit('order.status_changed',{orderId:order.order_id,status});
  const tpl=getSettings().messageTemplates?.[status]; const message=tpl?renderTemplate(tpl,order):(global.__TPP_STATUS_MESSAGE?global.__TPP_STATUS_MESSAGE(status,order.order_id,order.language||'en'):null);
  if(whatsappClient && order.user_id && message) void sendStatusNotificationSafe(whatsappClient,order.user_id,message);
  res.json({success:true,order:decorateOrder(order)});
});
app.put('/api/orders/:orderId/meta', requireAuth, async (req,res)=>{
  const o=getOrderById(req.params.orderId);if(!o)return res.status(404).json({success:false,error:'Order not found'});
  const body=req.body||{};
  let selectedDriver=null;
  if(body.driverId){ selectedDriver=(getState().drivers||[]).find(d=>d.id===String(body.driverId) && d.active!==false) || null; }
  await updateState(s=>{
    const current=s.orderMeta[o.order_id]||{};
    const driverName=selectedDriver ? String(selectedDriver.name||'') : String(body.driver!==undefined ? body.driver : current.driver||'');
    const driverPhone=selectedDriver ? String(selectedDriver.phone||'') : String(body.driverPhone!==undefined ? body.driverPhone : current.driverPhone||'');
    s.orderMeta[o.order_id]={...current,
      notes:String(body.notes ?? current.notes ?? ''),
      customerNote:String(body.customerNote ?? current.customerNote ?? ''),
      driver:driverName,
      driverPhone,
      driverAssignedAt: selectedDriver ? (current.driverAssignedAt || new Date().toISOString()) : (current.driverAssignedAt||null),
      driverAutoAssigned: selectedDriver ? false : Boolean(current.driverAutoAssigned),
      restaurantNote:String(body.restaurantNote ?? current.restaurantNote ?? ''),
      codCollected:body.codCollected===undefined?Boolean(current.codCollected):Boolean(body.codCollected),
      cashReceived:body.cashReceived===undefined?safeNumber(current.cashReceived):Math.max(0,safeNumber(body.cashReceived)),
      updatedAt:new Date().toISOString()
    };
    return s;
  });
  await appendAudit('order.meta_updated',{orderId:o.order_id,driver:driverNameForAudit(selectedDriver,body,o)});
  res.json({success:true,order:getOrder(o.order_id)});
});
function driverNameForAudit(selectedDriver,body,o){ return selectedDriver ? selectedDriver.name : (body.driver || getOrderMeta(o.order_id)?.driver || ''); }
app.post('/api/orders/:orderId/assign-driver', requireAuth, async (req,res)=>{
  try {
    const order=getOrder(req.params.orderId); if(!order)return res.status(404).json({success:false,error:'Order not found'});
    const driverId=String(req.body?.driverId||'').trim();
    const driver=(getState().drivers||[]).find(d=>d.id===driverId && d.active!==false);
    if(!driver)return res.status(400).json({success:false,error:'Please choose an active driver.'});
    const assigned=await assignDriverToOrder(order.order_id,driver,false);
    res.json({success:true,driver:assigned,order:getOrder(order.order_id)});
  } catch(err){await appendError(err.message,{route:'/api/orders/:orderId/assign-driver'});res.status(500).json({success:false,error:'Could not assign driver.'});}
});
app.put('/api/orders/:orderId/edit', requireAuth, async (req,res)=>{
  const o=getOrderById(req.params.orderId);if(!o)return res.status(404).json({success:false,error:'Order not found'});const b=req.body||{};
  const edits={}; if(Array.isArray(b.items)) edits.items=b.items.filter(i=>i&&i.id&&Number(i.qty)>0).map(i=>({...i,qty:Math.min(50,Math.max(1,Math.floor(Number(i.qty))))}));
  if(typeof b.address==='string')edits.address=b.address.trim();if(typeof b.landmark==='string')edits.landmark=b.landmark.trim();
  if(Array.isArray(edits.items)){edits.subtotal=edits.items.reduce((s,i)=>s+safeNumber(i.price)*safeNumber(i.qty),0);edits.delivery_charge=b.delivery_charge===undefined?safeNumber(o.delivery_charge):safeNumber(b.delivery_charge);edits.total=edits.subtotal+edits.delivery_charge;}
  await updateState(s=>{s.orderMeta[o.order_id]={...(s.orderMeta[o.order_id]||{}),edits:{...(s.orderMeta[o.order_id]?.edits||{}),...edits},updatedAt:new Date().toISOString()};return s;});
  await appendAudit('order.edited',{orderId:o.order_id});res.json({success:true,order:getOrder(o.order_id)});
});
app.post('/api/orders/:orderId/resend', requireAuth, async (req,res)=>{const o=getOrder(req.params.orderId);if(!o)return res.status(404).json({success:false,error:'Order not found'});const owner=digits(process.env.OWNER_PHONE);if(!whatsappClient||!owner)return res.status(503).json({success:false,error:'WhatsApp owner notification is not available.'});const ok=await sendStatusNotificationSafe(whatsappClient,`${owner}@c.us`,buildNewOrderMessage(o));await appendAudit('order.notification_resent',{orderId:o.order_id,ok});res.json({success:ok});});

app.get('/api/search', requireAuth, (req,res)=>{const q=String(req.query.q||'').trim().toLowerCase();if(!q)return res.json({success:true,results:[]});const out=[];for(const o of allOrders()){const hay=`${o.order_id||''} ${o.user_name||''} ${o.user_id||''} ${o.phone||''} ${o.address||''} ${o.delivery_zone||''}`.toLowerCase();if(hay.includes(q))out.push({type:'order',id:o.order_id,title:`Order ${o.order_id}`,subtitle:`${o.user_name||'Customer'} · ${formatMoney(o.total)}`,status:o.status});}const cat=getCatalog();for(const c of cat.categories||[]){for(const i of c.items||[]){const hay=`${i.id} ${i.name} ${c.name||''}`.toLowerCase();if(hay.includes(q))out.push({type:'menu',id:i.id,title:i.name,subtitle:`${formatMoney(i.price)} · ${c.name||''}`,available:i.available!==false});}}for(const p of [...(cat.combos||[]),...(cat.familyPacks||[])]){const hay=`${p.id} ${p.name} ${p.description||''}`.toLowerCase();if(hay.includes(q))out.push({type:'pack',id:p.id,title:p.name,subtitle:`${formatMoney(p.price)}`,available:p.available!==false});}const seen=new Set();res.json({success:true,results:out.filter(x=>{const k=x.type+':'+x.id;if(seen.has(k))return false;seen.add(k);return true}).slice(0,50)});});

app.get('/api/customers', requireAuth, (req,res)=>{
  const map=new Map(); const q=String(req.query.search||'').toLowerCase();
  for(const o of allOrders()){const phone=customerKey(o);if(!phone)continue;const c=map.get(phone)||{phone,name:o.user_name||'Customer',orders:0,spent:0,lastOrder:o.created_at,favourite:{}};c.orders++;if(o.status!=='cancelled')c.spent+=safeNumber(o.total);if(new Date(o.created_at)>new Date(c.lastOrder))c.lastOrder=o.created_at;for(const i of o.items||[]){c.favourite[i.id||i.name]=(c.favourite[i.id||i.name]||0)+safeNumber(i.qty);}map.set(phone,c);}
  let out=[...map.values()].map(c=>({...c,avgOrder:c.orders?c.spent/c.orders:0,favouriteItem:Object.entries(c.favourite).sort((a,b)=>b[1]-a[1])[0]?.[0]||''}));if(q)out=out.filter(c=>`${c.phone} ${c.name} ${c.favouriteItem}`.toLowerCase().includes(q));out.sort((a,b)=>b.spent-a.spent);res.json({success:true,customers:out});
});
app.get('/api/customers/:phone/orders', requireAuth, (req,res)=>{const p=digits(req.params.phone);res.json({success:true,orders:allOrders().filter(o=>customerKey(o)===p).sort((a,b)=>new Date(b.created_at)-new Date(a.created_at))});});

app.get('/api/menu', requireAuth, (req,res)=>{
  const catalog=getCatalog();
  res.json({success:true,catalog,base:{categories,combos,familyPacks,bestsellers},customCategories:getState().customCategories||[],deletedItems:getState().deletedItems||[]});
});

app.post('/api/categories', requireAuth, async (req,res)=>{
  const b=req.body||{};
  const name=String(b.name||'').trim();
  const emoji=String(b.emoji||'🍽️').trim().slice(0,8) || '🍽️';
  if(name.length<2) return res.status(400).json({success:false,error:'Category name must be at least 2 characters.'});
  const slug=name.toLowerCase().normalize('NFKD').replace(/[^a-z0-9]+/g,'-').replace(/^-+|-+$/g,'').slice(0,36) || `category-${Date.now()}`;
  const key=`custom-${slug}`;
  const existing=getCatalog().categories.some(c=>c.key===key);
  if(existing) return res.status(409).json({success:false,error:'A category with this name already exists.'});
  await updateState(s=>{
    if(s.customCategories.some(c=>c.key===key)) throw new Error('A category with this name already exists.');
    s.customCategories.push({key,name,emoji});
    return s;
  });
  await appendAudit('category.created',{key,name,emoji});
  res.json({success:true,category:{key,name,emoji},catalog:getCatalog()});
});

app.delete('/api/categories/:key', requireAuth, async (req,res)=>{
  const key=String(req.params.key||'').trim();
  if(categories.some(c=>c.key===key)) return res.status(400).json({success:false,error:'Built-in categories cannot be deleted.'});
  const found=(getState().customCategories||[]).find(c=>c.key===key);
  if(!found) return res.status(404).json({success:false,error:'Custom category not found.'});
  await updateState(s=>{
    s.customCategories=s.customCategories.filter(c=>c.key!==key);
    s.customItems=(s.customItems||[]).filter(i=>i.category!==key);
    return s;
  });
  await appendAudit('category.deleted',{key,name:found.name});
  res.json({success:true,catalog:getCatalog()});
});

app.post('/api/menu', requireAuth, async (req,res)=>{
  const b=req.body||{};
  const cat=String(b.category||'').trim();
  const categoryExists=getCatalog().categories.some(c=>c.key===cat);
  if(!categoryExists) return res.status(400).json({success:false,error:'Invalid category'});
  const builtInPrefix={pizzas:'P',burgers:'B',sandwichesAndSides:'S',milkshakes:'M',drinks:'D'}[cat];
  const prefix=builtInPrefix||'N';
  const ids=[...categories.flatMap(c=>c.items),...(getState().customItems||[])].filter(i=>String(i.id||'').toUpperCase().startsWith(prefix)).map(i=>Number(String(i.id).slice(1))||0);
  const id=`${prefix}${Math.max(0,...ids)+1}`;
  const name=String(b.name||'').trim();
  if(name.length<2) return res.status(400).json({success:false,error:'Dish name is required.'});
  await updateState(s=>{
    s.deletedItems=(s.deletedItems||[]).filter(x=>String(x).toUpperCase()!==id);
    s.customItems.push({id,name,price:safeNumber(b.price),image:String(b.image||''),category:cat,variants:Array.isArray(b.variants)?b.variants:undefined,available:b.available!==false});
    s.menuOverrides[id]={cost:safeNumber(b.cost),translations:b.translations&&typeof b.translations==='object'?b.translations:{}};
    s.availability[id]=b.available!==false;
    return s;
  });
  await appendAudit('menu.created',{id,category:cat});
  res.json({success:true,id,catalog:getCatalog()});
});

app.put('/api/menu/:id', requireAuth, async (req,res)=>{
  const id=String(req.params.id).toUpperCase();
  const b=req.body||{};
  const all= getCatalog().categories.flatMap(c=>c.items);
  if(!all.some(i=>i.id===id)) return res.status(404).json({success:false,error:'Menu item not found.'});
  await updateState(s=>{
    s.menuOverrides[id]={...(s.menuOverrides[id]||{}),name:typeof b.name==='string'?b.name.trim():s.menuOverrides[id]?.name,price:b.price===''||b.price===undefined?s.menuOverrides[id]?.price:safeNumber(b.price),cost:b.cost===''||b.cost===undefined?s.menuOverrides[id]?.cost:safeNumber(b.cost),image:typeof b.image==='string'?b.image.trim():s.menuOverrides[id]?.image,variants:Array.isArray(b.variants)?b.variants:null,translations:b.translations&&typeof b.translations==='object'?b.translations:s.menuOverrides[id]?.translations||{}};
    if(b.available!==undefined)s.availability[id]=Boolean(b.available);
    s.deletedItems=(s.deletedItems||[]).filter(x=>String(x).toUpperCase()!==id);
    return s;
  });
  await appendAudit('menu.updated',{id});
  res.json({success:true,catalog:getCatalog()});
});

app.delete('/api/menu/:id', requireAuth, async (req,res)=>{
  const id=String(req.params.id||'').toUpperCase();
  const catalog=getCatalog();
  const target=catalog.categories.flatMap(c=>c.items).find(i=>i.id===id);
  if(!target) return res.status(404).json({success:false,error:'Menu item not found.'});
  await updateState(s=>{
    s.deletedItems=Array.from(new Set([...(s.deletedItems||[]).map(x=>String(x).toUpperCase()),id]));
    s.customItems=(s.customItems||[]).filter(i=>String(i.id).toUpperCase()!==id);
    delete s.menuOverrides[id];
    delete s.availability[id];
    for(const day of Object.keys(s.settings?.daySpecials||{})){s.settings.daySpecials[day]=(s.settings.daySpecials[day]||[]).filter(x=>String(x).toUpperCase()!==id);}
    return s;
  });
  await appendAudit('menu.deleted',{id,name:target.name,category:target.category});
  res.json({success:true,catalog:getCatalog()});
});
app.put('/api/availability/:id', requireAuth, async (req,res)=>{const id=String(req.params.id).toUpperCase();await updateState(s=>{s.availability[id]=Boolean(req.body?.available);return s;});await appendAudit('availability.changed',{id,available:Boolean(req.body?.available)});res.json({success:true,available:Boolean(req.body?.available)});});

app.get('/api/packs/:type', requireAuth, (req,res)=>{const type=req.params.type==='family'?'family':'combo';res.json({success:true,packs:getCatalog()[type==='family'?'familyPacks':'combos']});});
app.put('/api/packs/:type/:id', requireAuth, async (req,res)=>{const type=req.params.type==='family'?'family':'combo';const id=String(req.params.id).toUpperCase();const b=req.body||{};await updateState(s=>{s.packOverrides[type][id]={...(s.packOverrides[type][id]||{}),name:String(b.name??'').trim()||s.packOverrides[type][id]?.name,description:String(b.description??'').trim(),items:Array.isArray(b.items)?b.items.map(String):s.packOverrides[type][id]?.items||[],price:safeNumber(b.price,s.packOverrides[type][id]?.price||0),cost:safeNumber(b.cost,s.packOverrides[type][id]?.cost||0),image:typeof b.image==='string'?b.image.trim():s.packOverrides[type][id]?.image,translations:b.translations&&typeof b.translations==='object'?b.translations:s.packOverrides[type][id]?.translations||{}};if(b.available!==undefined)s.availability[id]=Boolean(b.available);return s;});await appendAudit('pack.updated',{type,id});res.json({success:true,packs:getCatalog()[type==='family'?'familyPacks':'combos']});});
app.post('/api/packs/:type', requireAuth, async (req,res)=>{const type=req.params.type==='family'?'family':'combo';const source=getCatalog()[type==='family'?'familyPacks':'combos'];const prefix=type==='family'?'F':'C';const max=source.reduce((m,x)=>Math.max(m,Number(String(x.id).slice(1))||0),0);const id=`${prefix}${max+1}`;const b=req.body||{};await updateState(s=>{s.packOverrides[type][id]={name:String(b.name||id).trim(),description:String(b.description||'').trim(),items:Array.isArray(b.items)?b.items.map(String):[],price:safeNumber(b.price),cost:safeNumber(b.cost),image:String(b.image||''),translations:b.translations&&typeof b.translations==='object'?b.translations:{}};return s;});await appendAudit('pack.created',{type,id});res.json({success:true,id,packs:getCatalog()[type==='family'?'familyPacks':'combos']});});

app.get('/api/zones', requireAuth, (req,res)=>res.json({success:true,zones:getAllDeliveryZones()}));
app.put('/api/zones/:id', requireAuth, async (req,res)=>{const id=String(req.params.id);const b=req.body||{};await updateState(s=>{const z=s.deliveryZones.find(x=>x.id===id);if(!z)throw new Error('Zone not found');Object.assign(z,{name:String(b.name??z.name),type:b.type==='outside'?'outside':'inside',minOrder:safeNumber(b.minOrder,z.minOrder),deliveryCharge:safeNumber(b.deliveryCharge,z.deliveryCharge),freeAbove:safeNumber(b.freeAbove,z.freeAbove),estimatedMinutes:safeNumber(b.estimatedMinutes,z.estimatedMinutes),enabled:b.enabled===undefined?z.enabled:Boolean(b.enabled)});return s;});await appendAudit('delivery_zone.updated',{id});res.json({success:true,zones:getAllDeliveryZones()});});
app.post('/api/zones', requireAuth, async (req,res)=>{const b=req.body||{};const id=String(b.id||b.name||'zone').toLowerCase().trim().replace(/[^a-z0-9]+/g,'-');await updateState(s=>{if(s.deliveryZones.some(z=>z.id===id))throw new Error('Zone ID already exists');s.deliveryZones.push({id,name:String(b.name||id),type:b.type==='outside'?'outside':'inside',minOrder:safeNumber(b.minOrder,0),deliveryCharge:safeNumber(b.deliveryCharge,0),freeAbove:safeNumber(b.freeAbove,0),estimatedMinutes:safeNumber(b.estimatedMinutes,30),enabled:true});return s;});await appendAudit('delivery_zone.created',{id});res.json({success:true,zones:getAllDeliveryZones()});});
app.delete('/api/zones/:id', requireAuth, async (req,res)=>{const id=String(req.params.id);await updateState(s=>{s.deliveryZones=s.deliveryZones.filter(z=>z.id!==id);return s;});await appendAudit('delivery_zone.deleted',{id});res.json({success:true,zones:getAllDeliveryZones()});});

app.get('/api/drivers', requireAuth, (req,res)=>res.json({success:true,drivers:clone(getState().drivers)}));
app.post('/api/drivers', requireAuth, async (req,res)=>{const b=req.body||{};const driver={id:`drv-${Date.now()}`,name:String(b.name||'').trim(),phone:digits(b.phone),active:b.active!==false};if(!driver.name)return res.status(400).json({success:false,error:'Driver name required'});await updateState(s=>{s.drivers.push(driver);return s;});await appendAudit('driver.created',{id:driver.id});res.json({success:true,drivers:clone(getState().drivers)});});
app.put('/api/drivers/:id', requireAuth, async (req,res)=>{const b=req.body||{};await updateState(s=>{const d=s.drivers.find(x=>x.id===req.params.id);if(!d)throw new Error('Driver not found');Object.assign(d,{name:String(b.name??d.name),phone:digits(b.phone??d.phone),active:b.active===undefined?d.active:Boolean(b.active)});return s;});await appendAudit('driver.updated',{id:req.params.id});res.json({success:true,drivers:clone(getState().drivers)});});
app.delete('/api/drivers/:id', requireAuth, async (req,res)=>{await updateState(s=>{s.drivers=s.drivers.filter(x=>x.id!==req.params.id);return s;});await appendAudit('driver.deleted',{id:req.params.id});res.json({success:true,drivers:clone(getState().drivers)});});

app.get('/api/combo-of-day', requireAuth, (req,res)=>res.json({success:true,comboOfDay:clone(getSettings().comboOfDay||{}),packs:getCatalog().combos.concat(getCatalog().familyPacks.map(x=>({...x,packType:'family'})))}));
app.put('/api/combo-of-day', requireAuth, async (req,res)=>{
  const b=req.body||{}; const day=String(b.day); if(!/^[0-6]$/.test(day))return res.status(400).json({success:false,error:'Invalid day'});
  const packId=String(b.packId||'').toUpperCase().trim(); const packType=b.packType==='family'?'family':'combo';
  const source=packType==='family'?getCatalog().familyPacks:getCatalog().combos; const pack=source.find(x=>String(x.id).toUpperCase()===packId);
  if(!pack)return res.status(400).json({success:false,error:'Pack not found'});
  const name=String(b.name||'').trim()||pack.name;
  await updateState(s=>{s.settings.comboOfDay[day]={enabled:b.enabled!==false,packId,packType,name};return s;});
  await appendAudit('combo_of_day.updated',{day,packId,packType,name});
  res.json({success:true,comboOfDay:clone(getSettings().comboOfDay)});
});
app.delete('/api/combo-of-day/:day', requireAuth, async(req,res)=>{const day=String(req.params.day);await updateState(s=>{s.settings.comboOfDay[day]=null;return s;});await appendAudit('combo_of_day.cleared',{day});res.json({success:true,comboOfDay:clone(getSettings().comboOfDay)});});

app.get('/api/settings', requireAuth, (req,res)=>res.json({success:true,settings:clone(getSettings()),templates:clone(getState().messageTemplates)}));
app.put('/api/settings', requireAuth, async (req,res)=>{const b=req.body||{};await updateState(s=>{s.settings={...s.settings,...(b.settings||{})};if(b.businessHours)s.settings.businessHours={...s.settings.businessHours,...b.businessHours};if(b.announcement)s.settings.announcement={...s.settings.announcement,...b.announcement};if(b.banner)s.settings.banner={...s.settings.banner,...b.banner};if(b.campaign)s.settings.campaign={...s.settings.campaign,...b.campaign};if(b.daySpecials)s.settings.daySpecials={...s.settings.daySpecials,...b.daySpecials};if(b.templates)s.messageTemplates={...s.messageTemplates,...b.templates};return s;});await appendAudit('settings.updated',Object.keys(b));res.json({success:true,settings:clone(getSettings()),templates:clone(getState().messageTemplates)});});

app.get('/api/raw-materials', requireAuth, (req,res)=>res.json({success:true,rawMaterials:clone(getState().rawMaterials||[])}));
app.post('/api/raw-materials', requireAuth, async (req,res)=>{
  const b=req.body||{}; const name=String(b.name||'').trim().replace(/\s+/g,' ');
  const category=String(b.category||'').trim(); const unit=String(b.unit||'pcs').trim()||'pcs';
  const quantity=Math.max(0,safeNumber(b.quantity,0)); const usagePerDish=Math.max(0,safeNumber(b.usagePerDish,1));
  if(name.length<2)return res.status(400).json({success:false,error:'Material name required'});
  if(!category)return res.status(400).json({success:false,error:'Menu category required'});
  const lowStock=Math.max(0,safeNumber(b.lowStock,0)); const material={id:`rm-${Date.now()}-${Math.random().toString(36).slice(2,6)}`,name,category,unit,quantity,usagePerDish,lowStock,createdAt:new Date().toISOString()};
  await updateState(s=>{s.rawMaterials.push(material);return s;}); await appendAudit('raw_material.created',{id:material.id,name,category});
  res.json({success:true,rawMaterial:material,rawMaterials:clone(getState().rawMaterials)});
});
app.put('/api/raw-materials/:id', requireAuth, async (req,res)=>{
  const b=req.body||{}; await updateState(s=>{const m=(s.rawMaterials||[]).find(x=>x.id===req.params.id);if(!m)throw new Error('Raw material not found');Object.assign(m,{name:String(b.name??m.name).trim(),category:String(b.category??m.category).trim(),unit:String(b.unit??m.unit).trim()||'pcs',quantity:Math.max(0,safeNumber(b.quantity,m.quantity)),usagePerDish:Math.max(0,safeNumber(b.usagePerDish,m.usagePerDish)),lowStock:Math.max(0,safeNumber(b.lowStock,m.lowStock||0))});return s;});
  await appendAudit('raw_material.updated',{id:req.params.id});res.json({success:true,rawMaterials:clone(getState().rawMaterials)});
});
app.post('/api/raw-materials/:id/adjust', requireAuth, async (req,res)=>{
  const delta=safeNumber(req.body?.delta,0); if(!Number.isFinite(delta))return res.status(400).json({success:false,error:'Invalid adjustment'});
  let out=null; await updateState(s=>{const m=(s.rawMaterials||[]).find(x=>x.id===req.params.id);if(!m)throw new Error('Raw material not found');m.quantity=Math.max(0,Number(m.quantity||0)+delta);out=clone(m);return s;});
  await appendAudit('raw_material.adjusted',{id:req.params.id,delta,quantity:out.quantity});res.json({success:true,rawMaterial:out});
});
app.delete('/api/raw-materials/:id', requireAuth, async (req,res)=>{await updateState(s=>{s.rawMaterials=(s.rawMaterials||[]).filter(x=>x.id!==req.params.id);return s;});await appendAudit('raw_material.deleted',{id:req.params.id});res.json({success:true,rawMaterials:clone(getState().rawMaterials)});});

app.get('/api/expense-categories', requireAuth, (req,res)=>res.json({success:true,categories:clone(getState().expenseCategories||['Ingredients'])}));
app.post('/api/expense-categories', requireAuth, async (req,res)=>{const name=String(req.body?.name||'').trim().replace(/\s+/g,' ');if(!name)return res.status(400).json({success:false,error:'Category name required'});await updateState(s=>{const exists=(s.expenseCategories||[]).some(x=>String(x).toLowerCase()===name.toLowerCase());if(exists)throw new Error('Expense category already exists');s.expenseCategories=[...(s.expenseCategories||[]),name];return s;});await appendAudit('expense_category.created',{name});res.json({success:true,categories:clone(getState().expenseCategories)});});

app.get('/api/expenses', requireAuth, (req,res)=>{const list=getState().expenses.slice().sort((a,b)=>String(b.date).localeCompare(String(a.date)));res.json({success:true,expenses:list});});
app.post('/api/expenses', requireAuth, async (req,res)=>{const b=req.body||{};const e={id:`exp-${Date.now()}-${Math.random().toString(36).slice(2,6)}`,date:String(b.date||isoDay()),category:String(b.category||'Miscellaneous'),description:String(b.description||''),amount:safeNumber(b.amount),payment:String(b.payment||'Cash')};if(e.amount<=0)return res.status(400).json({success:false,error:'Enter a valid amount'});await updateState(s=>{s.expenses.push(e);return s;});await appendAudit('expense.created',{id:e.id,amount:e.amount});res.json({success:true,expense:e});});
app.delete('/api/expenses/:id', requireAuth, async (req,res)=>{await updateState(s=>{s.expenses=s.expenses.filter(x=>x.id!==req.params.id);return s;});await appendAudit('expense.deleted',{id:req.params.id});res.json({success:true});});

function normalizedReportZone(order){
  const zones=getAllDeliveryZones();
  const aliases={
    'nivalkhed':['nivalkhed','nival khed','निवाळखेड','निवालखेड़ा','نیوالکھیڑا'],
    'kannolli':['kannolli','kannoli','کন্নولی'],
    'shivanagi':['shivanagi','shivnagi','شیوانگی'],
    'devoor':['devoor','devur','devar','devoor village'],
    'padaganur':['padaganur','padaganur'],
    'mulasavalagi':['mulasavalagi','mulasavalagi'],
    'ingalagi':['ingalagi','ingalgi','ingalagi'],
    'devara-hipparagi':['devara hipparagi','devara-hipparagi','devara hippargi']
  };
  const raw=String(order?.delivery_zone||'').trim().toLowerCase();
  const hay=[raw,String(order?.address||'').toLowerCase(),String(order?.landmark||'').toLowerCase()].join(' ');
  for(const z of zones){const opts=aliases[z.id]||[String(z.id).toLowerCase(),String(z.name||'').toLowerCase()];if(opts.some(a=>a&&hay.includes(a.toLowerCase())))return z.name;}
  if(raw){const exact=zones.find(z=>raw===String(z.name||'').toLowerCase()||raw===String(z.id||'').toLowerCase());if(exact)return exact.name;}
  // Legacy orders created before delivery-zone capture did not store a zone. Treat those historical orders as the primary local zone for reporting.
  return 'Devara Hipparagi';
}
const REPORT_ZONE_LABELS={'Devoor':'Devur'};
app.get('/api/reports/sales', requireAuth, (req,res)=>{
  const list=filteredOrders(req.query);const categoriesAgg={},zonesAgg={},sourcesAgg={},itemsAgg={};
  const configuredZones=getAllDeliveryZones();
  for(const z of configuredZones) zonesAgg[z.name]=0;
  for(const o of list){const z=normalizedReportZone(o);zonesAgg[z]=(zonesAgg[z]||0)+safeNumber(o.total);const src=o.source||'unknown';sourcesAgg[src]=(sourcesAgg[src]||0)+safeNumber(o.total);for(const i of o.items||[]){const cat=String(i.id||'').startsWith('P')?'Pizza':String(i.id||'').startsWith('B')?'Burgers':String(i.id||'').startsWith('D')?'Drinks':String(i.id||'').startsWith('M')?'Shakes':String(i.id||'').startsWith('C')||String(i.id||'').startsWith('F')?'Packs':'Other';categoriesAgg[cat]=(categoriesAgg[cat]||0)+safeNumber(i.price)*safeNumber(i.qty);const k=i.id||i.name;itemsAgg[k]=itemsAgg[k]||{id:k,name:i.name,qty:0,sales:0};itemsAgg[k].qty+=safeNumber(i.qty);itemsAgg[k].sales+=safeNumber(i.price)*safeNumber(i.qty);}}
  const nonCancelled=list.filter(o=>o.status!=='cancelled');const sales=nonCancelled.reduce((s,o)=>s+safeNumber(o.total),0);
  const zoneOrder=['Nivalkhed','Kannolli','Shivanagi','Devoor','Padaganur','Mulasavalagi','Ingalagi','Devara Hipparagi'];
  const byZone=zoneOrder.map(name=>({name:REPORT_ZONE_LABELS[name]||name,value:zonesAgg[name]||0}));
  res.json({success:true,summary:{orders:list.length,sales,average:sales/(nonCancelled.length||1),profit:nonCancelled.reduce((s,o)=>s+orderProfit(o),0)},byCategory:Object.entries(categoriesAgg).map(([name,value])=>({name,value})).sort((a,b)=>b.value-a.value),byZone,bySource:Object.entries(sourcesAgg).map(([name,value])=>({name,value})).sort((a,b)=>b.value-a.value),topItems:Object.values(itemsAgg).sort((a,b)=>b.sales-a.sales).slice(0,20)});
});
app.get('/api/reports/cod', requireAuth, (req,res)=>{const list=filteredOrders(req.query).filter(o=>o.payment_method==='COD'&&o.status!=='cancelled');const expected=list.reduce((s,o)=>s+safeNumber(o.total),0);const collected=list.filter(o=>o.admin?.codCollected===true);const collectedAmount=collected.reduce((s,o)=>s+safeNumber(o.admin?.cashReceived||o.total),0);const pendingAmount=Math.max(0,expected-collectedAmount);const pendingOrders=list.filter(o=>!o.admin?.codCollected).length;res.json({success:true,totalExpected:expected,collected:collectedAmount,pending:pendingAmount,collectedOrders:collected.length,pendingOrders,drivers:Object.entries(collected.reduce((m,o)=>{const d=o.admin?.driver||'Unassigned';m[d]=(m[d]||0)+safeNumber(o.admin?.cashReceived||o.total);return m},{})).map(([name,amount])=>({name,amount}))});});
app.get('/api/reports/day-end', requireAuth, (req,res)=>{const day=String(req.query.date||isoDay());const list=allOrders().filter(o=>isoDay(o.created_at)===day);const sales=list.filter(o=>o.status!=='cancelled').reduce((s,o)=>s+safeNumber(o.total),0);const expenses=getState().expenses.filter(e=>e.date===day).reduce((s,e)=>s+safeNumber(e.amount),0);const profit=list.filter(o=>o.status!=='cancelled').reduce((s,o)=>s+orderProfit(o),0)-expenses;res.json({success:true,date:day,orders:list.length,sales,expenses,profit,cancelled:list.filter(o=>o.status==='cancelled').length,cod:list.filter(o=>o.payment_method==='COD').reduce((s,o)=>s+safeNumber(o.total),0)});});
app.get('/api/recommendations', requireAuth, (req,res)=>{const list=allOrders().filter(o=>o.status!=='cancelled');const last14=list.filter(o=>new Date(o.created_at)>=new Date(Date.now()-14*86400000));const prev14=list.filter(o=>new Date(o.created_at)>=new Date(Date.now()-28*86400000)&&new Date(o.created_at)<new Date(Date.now()-14*86400000));const sumItems=arr=>arr.reduce((m,o)=>{for(const i of o.items||[]){const k=i.id||i.name;m[k]=(m[k]||0)+safeNumber(i.qty);}return m},{});const a=sumItems(last14),b=sumItems(prev14);const rec=[];Object.entries(a).sort((x,y)=>y[1]-x[1]).slice(0,3).forEach(([id,qty])=>{const prev=b[id]||0;if(qty>prev*1.2)rec.push(`Demand for ${id} is rising. Consider featuring it in a combo or banner.`);});const slow=Object.entries(a).sort((x,y)=>x[1]-y[1])[0];if(slow)rec.push(`${slow[0]} has relatively low recent demand. Consider a promotion before removing it.`);const zone=list.reduce((m,o)=>{const z=normalizedReportZone(o);m[z]=(m[z]||0)+1;return m},{});const peak=Object.entries(zone).sort((x,y)=>y[1]-x[1])[0];if(peak)rec.push(`${peak[0]} is currently your strongest delivery area by order count.`);rec.push('Weekend demand is usually worth checking before setting stock, staffing or promotions.');res.json({success:true,recommendations:rec.slice(0,6)});});

app.get('/api/blocklist', requireAuth,(req,res)=>res.json({success:true,blocked:clone(getState().blockedCustomers)}));
app.post('/api/blocklist', requireAuth, async(req,res)=>{const p=digits(req.body?.phone);if(p.length<10)return res.status(400).json({success:false,error:'Valid phone required'});await updateState(s=>{s.blockedCustomers=s.blockedCustomers.filter(x=>digits(x.phone)!==p);s.blockedCustomers.push({phone:p,reason:String(req.body?.reason||''),enabled:true,createdAt:new Date().toISOString()});return s;});await appendAudit('customer.blocked',{phone:p});res.json({success:true});});
app.delete('/api/blocklist/:phone', requireAuth, async(req,res)=>{const p=digits(req.params.phone);await updateState(s=>{s.blockedCustomers=s.blockedCustomers.filter(x=>digits(x.phone)!==p);return s;});await appendAudit('customer.unblocked',{phone:p});res.json({success:true});});

app.get('/api/templates', requireAuth,(req,res)=>res.json({success:true,templates:clone(getState().messageTemplates)}));
app.put('/api/templates', requireAuth, async(req,res)=>{await updateState(s=>{s.messageTemplates={...s.messageTemplates,...(req.body||{})};return s;});await appendAudit('whatsapp.templates_updated',Object.keys(req.body||{}));res.json({success:true,templates:clone(getState().messageTemplates)});});

app.get('/api/audit', requireAuth,(req,res)=>res.json({success:true,logs:getState().auditLog.slice(0,200)}));
app.get('/api/errors', requireAuth,(req,res)=>res.json({success:true,logs:getState().errorLog.slice(0,200)}));
app.get('/api/system', requireAuth,(req,res)=>res.json({success:true,database:require('../db/database').getDatabaseMode(),whatsapp:{ready:global.__TPP_WHATSAPP_READY===true,status:global.__TPP_WHATSAPP_STATUS||'unknown'},uptime:process.uptime(),memory:process.memoryUsage(),node:process.version,cwd:process.cwd(),uploads:fs.existsSync(path.join(process.cwd(),'public','uploads'))}));

app.get('/api/backup', requireAuth,(req,res)=>{const backup={version:1,createdAt:new Date().toISOString(),orders:allOrders(),adminState:clone(getState())};res.setHeader('Content-Type','application/json');res.setHeader('Content-Disposition','attachment; filename="town-pizza-planet-backup.json"');res.send(JSON.stringify(backup,null,2));});
app.post('/api/restore', requireAuth, async(req,res)=>{const b=req.body||{};if(!b.adminState||typeof b.adminState!=='object')return res.status(400).json({success:false,error:'Invalid backup'});await updateState(()=>b.adminState);await appendAudit('system.backup_restored',{createdAt:b.createdAt||null});res.json({success:true});});

app.get('/api/export/orders', requireAuth,(req,res)=>{const list=filteredOrders(req.query);sendCsv(res,'orders.csv',[['Order ID','Date','Customer','Phone','Status','Village','Payment','Subtotal','Delivery','Total','Items'],...list.map(o=>[o.order_id,o.created_at,o.user_name,digits(o.user_id),o.status,o.delivery_zone||'',o.payment_method||'',o.subtotal,o.delivery_charge,o.total,(o.items||[]).map(i=>`${i.name} x${i.qty}`).join(' | ')])]);});
app.get('/api/export/customers', requireAuth,(req,res)=>{const map=new Map();for(const o of allOrders()){const p=customerKey(o);if(!p)continue;const c=map.get(p)||{phone:p,name:o.user_name,orders:0,spent:0,last:''};c.orders++;c.spent+=safeNumber(o.total);if(!c.last||new Date(o.created_at)>new Date(c.last))c.last=o.created_at;map.set(p,c);}sendCsv(res,'customers.csv',[['Phone','Name','Orders','Spent','Last Order'],...map.values()].map(c=>[c.phone,c.name,c.orders,c.spent,c.last]));});
app.get('/api/export/expenses', requireAuth,(req,res)=>{sendCsv(res,'expenses.csv',[['Date','Category','Description','Amount','Payment'],...getState().expenses.map(e=>[e.date,e.category,e.description,e.amount,e.payment])]);});

app.post('/api/upload-image', requireAuth, async(req,res)=>{try{const b=req.body||{};const name=String(b.name||'').replace(/[^a-zA-Z0-9._-]/g,'_');const mime=String(b.mime||'');const data=String(b.data||'');if(!name||!/^data:image\/(jpeg|png|webp);base64,/i.test(data))return res.status(400).json({success:false,error:'Upload a JPEG, PNG or WebP image.'});const ext=mime.includes('png')?'.png':mime.includes('webp')?'.webp':'.jpg';const base=path.basename(name).replace(/\.[^.]+$/,'');const final=`${base}-${Date.now()}${ext}`;const dir=path.join(process.cwd(),'public','uploads');fs.mkdirSync(dir,{recursive:true});fs.writeFileSync(path.join(dir,final),Buffer.from(data.split(',')[1],'base64'));await appendAudit('image.uploaded',{name:final});res.json({success:true,path:`/uploads/${final}`});}catch(err){await appendError(err.message,{route:'/api/upload-image'});res.status(500).json({success:false,error:'Image upload failed'});}});
app.get('/api/images', requireAuth,(req,res)=>{const dir=path.join(process.cwd(),'public','uploads');fs.mkdirSync(dir,{recursive:true});const files=fs.readdirSync(dir).filter(f=>/\.(jpe?g|png|webp)$/i.test(f)).map(f=>({name:f,path:`/uploads/${f}`,size:fs.statSync(path.join(dir,f)).size}));res.json({success:true,images:files});});
app.delete('/api/images/:name', requireAuth, async(req,res)=>{const name=path.basename(req.params.name);const file=path.join(process.cwd(),'public','uploads',name);if(fs.existsSync(file))fs.unlinkSync(file);await appendAudit('image.deleted',{name});res.json({success:true});});

app.post('/api/daily-summary', requireAuth, async(req,res)=>{const date=String(req.body?.date||isoDay());const list=allOrders().filter(o=>isoDay(o.created_at)===date);const sales=list.filter(o=>o.status!=='cancelled').reduce((s,o)=>s+safeNumber(o.total),0);const top={};list.forEach(o=>(o.items||[]).forEach(i=>{top[i.name]=(top[i.name]||0)+safeNumber(i.qty);}));const topItem=Object.entries(top).sort((a,b)=>b[1]-a[1])[0]?.[0]||'—';const tpl=getState().messageTemplates?.daily_summary||'📊 Daily Summary\\nOrders: {orders}\\nSales: ₹{sales}\\nTop item: {top_item}';const msg=tpl.replaceAll('{orders}',String(list.length)).replaceAll('{sales}',String(sales)).replaceAll('{top_item}',topItem);const owner=digits(process.env.OWNER_PHONE);const ok=Boolean(whatsappClient&&owner)?await sendStatusNotificationSafe(whatsappClient,`${owner}@c.us`,msg):false;res.json({success:true,sent:ok,message:msg});});

app.get('/', (req,res)=>res.sendFile(path.join(__dirname,'public','index.html')));
app.get('/admin', (req,res)=>res.sendFile(path.join(__dirname,'public','index.html')));
app.get('/inventory', (req,res)=>res.sendFile(path.join(__dirname,'public','index.html')));
function whatsappQrPage(req,res){
  res.setHeader('Cache-Control','no-store, no-cache, must-revalidate');
  res.type('html').send(`<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Town Pizza Planet — WhatsApp QR</title><style>body{margin:0;background:#0b1015;color:#fff;font-family:system-ui,sans-serif;display:grid;place-items:center;min-height:100vh;padding:18px;box-sizing:border-box}main{width:min(720px,100%);background:#121922;border:1px solid #263241;border-radius:20px;padding:24px;text-align:center;box-sizing:border-box}h1{margin:0 0 8px}p{color:#b9c4d0;line-height:1.5}.pill{display:inline-block;padding:8px 14px;border-radius:999px;background:#1f2937;color:#cbd5e1}.ready{background:#064e3b;color:#a7f3d0}.wait{background:#7c2d12;color:#fed7aa}#box{margin:20px auto;min-height:340px;background:#fff;border-radius:16px;display:grid;place-items:center;padding:18px;max-width:560px;box-sizing:border-box}#qr{max-width:100%;height:auto;display:none}#msg{color:#111;font-weight:700}button{border:1px solid #475569;background:#1e293b;color:#fff;border-radius:10px;padding:10px 16px;font-weight:700}</style></head><body><main><h1>🍕 Town Pizza Planet</h1><p>WhatsApp restaurant account setup</p><div id="st" class="pill">Checking status…</div><div style="margin:14px 0"><button onclick="refreshQR()">Refresh</button></div><div id="box"><div id="msg">Waiting for WhatsApp QR…</div><img id="qr" alt="WhatsApp QR code"></div><p>On the restaurant phone: <b>WhatsApp → Linked Devices → Link a Device</b>, then scan this QR.</p><p>Keep this page open until the status changes to <b>WhatsApp connected</b>.</p></main><script>async function refreshQR(){try{const r=await fetch('/api/qr',{cache:'no-store'});const d=await r.json();const st=document.getElementById('st'),msg=document.getElementById('msg'),qr=document.getElementById('qr');if(d.ready){st.textContent='✅ WhatsApp connected';st.className='pill ready';msg.textContent='WhatsApp is connected. You can close this page.';qr.style.display='none'}else if(d.qr){st.textContent='Waiting for scan…';st.className='pill wait';msg.style.display='none';qr.src=d.qr;qr.style.display='block'}else{st.textContent='Preparing WhatsApp…';st.className='pill';msg.style.display='block';msg.textContent=d.status==='disconnected'||d.status==='reconnecting'?'WhatsApp is reconnecting. Please wait…':'Waiting for a fresh QR code…';qr.style.display='none'}}catch(e){document.getElementById('msg').textContent='Unable to read WhatsApp status. Refresh in a few seconds.'}}refreshQR();setInterval(refreshQR,1000)</script></body></html>`);
}
app.get('/qr',whatsappQrPage);
app.get('/admin/qr',whatsappQrPage);
app.get('/api/qr',(req,res)=>{res.setHeader('Cache-Control','no-store, no-cache, must-revalidate');res.json({status:global.__TPP_WHATSAPP_STATUS||'starting',ready:global.__TPP_WHATSAPP_READY===true,qr:global.__TPP_QR_DATA_URL||null});});

function setWhatsAppClient(client){ whatsappClient=client; }
async function maybeDailySummary(){
  try{
    const s=getSettings(); if(!s.dailySummaryEnabled || !whatsappClient || !global.__TPP_WHATSAPP_READY) return;
    const parts=new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Kolkata',hour:'2-digit',minute:'2-digit',hour12:false}).formatToParts(new Date());const p=Object.fromEntries(parts.filter(x=>x.type!=='literal').map(x=>[x.type,x.value]));
    const h=Number(p.hour),m=Number(p.minute); if(h!==Number(s.dailySummaryHour||23)||m!==Number(s.dailySummaryMinute||0))return;const today=isoDay(new Date());if(getState().lastDailySummaryDate===today)return;
    const orders=allOrders().filter(o=>isoDay(o.created_at)===today);const sales=orders.filter(o=>o.status!=='cancelled').reduce((sum,o)=>sum+safeNumber(o.total),0);const counts={};orders.forEach(o=>(o.items||[]).forEach(i=>counts[i.name]=(counts[i.name]||0)+safeNumber(i.qty)));const topItem=Object.entries(counts).sort((a,b)=>b[1]-a[1])[0]?.[0]||'—';const tpl=getState().messageTemplates?.daily_summary||DEFAULT_DAILY_TEMPLATE;const msg=tpl.replaceAll('{orders}',String(orders.length)).replaceAll('{sales}',String(sales)).replaceAll('{top_item}',topItem);const owner=digits(process.env.OWNER_PHONE);if(owner&&await sendStatusNotificationSafe(whatsappClient,`${owner}@c.us`,msg)){await updateState(st=>{st.lastDailySummaryDate=today;return st;});}
  }catch(err){await appendError(err.message,{task:'daily-summary'});}
}
const DEFAULT_DAILY_TEMPLATE='📊 *TOWN PIZZA PLANET — DAILY SUMMARY*\\nOrders: {orders}\\nSales: ₹{sales}\\nTop item: {top_item}';
setInterval(maybeDailySummary,60*1000);
setInterval(autoAssignPendingDrivers,60*1000);

module.exports={app,setWhatsAppClient,initAdminStore};
