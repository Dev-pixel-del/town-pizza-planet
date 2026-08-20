const { parseMessage, INTENT, CATEGORY_MAP } = require('./messageParser');
const { categories } = require('../data/menu');
const { combos, findComboById } = require('../data/combos');
const { tr } = require('../data/locale');
const {
  getSession,
  updateSessionState,
  setPendingItem,
  setPendingCombo,
  setLanguage,
  setLocation,
  setLandmark,
  setAddress,
  resetSession,
  createOrder,
  getTodayOrderCount,
} = require('../db/database');
const { addItem, addCombo, removeItem, clearCart, getCart, getTotal } = require('../utils/cartManager');
const fmt = require('../utils/formatter');

const LANG_MAP = { '1': 'kn', '2': 'en', '3': 'hi', '4': 'ur' };

const STATE = {
  IDLE: 'IDLE',
  LANG_SELECT: 'LANG_SELECT',
  MAIN_MENU: 'MAIN_MENU',
  CATEGORY_BROWSE: 'CATEGORY_BROWSE',
  CHECKOUT_LOCATION: 'CHECKOUT_LOCATION',
  CHECKOUT_LANDMARK: 'CHECKOUT_LANDMARK',
  CHECKOUT_ADDRESS: 'CHECKOUT_ADDRESS',
  CHECKOUT_CONFIRM: 'CHECKOUT_CONFIRM',
};

function categoryByKey(key) { return categories.find(c => c.key === key) || null; }

function distanceKm(lat1, lon1, lat2, lon2) {
  const toRad = d => d * Math.PI / 180;
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(a));
}

function validateDeliveryLocation(location) {
  const rLat = Number(process.env.RESTAURANT_LATITUDE);
  const rLon = Number(process.env.RESTAURANT_LONGITUDE);
  const radius = Number(process.env.DELIVERY_RADIUS_KM || 5);
  if (![rLat, rLon, location?.latitude, location?.longitude].every(Number.isFinite)) {
    return { deliverable: true, distanceKm: null };
  }
  const d = distanceKm(rLat, rLon, Number(location.latitude), Number(location.longitude));
  return { deliverable: d <= radius, distanceKm: d, radiusKm: radius };
}


