// ============================================================
// Town Pizza Planet — Final Button/Catalogue Conversation Handler
// ============================================================
// Flow:
// Hi -> Language -> Bestsellers -> Menu categories ->
// item image/price -> extra cheese (pizza only) -> quantity ->
// Add to Cart -> Cart -> typed delivery address -> COD -> Confirm.
// ============================================================

const path = require('path');

const {
  categories,
  bestsellers,
  findItemById,
  getFinalPrice,
  EXTRA_CHEESE_PRICE,
} = require('../data/menu');
const { combos, findComboById } = require('../data/combos');
const { familyPacks, findFamilyPackById } = require('../data/familyPacks');
const {
  getSession,
  updateSessionState,
  setPendingItem,
  setAddress,
  setLanguage,
  resetSession,
  createOrder,
  getTodayOrderCount,
} = require('../db/database');
const {
  addItem,
  addCombo,
  clearCart,
  getCart,
  getTotal,
} = require('../utils/cartManager');
const ui = require('../ui/whatsappUI');

let parser = null;
try {
  parser = require('./messageParser');
} catch {
  parser = null;
}

const INTENT = parser?.INTENT || {};
const parseMessage = typeof parser?.parseMessage === 'function'
  ? parser.parseMessage
  : () => ({ intent: null });

const STATE = {
  IDLE: 'IDLE',
  LANG_SELECT: 'LANG_SELECT',
  MAIN_MENU: 'MAIN_MENU',
  CATEGORY_BROWSE: 'CATEGORY_BROWSE',
  EXTRA_CHEESE_SELECT: 'EXTRA_CHEESE_SELECT',
  QUANTITY_SELECT: 'QUANTITY_SELECT',
  COMBO_QUANTITY: 'COMBO_QUANTITY',
  CART: 'CART',
  CHECKOUT_ADDRESS: 'CHECKOUT_ADDRESS',
  CHECKOUT_PAYMENT: 'CHECKOUT_PAYMENT',
  CHECKOUT_CONFIRM: 'CHECKOUT_CONFIRM',
};

const LANG_ROWS = [
  { id: 'lang:en', title: 'English', description: 'Continue in English' },
  { id: 'lang:kn', title: 'ಕನ್ನಡ (Kannada)', description: 'ಮುಂದುವರಿಸಿ ಕನ್ನಡದಲ್ಲಿ' },
  { id: 'lang:hi', title: 'हिंदी (Hindi)', description: 'हिंदी में जारी रखें' },
  { id: 'lang:ur', title: 'اردو (Urdu)', description: 'اردو میں جاری رکھیں' },
];

function finalPrice(item) {
  const price = Number(getFinalPrice(item));
  return Number.isFinite(price) ? price : NaN;
}

function categoryRows() {
  return [
    { id: 'cat:pizzas', title: '🍕 Pizza', description: 'Tap to browse pizzas' },
    { id: 'cat:burgers', title: '🍔 Burgers', description: 'Tap to browse burgers' },
    { id: 'cat:sandwichesAndSides', title: '🥪 Sandwiches & Sides', description: 'Sandwiches, fries & sides' },
    { id: 'cat:milkshakes', title: '🥤 Shakes', description: 'Milkshakes & cold coffee' },
    { id: 'cat:combos', title: '🎁 Combo Deals', description: 'Regular combo offers' },
    { id: 'cat:familyPacks', title: '👨‍👩‍👧‍👦 Family Packs', description: 'Family-size offers' },
  ];
}

function menuReply() {
  return ui.list(
    '🍕 *Town Pizza Planet*\n\nWhat would you like to order?',
    'Open Menu',
    categoryRows(),
    'Town Pizza Planet',
    'Tap a category to continue'
  );
}

function bestsellerRows() {
  return bestsellers.map(id => {
    const item = findItemById(id);
    if (!item) return null;
    const price = finalPrice(item);
    return {
      id: `item:${item.id}`,
      title: `${item.name} — ₹${price}`,
      description: '⭐ Bestseller • Tap to view',
    };
  }).filter(Boolean);
}

function bestsellerReply() {
  return ui.list(
    '⭐ *Bestsellers*\n\nOur customer favourites: Sweet Corn Pizza, Baby Corn Pizza, Paneer Pizza & Cheez Burger.',
    'View Bestsellers',
    bestsellerRows(),
    'Bestsellers',
    'Tap an item to view'
  );
}

