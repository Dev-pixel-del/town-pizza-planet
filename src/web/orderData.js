const {
  categories,
  bestsellers,
  findItemById,
  getFinalPrice,
  EXTRA_CHEESE_PRICE,
} = require('../data/menu');
const { combos } = require('../data/combos');
const { familyPacks } = require('../data/familyPacks');
const {
  getState,
  getSettings,
  getDeliveryZones: getStoredZones,
  getMenuOverride,
  getPackOverride,
  getAvailability,
} = require('../admin/adminStore');

function mergeItem(item) {
  const o = getMenuOverride(item.id);
  const variants = Array.isArray(o.variants) ? o.variants : item.variants;
  const base = { ...item };
  if (o.name) base.name = String(o.name);
  if (o.image) base.image = String(o.image);
  if (o.description) base.description = String(o.description);
  if (Number.isFinite(Number(o.price))) {
    // Admin price is the authoritative customer-facing price, including legacy pizzas
    // that store their old sizes under `prices`. Remove the legacy price map so the
    // overridden single price is what the catalogue/order API uses.
    base.price = Number(o.price);
    if (base.prices) delete base.prices;
  }
  if (variants) base.variants = variants.map(v => ({ key: v.key, label: v.label, price: Number(v.price) }));
  base.category = item.category || null;
  base.available = getAvailability(item.id, item.available !== false);
  base.cost = Number.isFinite(Number(o.cost)) ? Number(o.cost) : null;
  base.translations = o.translations || {};
  return base;
}
function effectiveCategories() {
  const state = getState();
  const custom = state.customItems || [];
  const deleted = new Set((state.deletedItems || []).map(x => String(x).toUpperCase()));
  const base = categories.map(c => ({
    ...c,
    custom: false,
    items: [
      ...c.items
        .filter(i => !deleted.has(String(i.id).toUpperCase()))
        .map(i => mergeItem({ ...i, category: c.key })),
      ...custom
        .filter(i => i.category === c.key && !deleted.has(String(i.id).toUpperCase()))
        .map(i => mergeItem({ ...i, category: c.key }))
    ]
  }));
  const customCategories = (state.customCategories || []).map(c => ({
    key: c.key, name: c.name, emoji: c.emoji || '🍽️', custom: true,
    items: custom
      .filter(i => i.category === c.key && !deleted.has(String(i.id).toUpperCase()))
      .map(i => mergeItem({ ...i, category: c.key }))
  }));
  return [...base, ...customCategories];
}
// A pack is automatically unavailable when a required component is unavailable.
// For "Any" / "OR" components, the pack remains available while at least one
// valid choice is available. Manual pack Sold Out still takes precedence.
const PACK_DEPENDENCIES = {
  C1: [{any:['B1','B3']},{all:['S1']},{any:['D1','D2','D3','D4','D5','D6','D7','D8','D9','D10']}],
  C2: [{all:['B4','S1']},{any:['D1','D2','D3','D4','D5','D6','D7','D8','D9','D10']}],
  C3: [{all:['P1','S3']},{any:['D1','D2','D3','D4','D5','D6','D7','D8','D9','D10']}],
  C4: [{any:['P4','P5']},{all:['S1']},{any:['D1','D2','D3','D4','D5','D6','D7','D8','D9','D10']}],
  C5: [{any:['B1','B3']},{any:['M1','M2','M3','M4','M5','M6','M7','M8']},{all:['S3']}],
  C6: [{all:['P6','S1']},{any:['M1','M2','M3','M4','M5','M6','M7','M8']}],
  C7: [{any:['B1','B3']},{all:['S1']},{any:['D1','D2','D3','D4','D5','D6','D7','D8','D9','D10']}],
  C8: [{any:['P8','P9']},{any:['B1','B3']},{all:['S3']},{any:['M1','M2','M3','M4','M5','M6','M7','M8']}],
  C9: [{all:['P5','S1','D3']},{any:['B1','B3']}],
  C10: [{all:['P6','S1','D3']},{any:['S2','S4','S5','S7']}],
  C11: [{all:['B4','S1','D3']},{any:['S2','S4','S5','S6','S7']}],
  F1: [{any:['P4','P5']},{any:['P8','P9']},{any:['S2','S4','S5','S6','S7']},{all:['S3']},{any:['D1','D2','D3','D4','D5','D6','D7','D8','D9','D10']}],
  F2: [{all:['P6','S3']},{any:['B1','B3']},{any:['M1','M2','M3','M4','M5','M6','M7','M8']}],
  F3: [{any:['P8','P9']},{all:['B4','S3']},{any:['D1','D2','D3','D4','D5','D6','D7','D8','D9','D10']}],
  F4: [{any:['P4','P5']},{all:['P7','S3']},{any:['S2','S4','S5','S6','S7']},{any:['D1','D2','D3','D4','D5','D6','D7','D8','D9','D10']}]
};
function effectiveItemAvailability(id){
  const item=getEffectiveItem(id);
  return Boolean(item && item.available !== false);
}
function packDependencyStatus(id){
  const groups=PACK_DEPENDENCIES[String(id).toUpperCase()]||[];
  for(const g of groups){
    const ids=g.all||g.any||[];
    const ok=g.all ? ids.every(effectiveItemAvailability) : ids.some(effectiveItemAvailability);
    if(!ok) return {available:false,missing:ids.filter(x=>!effectiveItemAvailability(x))};
  }
  return {available:true,missing:[]};
}
function effectivePacks(type, source) {
  return source.map(p => {
    const o = getPackOverride(type, p.id);
    const manualAvailable = getAvailability(p.id, o.available !== false);
    const dependency = packDependencyStatus(p.id);
    return { ...p, ...o, id: p.id, price: Number(o.price ?? p.price), cost: Number.isFinite(Number(o.cost)) ? Number(o.cost) : null, available: manualAvailable && dependency.available, autoUnavailable: !dependency.available, unavailableBecause: dependency.missing, translations: o.translations || {} };
  });
}
function getEffectiveItem(id) {
  const wanted = String(id || '').toUpperCase();
  const raw = findItemById(wanted);
  if (raw && !(getState().deletedItems || []).map(x => String(x).toUpperCase()).includes(wanted)) return mergeItem(raw);
  const custom = (getState().customItems || []).find(i => String(i.id).toUpperCase() === wanted);
  return custom ? mergeItem(custom) : null;
}
function getEffectivePacks() { return { combos: effectivePacks('combo', combos), familyPacks: effectivePacks('family', familyPacks) }; }
function itemView(item) {
  return {
    id: item.id,
    name: item.name,
    price: Number(getFinalPrice(item)),
    image: item.image,
    category: item.category || null,
    extraCheese: item.id.startsWith('P'),
    available: item.available !== false,
    variants: Array.isArray(item.variants) ? item.variants.map(v => ({ key: v.key, label: v.label, price: Number(v.price) })) : undefined,
    translations: item.translations || {},
  };
}
function categoryView(category) { return { key: category.key, name: category.name, emoji: category.emoji, custom: category.custom === true, items: category.items.map(itemView) }; }
function packView(pack) { return { id: pack.id, name: pack.name, description: pack.description, items: pack.items, price: Number(pack.price), image: pack.image, available: pack.available !== false, autoUnavailable: Boolean(pack.autoUnavailable), unavailableBecause: Array.isArray(pack.unavailableBecause)?pack.unavailableBecause:[], translations: pack.translations || {} }; }

