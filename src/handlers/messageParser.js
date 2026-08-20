const { findItemById, findItemsByText, categories } = require('../data/menu');
const { findComboById, findComboByName } = require('../data/combos');

const INTENT = {
  GREETING: 'GREETING', MENU: 'MENU', COMBOS: 'COMBOS', CART: 'CART', CHECKOUT: 'CHECKOUT',
  HELP: 'HELP', CANCEL: 'CANCEL', CLEAR: 'CLEAR', RESET: 'RESET', YES: 'YES', NO: 'NO',
  ADD_ITEM: 'ADD_ITEM', ADD_COMBO: 'ADD_COMBO', REMOVE_ITEM: 'REMOVE_ITEM', SELECT_CATEGORY: 'SELECT_CATEGORY',
  EXTRA_CHEESE: 'EXTRA_CHEESE', CHANGE_LANG: 'CHANGE_LANG', TEXT: 'TEXT', LANGUAGE: 'LANGUAGE',
};

const CATEGORY_MAP = {
  '1': 'pizzas', pizza: 'pizzas', pizzas: 'pizzas', 'पिज़्ज़ा': 'pizzas', 'ಪಿಜ್ಜಾ': 'pizzas', 'پیزا': 'pizzas',
  '2': 'burgers', burger: 'burgers', burgers: 'burgers', 'बर्गर': 'burgers', 'ಬರ್ಗರ್': 'burgers', 'برگر': 'burgers',
  '3': 'sandwiches', sandwich: 'sandwiches', sandwiches: 'sandwiches', 'सैंडविच': 'sandwiches', 'ಸ್ಯಾಂಡ್‌ವಿಚ್': 'sandwiches', 'سینڈوچ': 'sandwiches',
  '4': 'sides', side: 'sides', sides: 'sides', fries: 'sides', 'फ्राइज': 'sides', 'ಫ್ರೈಸ್': 'sides', 'فرائز': 'sides',
  '5': 'milkshakes', shake: 'milkshakes', shakes: 'milkshakes', milkshake: 'milkshakes', 'शेक': 'milkshakes', 'ಶೇಕ್': 'milkshakes', 'شیک': 'milkshakes',
  '6': 'drinks', drink: 'drinks', drinks: 'drinks', water: 'drinks', 'पानी': 'drinks', 'ನೀರು': 'drinks', 'پانی': 'drinks',
  '7': 'combos', combo: 'combos', combos: 'combos', offers: 'combos', deals: 'combos', 'कॉम्बो': 'combos', 'ಕಾಂಬೊ': 'combos', 'کومبو': 'combos',
};

const GREETINGS = ['hi', 'hello', 'hey', 'start', 'begin', 'namaste', 'ನಮಸ್ಕಾರ', 'ನಮಸ್ತೆ', 'ಹಾಯ್', 'नमस्ते', 'हाय', 'سلام', 'ہیلو'];
const LANG_WORDS = { english: 'en', en: 'en', kannada: 'kn', ಕನ್ನಡ: 'kn', hindi: 'hi', हिंदी: 'hi', urdu: 'ur', اردو: 'ur' };