function productRows(category) {
  return (category?.items || []).map(item => {
    const price = finalPrice(item);
    return {
      id: `item:${item.id}`,
      title: `${item.name} — ₹${price}`,
      description: 'Tap to see image & add',
    };
  }).slice(0, 10);
}

function comboRows() {
  return combos.map(combo => ({
    id: `combo:${combo.id}`,
    title: `${combo.name} — ₹${combo.price}`,
    description: combo.description,
  }));
}

function familyRows() {
  return familyPacks.map(pack => ({
    id: `family:${pack.id}`,
    title: `${pack.name} — ₹${pack.price}`,
    description: pack.description,
  }));
}

function comboListReplies() {
  const rows = comboRows();
  const chunks = [];
  for (let i = 0; i < rows.length; i += 10) chunks.push(rows.slice(i, i + 10));

  return chunks.map((chunk, index) => ui.list(
    `🎁 *Combo Deals*${index ? ' — More' : ''}\n\nChoose a combo.`,
    'View Combos',
    chunk,
    index ? 'More Combo Deals' : 'Combo Deals',
    'Tap a combo to view image & price'
  ));
}

function familyPackReply() {
  return ui.list(
    '👨‍👩‍👧‍👦 *Family Packs*\n\nChoose a family pack.',
    'View Family Packs',
    familyRows(),
    'Family Packs',
    'Separate from regular Combo Deals'
  );
}

function quantityButtons() {
  return ui.buttons('Use the buttons below.', [
    { id: 'qty:minus', body: '➖' },
    { id: 'qty:add', body: '🛒 Add to Cart' },
    { id: 'qty:plus', body: '➕' },
  ]);
}

function quickActions() {
  return ui.buttons('What would you like to do next?', [
    { id: 'action:menu', body: '📋 Menu' },
    { id: 'action:cart', body: '🛒 Cart' },
    { id: 'action:checkout', body: '💳 Checkout' },
  ]);
}

function productDetailReplies(item) {
  const price = finalPrice(item);
  const replies = [];
  const media = ui.productImage(item);
  if (media) replies.push(media);

  replies.push(ui.text(
    `🍽️ *${item.name}*\n\n💰 *Price: ₹${price}*\n\nChoose an option below.`
  ));

  if (item.id.startsWith('P')) {
    replies.push(ui.buttons(
      `🧀 *Extra Cheese +₹${EXTRA_CHEESE_PRICE}*\n\nWould you like extra cheese?`,
      [
        { id: 'cheese:yes', body: `🧀 Yes +₹${EXTRA_CHEESE_PRICE}` },
        { id: 'cheese:no', body: '❌ No' },
        { id: 'action:cancel', body: '↩️ Cancel' },
      ],
      item.name,
      `Final pizza price: ₹${price}`
    ));
  } else {
    replies.push(quantityButtons());
  }

  return replies;
}

function pendingQuantityReply(pending) {
  const unit = Number(pending.unitPrice);
  const qty = Math.max(1, Number(pending.qty || 1));
  const cheese = pending.extraCheese ? EXTRA_CHEESE_PRICE : 0;
  const effectiveUnit = unit + cheese;
  const total = effectiveUnit * qty;

  return [
    ui.text(
      `🔢 *${pending.name}*\n\nQuantity: *${qty}*\nUnit price: ₹${effectiveUnit}\nTotal: *₹${total}*`
    ),
    quantityButtons(),
  ];
}

function cartReply(userId) {
  const cart = getCart(userId);
  if (!cart.length) {
    return [ui.text('🛒 *Your cart is empty.*'), menuReply()];
  }

  let total = 0;
  const lines = cart.map((item, index) => {
    const price = Number(item?.price);
    const qty = Number(item?.qty);
    const line = (Number.isFinite(price) ? price : 0) * (Number.isFinite(qty) ? qty : 0);
    total += line;
    return `${index + 1}. ${item.name}${item.extraCheese ? ' +🧀 Extra Cheese' : ''} × ${qty} — ₹${line}`;
  });

  return [
    ui.text(`🛒 *Your Cart*\n\n${lines.join('\n')}\n\n━━━━━━━━━━━━\n*Total: ₹${total}*`),
    ui.buttons('Choose an action', [
      { id: 'action:menu', body: '➕ Add More' },
      { id: 'action:checkout', body: '💳 Checkout' },
      { id: 'cart:clear', body: '🗑️ Clear' },
    ]),
  ];
}

