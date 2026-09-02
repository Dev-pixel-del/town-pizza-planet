// ============================================================
// Town Pizza Planet — Message Formatter (Multilingual)
// ============================================================
// Formats all WhatsApp messages using the localization system.
// All user-facing messages support: English, Kannada, Hindi, Urdu.
// ============================================================

const { categories } = require('../data/menu');
const { combos } = require('../data/combos');
const { tr, languagePrompt } = require('../data/locale');

const STORE_NAME = process.env.STORE_NAME || 'Town Pizza Planet';
const STORE_PHONE = process.env.STORE_PHONE || '8310941187';

// ─── Language Selection ────────────────────────────────

function languageSelectionMessage() {
  return languagePrompt;
}

// ─── Start Ordering ───────────────────────────────────

function startOrderingMessage() {
  return tr('startOrdering', 'en');
}

// ─── Welcome ───────────────────────────────────────────

function welcomeMessage(contactName, lang = 'en') {
  const fn = tr('welcome', lang);
  return typeof fn === 'function' ? fn(contactName) : fn;
}

// ─── Main Menu ─────────────────────────────────────────

function mainMenuMessage(lang = 'en') {
  return tr('mainMenu', lang);
}

// ─── Category Items ────────────────────────────────────

function categoryItemsMessage(category, lang = 'en') {
  let msg = `${category.emoji} *${category.emoji} ${category.name}*\n`;
  msg += `━━━━━━━━━━━━━━━━━━━━━\n\n`;

  category.items.forEach(item => {
    msg += `*${item.id}.* ${item.name}\n`;
    if (item.prices) {
      const sizes = Object.entries(item.prices);
      msg += `     ${sizes.map(([s, p]) => `${s.charAt(0).toUpperCase() + s.slice(1)}: ₹${p}`).join(' / ')}\n`;
    } else {
      msg += `     ₹${item.price}\n`;
    }
  });

  // Add extra cheese note for pizzas
  if (category.key === 'pizzas') {
    msg += `\n${tr('extraCheese', lang)}\n`;
  }

  msg += `\n━━━━━━━━━━━━━━━━━━━━━\n`;
  const sampleCode = category.items[0]?.id || 'P1';
  const footerFn = tr('categoryFooter', lang);
  msg += typeof footerFn === 'function' ? footerFn(sampleCode) : footerFn;

  return msg;
}

// ─── Combos ────────────────────────────────────────────

function combosMessage(lang = 'en') {
  let msg = `${tr('combosHeader', lang)}\n`;
  msg += `━━━━━━━━━━━━━━━━━━━━━\n\n`;

  combos.forEach(combo => {
    msg += `*${combo.id}. ${combo.name}* — ₹${combo.price}\n`;
    msg += `   ${combo.description}\n\n`;
  });

  msg += `━━━━━━━━━━━━━━━━━━━━━\n`;
  const footerFn = tr('combosFooter', lang);
  msg += typeof footerFn === 'function' ? footerFn : footerFn;

  return msg;
}

// ─── Size Selection ────────────────────────────────────

function sizeSelectionMessage(item, lang = 'en') {
  const promptFn = tr('sizePrompt', lang);
  let msg = (typeof promptFn === 'function' ? promptFn(item.name) : promptFn) + '\n\n';

  const sizes = Object.entries(item.prices);
  sizes.forEach(([size, price], i) => {
    const label = size.charAt(0).toUpperCase() + size.slice(1);
    msg += `*${i + 1}.* ${label} — ₹${price}\n`;
  });

  msg += `\n${tr('sizeCheeseHint', lang)}\n\n`;
  msg += tr('cancelHint', lang);

  return msg;
}

// ─── Extra Cheese Choice ──────────────────────────────

function extraCheeseChoiceMessage(item, lang = 'en') {
  const fn = tr('extraCheeseChoice', lang);
  return typeof fn === 'function' ? fn(item.name, item.price) : fn;
}

function categoryNextStepMessage(lang = 'en') {
  const fn = tr('categoryNextStep', lang);
  return typeof fn === 'function' ? fn : fn;
}

// ─── Item Added ────────────────────────────────────────

function itemAddedMessage(itemName, qty, price, lang = 'en') {
  const fn = tr('itemAdded', lang);
  return typeof fn === 'function' ? fn(itemName, qty, price) : fn;
}

// ─── Cart ──────────────────────────────────────────────

function cartMessage(cart, lang = 'en') {
  if (cart.length === 0) {
    return tr('cartEmpty', lang);
  }

  let total = 0;
  let msg = `${tr('cartTitle', lang)}\n`;
  msg += `━━━━━━━━━━━━━━━━━━━━━\n\n`;

  cart.forEach((item, i) => {
    const lineTotal = item.price * item.qty;
    total += lineTotal;
    let line = `${i + 1}. `;
    if (item.isCombo) line += '🎉 ';
    line += `${item.name}`;
    if (item.size) line += ` (${item.size})`;
    if (item.extraCheese) line += ` +🧀`;
    line += ` × ${item.qty} — ₹${lineTotal}`;
    msg += line + '\n';
  });

  msg += `\n━━━━━━━━━━━━━━━━━━━━━\n`;
  msg += `*Total: ₹${total}*\n`;
  msg += `━━━━━━━━━━━━━━━━━━━━━\n\n`;
  msg += tr('cartOptions', lang);

  return msg;
}

