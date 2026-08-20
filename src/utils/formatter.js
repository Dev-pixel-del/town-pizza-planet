const { categories, pizzas, pizzaAddons, burgers, sandwiches, sides, milkshakes, drinks } = require('../data/menu');
const { combos } = require('../data/combos');
const { tr, languagePrompt } = require('../data/locale');

const STORE_NAME = process.env.STORE_NAME || 'Town Pizza Planet';
const STORE_PHONE = process.env.STORE_PHONE || '';

function languageSelectionMessage() { return languagePrompt; }
function welcomeMessage(name, lang) { return tr('welcome', lang)(name || 'there'); }
function mainMenuMessage(lang) { return tr('mainMenu', lang); }

function formatItemLine(item) {
  return `*${item.id}.* ${item.name} — ₹${item.price}`;
}

function categoryItemsMessage(category, lang) {
  let msg = `${category.emoji} *${category.name.toUpperCase()}*\n━━━━━━━━━━━━━━━━━━━━\n\n`;
  category.items.forEach(item => { msg += `${formatItemLine(item)}\n`; });
  if (category.key === 'pizzas') msg += `\n🧀 Extra Cheese — ₹30\n`;
  msg += `\n━━━━━━━━━━━━━━━━━━━━\nReply with the item code or item name.\n🛒 Type *cart* to review.`;
  return msg;
}

function combosMessage(lang) {
  let msg = `${tr('combosHeader', lang)}\n━━━━━━━━━━━━━━━━━━━━\n\n`;
  combos.forEach(combo => {
    msg += `*${combo.id}. ${combo.name}* — ₹${combo.price}\n${combo.description}\n`;
    if (combo.serves) msg += `👨‍👩‍👧‍👦 Serves ${combo.serves}\n`;
    if (combo.notes) msg += `ℹ️ ${combo.notes}\n`;
    msg += '\n';
  });
  msg += '━━━━━━━━━━━━━━━━━━━━\nReply with the combo code or name.';
  return msg;
}

function itemAddedMessage(name, qty, price, lang) {
  const extra = qty > 1 ? ` × ${qty}` : '';
  return `✅ Added *${name}*${extra} — ₹${price * qty}`;
}

function cartMessage(cart, lang) {
  if (!cart.length) return tr('cartEmpty', lang);
  const total = cart.reduce((s, i) => s + i.price * i.qty, 0);
  let msg = `${tr('cartTitle', lang)}\n━━━━━━━━━━━━━━━━━━━━\n\n`;
  cart.forEach((item, i) => {
    let name = item.name;
    if (item.extraCheese) name += ' + 🧀 Extra Cheese';
    msg += `${i + 1}. ${name} × ${item.qty} — ₹${item.price * item.qty}\n`;
    if (item.description) msg += `   ${item.description}\n`;
  });
  msg += `\n━━━━━━━━━━━━━━━━━━━━\n`;
  msg += `Subtotal: *₹${total}*\n`;
  if (total >= 150) msg += `${tr('freeDelivery', lang)}\n`;
  else msg += `${tr('freeDeliveryGap', lang)(150 - total)}\n`;
  msg += `\n💵 Payment: *Cash on Delivery*\n\n`;
  msg += tr('cartOptions', lang);
  return msg;
}

function locationPromptMessage(lang) { return tr('locationPrompt', lang); }
function locationReceivedMessage(lang) { return tr('locationReceived', lang); }