function getOrderingStatus() {
  const settings = getSettings();
  const ist = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Kolkata', weekday: 'short', hour: '2-digit', minute: '2-digit', hour12: false }).formatToParts(new Date());
  const parts = Object.fromEntries(ist.filter(p => p.type !== 'literal').map(p => [p.type, p.value]));
  const dayMap = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };
  const day = dayMap[parts.weekday] ?? new Date().getDay();
  const hours = settings.businessHours?.[day] || { open: '10:00', close: '23:00', enabled: true };
  const current = `${parts.hour}:${parts.minute}`;
  const dayDisabled = hours.enabled === false;
  const withinHours = current >= hours.open && current < hours.close;
  const inHours = dayDisabled ? false : (!settings.enforceBusinessHours || withinHours);
  const manualClosed = settings.manualClosed === true;
  const paused = settings.pauseNewOrders === true;
  let open = !manualClosed && !paused && inHours;
  return {
    restricted: true,
    open,
    openHour: hours.open,
    closeHour: hours.close,
    manualClosed,
    paused,
    dayDisabled,
    reason: manualClosed ? 'Restaurant is temporarily closed.' : paused ? 'New orders are temporarily paused.' : dayDisabled ? 'Ordering is currently unavailable today.' : (!inHours ? `Ordering is open from ${hours.open} to ${hours.close}.` : ''),
  };
}
function calculateDelivery(zoneId, subtotal) {
  const zone = getStoredZones().find(z => z.id === zoneId); const amount = Number(subtotal || 0);
  if (!zone) return { valid:false, error:'Please choose a delivery area.', zone:null, charge:0, minimumOrder:0, freeAbove:0 };
  if (amount < zone.minOrder) return { valid:false, error:`Minimum order for ${zone.name} is ₹${zone.minOrder}.`, zone, charge:zone.deliveryCharge, minimumOrder:zone.minOrder, freeAbove:zone.freeAbove, amountNeeded:zone.minOrder - amount };
  const free = amount >= zone.freeAbove; const charge = free ? 0 : zone.deliveryCharge;
  return { valid:true, zone, charge, free, minimumOrder:zone.minOrder, freeAbove:zone.freeAbove, estimatedMinutes:zone.estimatedMinutes };
}
function getDaySpecials() {
  const s = getSettings();
  const weekday = new Intl.DateTimeFormat('en-US', { timeZone: 'Asia/Kolkata', weekday: 'long' }).format(new Date());
  const map = { Sunday:0, Monday:1, Tuesday:2, Wednesday:3, Thursday:4, Friday:5, Saturday:6 };
  const ids = s.daySpecials?.[map[weekday]] || [];
  return ids.map(id => getEffectiveItem(id) || null).filter(Boolean).map(itemView);
}
function getComboOfDay() {
  const s=getSettings();
  const weekday=new Intl.DateTimeFormat('en-US',{timeZone:'Asia/Kolkata',weekday:'short'}).format(new Date());
  const day={Sun:0,Mon:1,Tue:2,Wed:3,Thu:4,Fri:5,Sat:6}[weekday] ?? new Date().getDay();
  const cfg=s.comboOfDay?.[String(day)];
  if(!cfg || cfg.enabled===false || !cfg.packId) return null;
  const source=cfg.packType==='family'?getEffectivePacks().familyPacks:getEffectivePacks().combos;
  const pack=source.find(x=>String(x.id).toUpperCase()===String(cfg.packId).toUpperCase());
  if(!pack)return null;
  const originalPrice=Number(pack.price)||0;
  const discount=Math.min(40,Math.round(originalPrice*0.10));
  return {
    day, packId:pack.id, packType:cfg.packType==='family'?'family':'combo', name:String(cfg.name||pack.name), sourceName:pack.name,
    description:pack.description||'', image:pack.image||'', originalPrice, discount, price:Math.max(0,originalPrice-discount),
    available:pack.available!==false, autoUnavailable:Boolean(pack.autoUnavailable)
  };
}