async function handleMessage(userId, messageText, contactName, location = null) {
  const session = getSession(userId);
  const parsed = parseMessage(messageText || '');
  const lang = session.lang || 'en';
  let notifyOwner = null;
  const text = String(messageText || '').trim();

  // First priority: location message when location is expected.
  if (location && session.state === STATE.CHECKOUT_LOCATION) {
    const receivedLocation = {
      latitude: Number(location.latitude),
      longitude: Number(location.longitude),
      name: location.name || null,
      address: location.address || null,
      url: location.url || null,
    };
    const validation = validateDeliveryLocation(receivedLocation);
    if (!validation.deliverable) {
      const radius = validation.radiusKm || Number(process.env.DELIVERY_RADIUS_KM || 5);
      const msg = lang === 'kn'
        ? `ಕ್ಷಮಿಸಿ 🙏 ನಮ್ಮ ಡೆಲಿವರಿ ಪ್ರದೇಶವು ಸುಮಾರು ${radius} km ಒಳಗೆ ಮಾತ್ರ ಇದೆ. ದಯವಿಟ್ಟು ಇನ್ನೊಂದು ಸ್ಥಳ ನೀಡಿ.`
        : lang === 'hi'
          ? `माफ़ करें 🙏 हमारी डिलीवरी लगभग ${radius} km के अंदर है. कृपया दूसरा स्थान दें.`
          : lang === 'ur'
            ? `معذرت 🙏 ہماری ڈیلیوری تقریباً ${radius} کلومیٹر تک ہے۔ براہ کرم دوسرا مقام شیئر کریں۔`
            : `Sorry 🙏 We currently deliver within about ${radius} km. Please share another location.`;
      return { replies: [msg, fmt.locationPromptMessage(lang)], notifyOwner };
    }
    setLocation(userId, receivedLocation);
    updateSessionState(userId, STATE.CHECKOUT_LANDMARK);
    return { replies: [fmt.locationReceivedMessage(lang)], notifyOwner };
  }

  if (parsed.intent === INTENT.CHANGE_LANG) {
    updateSessionState(userId, STATE.LANG_SELECT);
    return { replies: [fmt.languageSelectionMessage()], notifyOwner };
  }
  if (parsed.intent === INTENT.HELP) return { replies: [fmt.helpMessage(lang)], notifyOwner };
  if (parsed.intent === INTENT.RESET) {
    resetSession(userId);
    const s = getSession(userId);
    updateSessionState(userId, STATE.MAIN_MENU);
    return { replies: [fmt.welcomeMessage(contactName, s.lang || lang), fmt.mainMenuMessage(s.lang || lang)], notifyOwner };
  }
  if (parsed.intent === INTENT.CLEAR) {
    clearCart(userId);
    return { replies: [tr('cartEmpty', lang)], notifyOwner };
  }
  if (parsed.intent === INTENT.CART) return { replies: [fmt.cartMessage(getCart(userId), lang)], notifyOwner };

  // State machine.
  switch (session.state) {
    case STATE.IDLE: {
      if (!session.lang) {
        updateSessionState(userId, STATE.LANG_SELECT);
        return { replies: [fmt.languageSelectionMessage()], notifyOwner };
      }
      updateSessionState(userId, STATE.MAIN_MENU);
      return { replies: [fmt.welcomeMessage(contactName, lang), fmt.mainMenuMessage(lang)], notifyOwner };
    }

    case STATE.LANG_SELECT: {
      const selected = LANG_MAP[text] || parsed.data;
      if (selected && ['en', 'kn', 'hi', 'ur'].includes(selected)) {
        setLanguage(userId, selected);
        updateSessionState(userId, STATE.MAIN_MENU);
        return { replies: [fmt.welcomeMessage(contactName, selected), fmt.mainMenuMessage(selected)], notifyOwner };
      }
      return { replies: [fmt.languageSelectionMessage()], notifyOwner };
    }

    case STATE.CHECKOUT_LOCATION: {
      if (['cancel', 'back', 'no'].includes(text.toLowerCase())) {
        updateSessionState(userId, STATE.MAIN_MENU);
        return { replies: [tr('generic').cancelled[lang] || 'Cancelled.'], notifyOwner };
      }
      if (/^(cant|cannot|can't|no location|manual|address|पता|ವಿಳಾಸ|پتہ)/i.test(text)) {
        updateSessionState(userId, STATE.CHECKOUT_ADDRESS);
        return { replies: [
          lang === 'kn' ? '🏠 ದಯವಿಟ್ಟು ಸಂಪೂರ್ಣ ಡೆಲಿವರಿ ವಿಳಾಸ ಮತ್ತು ಹತ್ತಿರದ ಲ್ಯಾಂಡ್‌ಮಾರ್ಕ್ ಕಳುಹಿಸಿ.' :
          lang === 'hi' ? '🏠 कृपया पूरा डिलीवरी पता और पास का लैंडमार्क भेजें.' :
          lang === 'ur' ? '🏠 براہ کرم مکمل ڈیلیوری پتہ اور قریب کا لینڈ مارک بھیجیں۔' :
          '🏠 Please send the complete delivery address and a nearby landmark.'
        ], notifyOwner };
      }
      return { replies: [fmt.locationPromptMessage(lang)], notifyOwner };
    }

    case STATE.CHECKOUT_LANDMARK: {
      if (!text || text.length < 2) return { replies: [fmt.locationReceivedMessage(lang)], notifyOwner };
      setLandmark(userId, text);
      updateSessionState(userId, STATE.CHECKOUT_CONFIRM);
      const cart = getCart(userId);
      return { replies: [fmt.orderConfirmMessage(cart, getSession(userId), lang)], notifyOwner };
    }

    case STATE.CHECKOUT_ADDRESS: {
      if (parsed.intent === INTENT.CANCEL) {
        updateSessionState(userId, STATE.MAIN_MENU);
        return { replies: [tr('generic').cancelled[lang] || 'Cancelled.', fmt.cartMessage(getCart(userId), lang)], notifyOwner };
      }
      if (text.length >= 5) {
        setAddress(userId, text);
        updateSessionState(userId, STATE.CHECKOUT_CONFIRM);
        return { replies: [fmt.orderConfirmMessage(getCart(userId), getSession(userId), lang)], notifyOwner };
      }
      return { replies: ['📍 Please send a complete address and nearby landmark.'], notifyOwner };
    }

    case STATE.CHECKOUT_CONFIRM: {
      if (parsed.intent === INTENT.YES) {
        const cart = getCart(userId);
        const total = getTotal(cart);
        if (total < 150) {
          updateSessionState(userId, STATE.MAIN_MENU);
          return { replies: [fmt.minOrderMessage(150 - total, lang), fmt.cartMessage(cart, lang)], notifyOwner };
        }
        const current = getSession(userId);
        const orderId = await createOrder(userId, contactName || 'Customer', cart, total, total, {
          language: lang,
          location: current.location,
          landmark: current.landmark,
          address: current.address,
        });
        resetSession(userId);
        setLanguage(userId, lang);
        updateSessionState(userId, STATE.MAIN_MENU);
        const order = require('../db/database').getOrderById(orderId);
        notifyOwner = { orderId, message: fmt.ownerNotificationMessage(order, getTodayOrderCount()) };
        return { replies: [fmt.orderPlacedMessage(orderId, total, lang)], notifyOwner };
      }
      if (parsed.intent === INTENT.NO || parsed.intent === INTENT.CANCEL) {
        updateSessionState(userId, STATE.MAIN_MENU);
        return { replies: [tr('generic').cancelled[lang] || 'Cancelled.', fmt.mainMenuMessage(lang)], notifyOwner };
      }
      return { replies: [tr('confirm', lang)], notifyOwner };
    }

    case STATE.MAIN_MENU:
    case STATE.CATEGORY_BROWSE: {
      if (parsed.intent === INTENT.GREETING) return { replies: [fmt.welcomeMessage(contactName, lang), fmt.mainMenuMessage(lang)], notifyOwner };
      if (parsed.intent === INTENT.MENU) { updateSessionState(userId, STATE.MAIN_MENU); return { replies: [fmt.mainMenuMessage(lang)], notifyOwner }; }
      if (parsed.intent === INTENT.COMBOS) return { replies: [fmt.combosMessage(lang)], notifyOwner };
      if (parsed.intent === INTENT.CANCEL) { updateSessionState(userId, STATE.MAIN_MENU); return { replies: [fmt.mainMenuMessage(lang)], notifyOwner }; }

      if (parsed.intent === INTENT.SELECT_CATEGORY) {
        if (parsed.data === 'combos') return { replies: [fmt.combosMessage(lang)], notifyOwner };
        const cat = categoryByKey(parsed.data);
        if (cat) {
          updateSessionState(userId, STATE.CATEGORY_BROWSE);
          return { replies: [fmt.categoryItemsMessage(cat, lang)], notifyOwner };
        }
      }

      if (parsed.intent === INTENT.ADD_COMBO) {
        addCombo(userId, parsed.data);
        return postAddResponse(userId, lang, `🎁 Added *${parsed.data.name}* — ₹${parsed.data.price}`);
      }

      if (parsed.intent === INTENT.ADD_ITEM) {
        const items = Array.isArray(parsed.data) ? parsed.data : [parsed.data];
        const byName = new Map();
        for (const entry of items) {
          const item = entry.item || entry;
          if (!item || !item.price) continue;
          const key = item.name.toLowerCase();
          if (!byName.has(key)) byName.set(key, []);
          byName.get(key).push({ item, qty: Math.max(1, Number(entry.qty || 1)) });
        }
        for (const [name, choices] of byName.entries()) {
          if (choices.length > 1) {
            const lines = choices.map(c => `• ${c.item.name} — ₹${c.item.price}`).join('\n');
            return { replies: [`Which *${name}* would you like?\n${lines}`], notifyOwner };
          }
        }
        const added = [];
        for (const entry of items) {
          const item = entry.item || entry;
          if (!item || !item.price) continue;
          const qty = Math.max(1, Number(entry.qty || 1));
          addItem(userId, item, qty, false);
          added.push(`${item.name} × ${qty} — ₹${item.price * qty}`);
        }
        if (added.length) return postAddResponse(userId, lang, `✅ Added:\n${added.join('\n')}`);
      }

      if (parsed.intent === INTENT.REMOVE_ITEM) {
        const result = removeItem(userId, parsed.data);
        if (!result.removed) return { replies: ['❌ Invalid item number. Type *cart*.'], notifyOwner };
        return { replies: [`✅ Removed *${result.removed.name}*.`, fmt.cartMessage(result.cart, lang)], notifyOwner };
      }

      if (parsed.intent === INTENT.CHECKOUT) return handleCheckout(userId, lang);

      if (parsed.intent === INTENT.TEXT) {
        const lowered = text.toLowerCase();
        const cat = CATEGORY_MAP[lowered];
        if (cat) {
          if (cat === 'combos') return { replies: [fmt.combosMessage(lang)], notifyOwner };
          const category = categoryByKey(cat);
          if (category) return { replies: [fmt.categoryItemsMessage(category, lang)], notifyOwner };
        }
      }

      return { replies: [fmt.unknownMessage(lang), fmt.mainMenuMessage(lang)], notifyOwner };
    }

    default:
      resetSession(userId);
      updateSessionState(userId, STATE.LANG_SELECT);
      return { replies: [fmt.languageSelectionMessage()], notifyOwner };
  }
}

function handleCheckout(userId, lang) {
  const cart = getCart(userId);
  if (!cart.length) return { replies: [fmt.cartMessage(cart, lang)], notifyOwner: null };
  const total = getTotal(cart);
  if (total < 150) return { replies: [fmt.minOrderMessage(150 - total, lang), fmt.cartMessage(cart, lang)], notifyOwner: null };
  updateSessionState(userId, STATE.CHECKOUT_LOCATION);
  return { replies: [fmt.locationPromptMessage(lang)], notifyOwner: null };
}

function postAddResponse(userId, lang, addedMessage) {
  const total = getTotal(getCart(userId));
  const replies = [addedMessage];
  if (total >= 150) replies.push(fmt.freeDeliveryMessage(lang));
  else replies.push(fmt.freeDeliveryMessage(lang).replace(/UNLOCKED|लाभ|लഭ्य|ان لاک ہوگئی/gi, '') + '\n' + fmt.cartMessage(getCart(userId), lang));
  return { replies, notifyOwner: null };
}

module.exports = { handleMessage, handleCheckout, STATE };
