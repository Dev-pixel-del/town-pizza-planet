// Town Pizza Planet — authoritative menu
// Prices are the final customer-facing prices supplied by the owner.

const EXTRA_CHEESE_PRICE = 30;

const pizzas = [
  { id: 'P1', name: 'Margareta Pizza', price: 129, aliases: ['margareta', 'margherita', 'margarita'] },
  { id: 'P2', name: 'Classic Pizza', price: 139, aliases: ['classic pizza', 'classic'] },
  { id: 'P3', name: 'Mushroom Pizza', price: 199, aliases: ['mushroom', 'mushroom pizza'] },
  { id: 'P4', name: 'Sweet Corn Pizza', price: 229, aliases: ['sweet corn', 'sweet corn pizza', 'corn pizza'] },
  { id: 'P5', name: 'Baby Corn Pizza', price: 229, aliases: ['baby corn', 'baby corn pizza'] },
  { id: 'P6', name: 'Mexican Pizza', price: 179, aliases: ['mexican', 'mexican pizza'] },
  { id: 'P7', name: 'Paneer Pizza', price: 269, aliases: ['paneer pizza'] },
  { id: 'P8', name: 'Peri Peri Chicken Pizza', price: 349, aliases: ['peri peri', 'peri peri chicken', 'peri peri chicken pizza'] },
  { id: 'P9', name: 'Barbeque Chicken Pizza', price: 399, aliases: ['barbeque', 'barbecue', 'bbq', 'bbq chicken', 'barbeque chicken pizza'] },
  { id: 'P10', name: 'Paneer Makhani Pizza', price: 289, aliases: ['paneer makhani pizza'] },
];

const pizzaAddons = [
  { id: 'PA1', name: 'Extra Cheese', price: 30, aliases: ['extra cheese', 'cheese'] },
];

const burgers = [
  { id: 'B1', name: 'Veg Burger', price: 99, aliases: ['veg burger', 'vegetable burger'] },
  { id: 'B2', name: 'Cheez Burger', price: 129, aliases: ['cheez burger', 'cheese burger'] },
  { id: 'B3', name: 'Double Lamb Burger', price: 149, aliases: ['double lamb', 'lamb burger'] },
  { id: 'B4', name: 'Chicken Burger', price: 149, aliases: ['chicken burger'] },
];

const sandwiches = [
  { id: 'S2', name: 'Masala Sandwich', price: 99, aliases: ['masala sandwich'] },
  { id: 'S4', name: 'Paneer Tikka Sandwich', price: 129, aliases: ['paneer tikka sandwich', 'paneer sandwich'] },
  { id: 'S6', name: 'Chicken Sandwich', price: 149, aliases: ['chicken sandwich'] },
  { id: 'S7', name: 'Paneer Makhani', price: 169, aliases: ['paneer makhani'], subcategory: 'sandwiches' },
];

const sides = [
  { id: 'S1', name: 'French Fries (Regular)', price: 80, aliases: ['regular fries', 'fries', 'french fries regular'] },
  { id: 'S3', name: 'French Fries (Large)', price: 149, aliases: ['large fries', 'french fries large'] },
  { id: 'S5', name: 'Garlic Bread', price: 129, aliases: ['garlic bread'] },
];

const milkshakes = [
  { id: 'M1', name: 'Vanilla Shake', price: 139, aliases: ['vanilla shake', 'vanilla'] },
  { id: 'M2', name: 'Strawberry Shake', price: 139, aliases: ['strawberry shake', 'strawberry'] },
  { id: 'M3', name: 'Apple Shake', price: 139, aliases: ['apple shake', 'apple'] },
  { id: 'M4', name: 'Chocolate Shake', price: 139, aliases: ['chocolate shake', 'chocolate'] },
  { id: 'M5', name: 'Pineapple Shake', price: 139, aliases: ['pineapple shake', 'pineapple'] },
  { id: 'M6', name: 'Orange Shake', price: 139, aliases: ['orange shake', 'orange'] },
  { id: 'M7', name: 'Cold Coffee', price: 80, aliases: ['cold coffee', 'coffee'] },
];

const drinks = [
  { id: 'D1', name: 'Sprite', price: 25, aliases: ['sprite', 'स्प्राइट', 'ಸ್ಪ್ರೈಟ್'] },
  { id: 'D2', name: 'Mountain Dew', price: 25, aliases: ['mountain dew', 'mountain', 'dew', 'माउंटेन ड्यू', 'ಮೌಂಟನ್ ಡ್ಯೂ'] },
  { id: 'D3', name: 'Water 500 ml', price: 10, aliases: ['water 500', '500 ml water', '500ml water', 'small water', 'half litre water', 'पानी 500 ml', '500 ml पानी', '500 ಮಿಲಿ ನೀರು'] },
  { id: 'D4', name: 'Water 1 litre', price: 20, aliases: ['water 1 litre', '1 litre water', '1l water', 'one litre water', 'large water', 'पानी 1 लीटर', '1 लीटर पानी', '1 ಲೀಟರ್ ನೀರು'] },
];

const categories = [
  { key: 'pizzas', name: 'Pizza', emoji: '🍕', items: pizzas },
  { key: 'burgers', name: 'Burgers', emoji: '🍔', items: burgers },
  { key: 'sandwiches', name: 'Sandwiches', emoji: '🥪', items: sandwiches },
  { key: 'sides', name: 'Sides', emoji: '🍟', items: sides },
  { key: 'milkshakes', name: 'Shakes', emoji: '🥤', items: milkshakes },
  { key: 'drinks', name: 'Cold Drinks & Water', emoji: '🥤', items: drinks },
];

const allItems = {};
for (const cat of categories) {
  for (const item of cat.items) {
    allItems[item.id] = { ...item, category: cat.key };
  }
}
for (const item of pizzaAddons) {
  allItems[item.id] = { ...item, category: 'pizzaAddons' };
}

function normalize(value) {
  return String(value || '')
    .toLowerCase()
    .normalize('NFKC')
    .replace(/[’']/g, '')
    .replace(/[^\p{L}\p{N}\s]/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function findItemById(id) {
  return allItems[String(id || '').toUpperCase()] || null;
}

function findItemsByText(query) {
  const text = normalize(query);
  if (!text) return [];
  const candidates = Object.values(allItems).filter(item => {
    const names = [item.name, ...(item.aliases || [])].map(normalize);
    return names.some(n => n && (text === n || text.includes(n)));
  });
  // Prefer longer matches to avoid "chicken" matching generic things.
  return candidates.sort((a, b) => b.name.length - a.name.length);
}

function getCategory(key) {
  return categories.find(c => c.key === key) || null;
}

module.exports = {
  EXTRA_CHEESE_PRICE,
  pizzas,
  pizzaAddons,
  burgers,
  sandwiches,
  sides,
  milkshakes,
  drinks,
  categories,
  allItems,
  findItemById,
  findItemsByText,
  getCategory,
};