// ─── Address Prompt ────────────────────────────────────

function addressPromptMessage(lang = 'en') {
  return tr('addressPrompt', lang);
}

// ─── Order Confirm ─────────────────────────────────────

function orderConfirmMessage(cart, address, lang = 'en') {
  let total = 0;
  let msg = `${tr('orderSummaryTitle', lang)}\n`;
  msg += `━━━━━━━━━━━━━━━━━━━━━\n\n`;

  cart.forEach((item, i) => {
    const lineTotal = item.price * item.qty;
    total += lineTotal;
    let line = `${i + 1}. ${item.name}`;
    if (item.size) line += ` (${item.size})`;
    if (item.extraCheese) line += ` +🧀`;
    line += ` × ${item.qty} — ₹${lineTotal}`;
    msg += line + '\n';
  });

  msg += `\n━━━━━━━━━━━━━━━━━━━━━\n`;
  msg += `*Total: ₹${total}*\n`;
  msg += `━━━━━━━━━━━━━━━━━━━━━\n\n`;

  const delivFn = tr('deliveryTo', lang);
  msg += (typeof delivFn === 'function' ? delivFn(address) : delivFn) + '\n\n';
  msg += tr('confirmPrompt', lang);

  return msg;
}

// ─── Order Placed ──────────────────────────────────────

function orderPlacedMessage(orderId, total, lang = 'en') {
  const fn = tr('orderPlaced', lang);
  return typeof fn === 'function' ? fn(orderId, total) : fn;
}

// ─── Help ──────────────────────────────────────────────

function helpMessage(lang = 'en') {
  return tr('help', lang);
}

// ─── Unknown ───────────────────────────────────────────

function unknownMessage(lang = 'en') {
  return tr('unknown', lang);
}

// ─── Store Closed ──────────────────────────────────────

function storeClosedMessage(lang = 'en') {
  return tr('storeClosed', lang);
}

// ─── Owner Notification (always in English) ────────────

function ownerNotificationMessage(orderId, userName, userPhone, cart, total, address, dailyOrderNum) {
  const now = new Date();
  const timeStr = now.toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
    timeZone: 'Asia/Kolkata',
  });
  const dateStr = now.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    timeZone: 'Asia/Kolkata',
  });


  let msg = `🔔🔔🔔 *NEW ORDER!* 🔔🔔🔔\n`;
  msg += `━━━━━━━━━━━━━━━━━━━━━\n\n`;
  msg += `📦 *Order #${dailyOrderNum} Today*\n`;
  msg += `🆔 *ID:* ${orderId}\n`;
  msg += `🕐 *Time:* ${timeStr} • ${dateStr}\n\n`;

  msg += `━━━━━━━━━━━━━━━━━━━━━\n`;
  msg += `👤 *CUSTOMER DETAILS*\n`;
  msg += `━━━━━━━━━━━━━━━━━━━━━\n`;
  msg += `📛 *Name:* ${userName}\n`;
  const customerPhone = String(userPhone || '')
  .replace(/\D/g, '');

msg += `📱 *Phone:* ${customerPhone}\n\n`;

  msg += `━━━━━━━━━━━━━━━━━━━━━\n`;
  msg += `📍 *DELIVERY LOCATION*\n`;
  msg += `━━━━━━━━━━━━━━━━━━━━━\n`;
  msg += `${address}\n\n`;

  msg += `━━━━━━━━━━━━━━━━━━━━━\n`;
  msg += `🛒 *ORDER ITEMS*\n`;
  msg += `━━━━━━━━━━━━━━━━━━━━━\n`;

  cart.forEach((item, i) => {
    const lineTotal = item.price * item.qty;
    let line = `  ${i + 1}. *${item.name}*`;
    if (item.size) line += ` (${item.size})`;
    if (item.extraCheese) line += ` +🧀Cheese`;
    line += `\n     × ${item.qty} — ₹${lineTotal}`;
    msg += line + '\n';
  });

  msg += `\n━━━━━━━━━━━━━━━━━━━━━\n`;
  msg += `💰 *TOTAL: ₹${total}*\n`;
  msg += `💳 *Payment: Cash on Delivery*\n`;
  msg += `━━━━━━━━━━━━━━━━━━━━━`;

  return msg;
}

module.exports = {
  languageSelectionMessage,
  startOrderingMessage,
  welcomeMessage,
  mainMenuMessage,
  categoryItemsMessage,
  combosMessage,
  sizeSelectionMessage,
  extraCheeseChoiceMessage,
  categoryNextStepMessage,
  itemAddedMessage,
  cartMessage,
  addressPromptMessage,
  orderConfirmMessage,
  orderPlacedMessage,
  helpMessage,
  unknownMessage,
  storeClosedMessage,
  ownerNotificationMessage,
};