function getCampaign() {
  const c = getSettings().campaign || {};
  if (!c.enabled) return null;
  const today = new Date().toISOString().slice(0,10);
  if (c.startsOn && today < c.startsOn) return null;
  if (c.endsOn && today > c.endsOn) return null;
  return c;
}
function getCatalog() {
  const effectiveCats = effectiveCategories();
  const packs = getEffectivePacks();
  const settings = getSettings();
  return {
    storeName: process.env.STORE_NAME || 'Town Pizza Planet',
    phone: [process.env.STORE_PHONE,'9448769098','6362648283'].filter(Boolean).filter((v,i,a)=>a.indexOf(v)===i),
    extraCheesePrice: EXTRA_CHEESE_PRICE,
    bestsellers: bestsellers.map(findItemById).filter(Boolean).map(mergeItem).map(itemView),
    categories: effectiveCats.map(categoryView),
    combos: packs.combos.map(packView),
    familyPacks: packs.familyPacks.map(packView),
    deliveryZones: getStoredZones(),
    ordering: getOrderingStatus(),
    banner: settings.banner,
    announcement: settings.announcement,
    campaign: getCampaign(),
    daySpecials: getDaySpecials(),
    comboOfDay: getComboOfDay(),
  };
}
function getCatalogLookup() {
  const catalog = getCatalog();
  const lookup = new Map();
  for (const cat of catalog.categories) for (const item of cat.items) lookup.set(item.id, item);
  for (const combo of catalog.combos) lookup.set(combo.id, { ...combo, isCombo: true, packType: 'combo' });
  for (const pack of catalog.familyPacks) lookup.set(pack.id, { ...pack, isCombo: true, packType: 'family' });
  return lookup;
}
module.exports = { getCatalog, getCatalogLookup, calculateDelivery, getOrderingStatus, getEffectiveItem, getEffectivePacks, getStoredZones };