function normalize(text) {
  return String(text || '').toLowerCase().normalize('NFKC').replace(/[’']/g, '').replace(/\s+/g, ' ').trim();
}

function detectQuantity(text, phrase) {
  const lower = normalize(text);
  const before = lower.split(phrase.toLowerCase())[0].trim();
  const match = before.match(/(?:^|\s)(\d+)\s*$/);
  if (match) return Math.max(1, Number(match[1]));
  const wordMap = [
    [/\bone\b|\bek\b|\bएक\b|\bಒಂದು\b|\bایک\b/, 1],
    [/\btwo\b|\bdo\b|\bदो\b|\bಎರಡು\b|\bدو\b/, 2],
    [/\bthree\b|\bteen\b|\bतीन\b|\bಮೂರು\b|\bتین\b/, 3],
  ];
  for (const [re, n] of wordMap) if (re.test(before)) return n;
  return 1;
}

function extractItems(raw) {
  const text = normalize(raw);
  if (!text) return [];
  const candidates = findItemsByText(text).filter(item => item.category !== 'pizzaAddons');
  const dedup = [];
  const seen = new Set();
  for (const item of candidates) {
    if (seen.has(item.id)) continue;
    seen.add(item.id);
    const names = [item.name, ...(item.aliases || [])].sort((a, b) => b.length - a.length);
    const phrase = names.find(n => text.includes(normalize(n)));
    if (!phrase) continue;
    dedup.push({ item, qty: detectQuantity(text, normalize(phrase)) });
  }
  return dedup.slice(0, 8);
}

function parseMessage(raw) {
  const text = normalize(raw);
  if (!text) return { intent: INTENT.TEXT, data: '' };
  if (GREETINGS.includes(text)) return { intent: INTENT.GREETING, data: null };
  if (text === 'menu' || text === 'browse' || text === 'show menu' || text === 'main menu' || text === 'home') return { intent: INTENT.MENU, data: null };
  if (text === 'cart' || text === 'my cart' || text === 'show cart' || text === 'view cart') return { intent: INTENT.CART, data: null };
  if (text === 'checkout' || text === 'check out' || text === 'place order' || text === 'done') return { intent: INTENT.CHECKOUT, data: null };
  if (text === 'help' || text === '?' || text === 'commands') return { intent: INTENT.HELP, data: null };
  if (['cancel', 'go back', 'back', 'no', 'नहीं', 'ನೋ', 'نہیں'].includes(text)) return { intent: INTENT.CANCEL, data: null };
  if (['clear', 'clear cart', 'empty cart'].includes(text)) return { intent: INTENT.CLEAR, data: null };
  if (['reset', 'restart', 'start over'].includes(text)) return { intent: INTENT.RESET, data: null };
  if (['lang', 'language', 'change language', 'bhasha', 'भाषा', 'ಭಾಷೆ', 'زبان'].includes(text)) return { intent: INTENT.CHANGE_LANG, data: null };
  if (['yes', 'y', 'confirm', 'ok', 'okay', 'sure', 'haan', 'हां', 'ಹೌದು', 'ہاں'].includes(text)) return { intent: INTENT.YES, data: null };
  if (['no', 'n', 'nope', 'nah', 'nahi', 'नहीं', 'ಇಲ್ಲ', 'نہیں'].includes(text)) return { intent: INTENT.NO, data: null };

  const lang = LANG_WORDS[text];
  if (lang) return { intent: INTENT.LANGUAGE, data: lang };

  const removeMatch = text.match(/^(?:remove|delete|del|rem|हटाओ|ತೆಗೆದುಹಾಕು|ہٹائیں)\s+(\d+)$/);
  if (removeMatch) return { intent: INTENT.REMOVE_ITEM, data: Number(removeMatch[1]) };

  if (text === 'cheese' || text === 'extra cheese' || text === 'add cheese') return { intent: INTENT.EXTRA_CHEESE, data: null };

  if (/^([a-z]+\d{1,2})$/i.test(text)) {
    const item = findItemById(text);
    if (item) return { intent: INTENT.ADD_ITEM, data: { item, qty: 1 } };
    const combo = findComboById(text);
    if (combo) return { intent: INTENT.ADD_COMBO, data: combo };
  }

  if (CATEGORY_MAP[text]) return { intent: INTENT.SELECT_CATEGORY, data: CATEGORY_MAP[text] };

  const categoryNumber = CATEGORY_MAP[text];
  if (categoryNumber) return { intent: INTENT.SELECT_CATEGORY, data: categoryNumber };

  if (text === 'combos' || text === 'combo deals') return { intent: INTENT.COMBOS, data: null };

  const combo = findComboByName(text);
  if (combo) return { intent: INTENT.ADD_COMBO, data: combo };

  const items = extractItems(raw);
  if (items.length > 0) return { intent: INTENT.ADD_ITEM, data: items };

  return { intent: INTENT.TEXT, data: raw.trim() };
}

module.exports = { parseMessage, INTENT, CATEGORY_MAP };