function normalizeDirectId(raw) {
  return String(raw || '').trim().toUpperCase().replace(/\s+/g, '');
}

function restartWithLanguage(userId) {
  updateSessionState(userId, STATE.LANG_SELECT);
  return [ui.list(
    '👋 *Welcome to Town Pizza Planet!*\n\nPlease choose your language.',
    'Choose Language',
    LANG_ROWS,
    'Language',
    'English • Kannada • Hindi • Urdu'
  )];
}

async function handleMessage(userId, messageText, contactName) {
  const session = getSession(userId);
  const raw = String(messageText || '').trim();
  const lower = raw.toLowerCase();
  const parsed = parseMessage(raw) || {};
  const intent = parsed.intent;
  const lang = session.lang || 'en';

  // ------------------------------------------------------------
  // GLOBAL / BUTTON ACTIONS
  // ------------------------------------------------------------
  if (lower.startsWith('lang:')) {
    const selected = lower.split(':')[1];
    if (['en', 'kn', 'hi', 'ur'].includes(selected)) {
      setLanguage(userId, selected);
      updateSessionState(userId, STATE.MAIN_MENU);
      return {
        replies: [
          ui.text(`✅ ${selected === 'en' ? 'English' : selected === 'kn' ? 'ಕನ್ನಡ' : selected === 'hi' ? 'हिंदी' : 'اردو'} selected.`),
          bestsellerReply(),
          menuReply(),
        ],
        notifyOwner: null,
      };
    }
  }

  if (lower === 'action:cancel' || lower === 'cancel') {
    setPendingItem(userId, null);
    updateSessionState(userId, STATE.MAIN_MENU);
    return { replies: [ui.text('↩️ Cancelled.'), menuReply()], notifyOwner: null };
  }

  if (lower === 'action:start' || lower === 'start' || lower === 'restart') {
    if (!session.lang) return { replies: restartWithLanguage(userId), notifyOwner: null };
    updateSessionState(userId, STATE.MAIN_MENU);
    return { replies: [bestsellerReply(), menuReply()], notifyOwner: null };
  }

  if (lower === 'action:menu' || lower === 'menu' || intent === INTENT.MENU) {
    updateSessionState(userId, STATE.MAIN_MENU);
    return { replies: [bestsellerReply(), menuReply()], notifyOwner: null };
  }

  if (lower === 'action:cart' || lower === 'cart' || intent === INTENT.CART) {
    updateSessionState(userId, STATE.CART);
    return { replies: cartReply(userId), notifyOwner: null };
  }

  if (lower === 'cart:clear' || lower === 'clear cart' || intent === INTENT.CLEAR) {
    clearCart(userId);
    updateSessionState(userId, STATE.MAIN_MENU);
    return { replies: [ui.text('🗑️ *Cart cleared.*'), menuReply()], notifyOwner: null };
  }

  // ------------------------------------------------------------
  // LANGUAGE SELECTION FALLBACK
  // ------------------------------------------------------------
  if (!session.lang && (intent === INTENT.GREETING || ['hi', 'hello', 'hey', 'namaste', 'menu', 'start'].includes(lower))) {
    return { replies: restartWithLanguage(userId), notifyOwner: null };
  }

  // ------------------------------------------------------------
  // DELIVERY ADDRESS: ONLY TYPED TEXT
  // ------------------------------------------------------------
  if (session.state === STATE.CHECKOUT_ADDRESS && raw.length >= 5) {
    setAddress(userId, raw);
    updateSessionState(userId, STATE.CHECKOUT_PAYMENT);
    return {
      replies: [
        ui.text(`📍 *Address saved.*\n\n${raw}`),
        ui.buttons('Choose payment method', [
          { id: 'payment:cod', body: '💵 Cash on Delivery' },
          { id: 'action:cart', body: '🛒 Back to Cart' },
          { id: 'order:cancel', body: '❌ Cancel' },
        ]),
      ],
      notifyOwner: null,
    };
  }

  // ------------------------------------------------------------
  // CATEGORY BUTTONS
  // ------------------------------------------------------------
  if (lower.startsWith('cat:')) {
    const key = raw.slice(4);

    if (key === 'combos') {
      updateSessionState(userId, STATE.CATEGORY_BROWSE);
      return { replies: comboListReplies(), notifyOwner: null };
    }

    if (key === 'familyPacks') {
      updateSessionState(userId, STATE.CATEGORY_BROWSE);
      return { replies: [familyPackReply()], notifyOwner: null };
    }

    const category = categories.find(c => c.key === key);
    if (!category) return { replies: [ui.text('That category is unavailable right now. Please choose another category.')], notifyOwner: null };

    updateSessionState(userId, STATE.CATEGORY_BROWSE);
    return {
      replies: [ui.list(
        `${category.emoji} *${category.name}*\n\nChoose a dish.`,
        'View Items',
        productRows(category),
        category.name,
        'Tap an item to see image, price & add option'
      )],
      notifyOwner: null,
    };
  }

  // ------------------------------------------------------------
  // PRODUCT BUTTON / LIST SELECTION
  // ------------------------------------------------------------
  if (lower.startsWith('item:')) {
    const id = raw.slice(5);
    const item = findItemById(id);
    if (!item) return { replies: [ui.text('Sorry, that dish is unavailable right now.')], notifyOwner: null };

    const price = finalPrice(item);
    if (!Number.isFinite(price)) return { replies: [ui.text('Sorry, this dish has an invalid price and cannot be ordered right now.')], notifyOwner: null };

    const pending = {
      id: item.id,
      name: item.name,
      unitPrice: price,
      qty: 1,
      extraCheese: false,
      isCombo: false,
    };
    setPendingItem(userId, pending);

    if (item.id.startsWith('P')) updateSessionState(userId, STATE.EXTRA_CHEESE_SELECT);
    else updateSessionState(userId, STATE.QUANTITY_SELECT);

    return { replies: productDetailReplies(item), notifyOwner: null };
  }

  // ------------------------------------------------------------
  // COMBO BUTTON / LIST SELECTION
  // ------------------------------------------------------------
  if (lower.startsWith('combo:')) {
    const combo = findComboById(raw.slice(6));
    if (!combo) return { replies: [ui.text('Sorry, that combo is unavailable right now.')], notifyOwner: null };

    const pending = {
      id: combo.id,
      name: combo.name,
      unitPrice: Number(combo.price),
      qty: 1,
      extraCheese: false,
      isCombo: true,
      packType: 'combo',
    };
    setPendingItem(userId, pending);
    updateSessionState(userId, STATE.COMBO_QUANTITY);

    const replies = [];
    const media = ui.comboImage(combo);
    if (media) replies.push(media);
    replies.push(ui.text(`🎁 *${combo.name}*\n\n${combo.description}\n\n💰 *₹${combo.price}*`));
    replies.push(...pendingQuantityReply(pending));
    return { replies, notifyOwner: null };
  }

  // ------------------------------------------------------------
  // FAMILY PACK BUTTON / LIST SELECTION
  // ------------------------------------------------------------
  if (lower.startsWith('family:')) {
    const pack = findFamilyPackById(raw.slice(7));
    if (!pack) return { replies: [ui.text('Sorry, that family pack is unavailable right now.')], notifyOwner: null };

    const pending = {
      id: pack.id,
      name: pack.name,
      unitPrice: Number(pack.price),
      qty: 1,
      extraCheese: false,
      isCombo: true,
      packType: 'family',
    };
    setPendingItem(userId, pending);
    updateSessionState(userId, STATE.COMBO_QUANTITY);

    const replies = [];
    const media = ui.familyPackImage(pack);
    if (media) replies.push(media);
    replies.push(ui.text(`👨‍👩‍👧‍👦 *${pack.name}*\n\n${pack.description}\n\n💰 *₹${pack.price}*`));
    replies.push(...pendingQuantityReply(pending));
    return { replies, notifyOwner: null };
  }

  // ------------------------------------------------------------
  // EXTRA CHEESE
  // ------------------------------------------------------------
  if (lower === 'cheese:yes' || lower === 'cheese:no') {
    const pending = session.pending_item;
    if (!pending || !pending.id) return { replies: [ui.text('Please choose a dish again.')], notifyOwner: null };

    pending.extraCheese = lower === 'cheese:yes';
    setPendingItem(userId, pending);
    updateSessionState(userId, STATE.QUANTITY_SELECT);
    return { replies: pendingQuantityReply(pending), notifyOwner: null };
  }

  // ------------------------------------------------------------
  // QUANTITY CONTROLS
  // ------------------------------------------------------------
  if (lower === 'qty:minus' || lower === 'qty:plus') {
    const pending = session.pending_item;
    if (!pending) return { replies: [ui.text('Please choose a dish again.')], notifyOwner: null };

    pending.qty = Math.max(
      1,
      Number(pending.qty || 1) + (lower === 'qty:plus' ? 1 : -1)
    );
    setPendingItem(userId, pending);
    updateSessionState(userId, pending.isCombo ? STATE.COMBO_QUANTITY : STATE.QUANTITY_SELECT);
    return { replies: pendingQuantityReply(pending), notifyOwner: null };
  }

  if (lower === 'qty:add') {
    const pending = session.pending_item;
    if (!pending?.id) return { replies: [ui.text('Please choose a dish again.')], notifyOwner: null };

    try {
      if (pending.isCombo) {
        const combo = findComboById(pending.id);
        const family = findFamilyPackById(pending.id);
        const chosen = combo || family;
        if (!chosen) throw new Error(`Unknown pack ${pending.id}`);
        addCombo(userId, chosen, Number(pending.qty || 1));
      } else {
        const item = findItemById(pending.id);
        if (!item) throw new Error(`Unknown item ${pending.id}`);
        addItem(userId, item, Number(pending.qty || 1), null, Boolean(pending.extraCheese));
      }
    } catch (err) {
      console.error('❌ Add-to-cart failed:', err);
      return { replies: [ui.text('😥 I could not add that item. Please try again.')], notifyOwner: null };
    }

    const addedText = `${pending.name}${pending.extraCheese ? ' +🧀 Extra Cheese' : ''} × ${pending.qty}`;
    setPendingItem(userId, null);
    updateSessionState(userId, STATE.CATEGORY_BROWSE);

    return {
      replies: [ui.text(`✅ *Added to cart!*\n${addedText}`), quickActions()],
      notifyOwner: null,
    };
  }

  // ------------------------------------------------------------
  // CHECKOUT
  // ------------------------------------------------------------
  if (lower === 'action:checkout' || lower === 'checkout' || intent === INTENT.CHECKOUT) {
    const cart = getCart(userId);
    if (!cart.length) return { replies: [ui.text('🛒 *Your cart is empty.*'), menuReply()], notifyOwner: null };

    updateSessionState(userId, STATE.CHECKOUT_ADDRESS);
    return {
      replies: [ui.text(
        '📍 *Delivery Address*\n\nPlease type your complete delivery address.\n\n🔒 Address is collected as typed text only. No GPS location or Google Maps link is required.'
      )],
      notifyOwner: null,
    };
  }

  if (lower === 'payment:cod') {
    const cart = getCart(userId);
    const total = Number(getTotal(cart));
    if (!cart.length || !Number.isFinite(total)) {
      return { replies: [ui.text('😥 Your cart needs to be corrected before checkout.')], notifyOwner: null };
    }

    updateSessionState(userId, STATE.CHECKOUT_CONFIRM);
    return {
      replies: [
        ui.text(`💵 *Cash on Delivery selected.*\n\nTotal: *₹${total}*`),
        ui.buttons('Confirm your order?', [
          { id: 'order:confirm', body: '✅ Confirm Order' },
          { id: 'order:cancel', body: '❌ Cancel' },
        ]),
      ],
      notifyOwner: null,
    };
  }

  if (lower === 'order:cancel') {
    updateSessionState(userId, STATE.CART);
    return { replies: [ui.text('❌ Order cancelled.'), ...cartReply(userId)], notifyOwner: null };
  }

  if (lower === 'order:confirm') {
    const cart = getCart(userId);
    const total = Number(getTotal(cart));
    const address = String(session.address || '').trim();

    if (!cart.length || !Number.isFinite(total)) {
      return { replies: [ui.text('😥 Your cart needs to be corrected before placing the order.')], notifyOwner: null };
    }
    if (address.length < 5) {
      updateSessionState(userId, STATE.CHECKOUT_ADDRESS);
      return { replies: [ui.text('📍 Please enter a valid delivery address first.')], notifyOwner: null };
    }

    let orderId;
    try {
      orderId = await Promise.resolve(
        createOrder(userId, contactName || 'Customer', cart, total, address)
      );
    } catch (err) {
      console.error('❌ createOrder failed:', err);
      return { replies: [ui.text('😥 I could not place the order. Please try again.')], notifyOwner: null };
    }

    const id = String(orderId);
    let daily = 1;
    try {
      daily = Number(await Promise.resolve(getTodayOrderCount())) || 1;
    } catch {}

    const ownerLines = cart.map((item, index) => {
      const qty = Number(item?.qty || 0);
      const price = Number(item?.price || 0);
      return `${index + 1}. ${item.name}${item.extraCheese ? ' +🧀 Extra Cheese' : ''} × ${qty} — ₹${price * qty}`;
    });

    const ownerMessage = [
      '🔔 *NEW ORDER — TOWN PIZZA PLANET*',
      `📦 Order #${daily}`,
      `🆔 ID: ${id}`,
      `👤 Customer: ${contactName || 'Customer'}`,
      `📱 Phone: ${String(userId).replace('@c.us', '')}`,
      '',
      ...ownerLines,
      '',
      `💰 *TOTAL: ₹${total}*`,
      '💵 Payment: Cash on Delivery',
      `📍 Address: ${address}`,
      '',
      '📞 Call for more details: 9448769098 / 6362648283',
    ].join('\n');

    const reply = ui.text(
      `🎉 *Order Placed Successfully!* 🎉\n\n📦 *Order ID:* ${id}\n💰 *Total:* ₹${total}\n💵 *Payment:* Cash on Delivery\n\nThank you for ordering from *Town Pizza Planet*! ❤️`
    );

    // Preserve selected language for the next order while clearing the cart.
    resetSession(userId);
    try { setLanguage(userId, lang); } catch {}

    return {
      replies: [reply],
      notifyOwner: { message: ownerMessage, orderId: id },
    };
  }

  // ------------------------------------------------------------
  // TEXT FALLBACKS / FIRST CONTACT
  // ------------------------------------------------------------
  if (intent === INTENT.GREETING || ['hi', 'hello', 'hey', 'namaste', 'salaam'].includes(lower)) {
    if (!session.lang) return { replies: restartWithLanguage(userId), notifyOwner: null };
    updateSessionState(userId, STATE.MAIN_MENU);
    return { replies: [bestsellerReply(), menuReply()], notifyOwner: null };
  }

  if (intent === INTENT.CHANGE_LANG || lower === 'language') {
    return { replies: restartWithLanguage(userId), notifyOwner: null };
  }

  if (intent === INTENT.HELP || lower === 'help') {
    return {
      replies: [ui.text('Use the buttons to browse the menu, view your cart, and checkout. You can also type *menu*, *cart*, or *checkout*.')],
      notifyOwner: null,
    };
  }

  // Direct code fallback, useful for owner testing even though the customer UI is button-first.
  const directId = normalizeDirectId(raw);
  if (directId) {
    const item = findItemById(directId);
    const combo = findComboById(directId);
    const family = findFamilyPackById(directId);
    if (item) {
      const price = finalPrice(item);
      const pending = { id: item.id, name: item.name, unitPrice: price, qty: 1, extraCheese: false, isCombo: false };
      setPendingItem(userId, pending);
      updateSessionState(userId, item.id.startsWith('P') ? STATE.EXTRA_CHEESE_SELECT : STATE.QUANTITY_SELECT);
      return { replies: productDetailReplies(item), notifyOwner: null };
    }
    if (combo || family) {
      const pack = combo || family;
      const pending = { id: pack.id, name: pack.name, unitPrice: Number(pack.price), qty: 1, extraCheese: false, isCombo: true };
      setPendingItem(userId, pending);
      updateSessionState(userId, STATE.COMBO_QUANTITY);
      const replies = [];
      const media = combo ? ui.comboImage(pack) : ui.familyPackImage(pack);
      if (media) replies.push(media);
      replies.push(ui.text(`🎁 *${pack.name}*\n\n${pack.description}\n\n💰 *₹${pack.price}*`));
      replies.push(...pendingQuantityReply(pending));
      return { replies, notifyOwner: null };
    }
  }

  return {
    replies: [ui.text('🤔 Please use the buttons above to continue, or type *menu* to open the menu.')],
    notifyOwner: null,
  };
}

module.exports = { handleMessage, STATE };