function orderConfirmMessage(cart, details, lang) {
  const total = cart.reduce((s, i) => s + i.price * i.qty, 0);
  let msg = `${tr('orderSummary', lang)}\n━━━━━━━━━━━━━━━━━━━━\n\n`;
  cart.forEach((item, i) => {
    let name = item.name;
    if (item.extraCheese) name += ' + 🧀 Extra Cheese';
    msg += `${i + 1}. ${name} × ${item.qty} — ₹${item.price * item.qty}\n`;
  });
  msg += `\n━━━━━━━━━━━━━━━━━━━━\nSubtotal: *₹${total}*\n`;
  msg += `${tr('freeDelivery', lang)}\n`;
  msg += `💵 Total: *₹${total}*\n💵 Payment: *Cash on Delivery*\n\n`;
  if (details.location) msg += `📍 Location: *Received* ✅\n`;
  if (details.landmark) msg += `📌 Landmark: *${details.landmark}*\n`;
  if (details.address) msg += `🏠 Address: *${details.address}*\n`;
  msg += `\n${tr('confirm', lang)}`;
  return msg;
}

function orderPlacedMessage(orderId, total, lang) { return tr('orderPlaced', lang)(orderId, total); }
function helpMessage(lang) { return `❓ ${STORE_NAME}\n\n*menu* — browse\n*cart* — view cart\n*checkout* — place order\n*combos* — view combos\n*lang* — change language\n*clear* — clear cart\n*reset* — restart`; }
function unknownMessage(lang) { return tr('generic').unknown?.[lang] || tr('generic').unknown.en; }
function minOrderMessage(amount, lang) { return tr('minOrder', lang)(amount); }
function freeDeliveryMessage(lang) { return tr('freeDelivery', lang); }
function freeDeliveryGapMessage(amount, lang) { return tr('freeDeliveryGap', lang)(amount); }
function storeClosedMessage(lang = 'en') { return lang === 'kn' ? '😴 ಈಗ ನಾವು ಮುಚ್ಚಿದ್ದೇವೆ.' : lang === 'hi' ? '😴 अभी हम बंद हैं.' : lang === 'ur' ? '😴 ہم ابھی بند ہیں۔' : '😴 We are currently closed.'; }

function statusMessage(status, orderId, lang) {
  const entry = tr('status', lang)[status] || tr('status', 'en')[status];
  return entry ? entry(orderId) : `Order ${orderId}: ${status}`;
}

function ownerNotificationMessage(order, dailyOrderNum) {
  const mapsLink = order.location?.latitude && order.location?.longitude
    ? `https://www.google.com/maps?q=${order.location.latitude},${order.location.longitude}`
    : order.address ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(order.address)}` : '';
  let msg = `🔔 *NEW ORDER — ${order.order_id}*\n━━━━━━━━━━━━━━━━━━━━\n`;
  msg += `👤 ${order.user_name}\n📱 ${order.user_id.replace('@c.us', '')}\n`;
  msg += `🌐 Language: ${order.language}\n\n`;
  msg += `🛒 *ORDER*\n`;
  order.items.forEach((item, i) => {
    msg += `${i + 1}. ${item.name} × ${item.qty} — ₹${item.price * item.qty}\n`;
  });
  msg += `\n💰 *TOTAL: ₹${order.total}*\n🚚 *FREE DELIVERY*\n💵 *CASH ON DELIVERY*\n`;
  if (order.landmark) msg += `\n📌 Landmark: ${order.landmark}\n`;
  if (order.address) msg += `🏠 Address: ${order.address}\n`;
  if (mapsLink) msg += `📍 Map: ${mapsLink}\n`;
  msg += `\n📦 Today’s order #: ${dailyOrderNum}`;
  return msg;
}

function allMenuCategoriesMessage(lang) {
  return mainMenuMessage(lang);
}

module.exports = {
  languageSelectionMessage,
  welcomeMessage,
  mainMenuMessage,
  allMenuCategoriesMessage,
  categoryItemsMessage,
  combosMessage,
  itemAddedMessage,
  cartMessage,
  locationPromptMessage,
  locationReceivedMessage,
  orderConfirmMessage,
  orderPlacedMessage,
  helpMessage,
  unknownMessage,
  minOrderMessage,
  freeDeliveryMessage,
  freeDeliveryGapMessage,
  storeClosedMessage,
  statusMessage,
  ownerNotificationMessage,
};
