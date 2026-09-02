// Town Pizza Planet — final button/catalogue menu data.
// Customer-facing image files live in:
//   public/product-images/P1.jpg ... P10.jpg
// Pizza pricing rule: show ONE final price = highest legacy price.

const EXTRA_CHEESE_PRICE = 30;

const pizzas = [
  { id: 'P1', name: 'Margherita Pizza', prices: { regular: 99, large: 129 }, image: 'P1.jpg' },
  { id: 'P2', name: 'Classic Pizza', prices: { regular: 139 }, image: 'P2.jpg' },
  { id: 'P3', name: 'Mushroom Pizza', prices: { regular: 169, large: 199 }, image: 'P3.jpg' },
  { id: 'P4', name: 'Sweet Corn Pizza', prices: { regular: 179, large: 229 }, image: 'P4.jpg' },
  { id: 'P5', name: 'Baby Corn Pizza', prices: { regular: 179, large: 229 }, image: 'P5.jpg' },
  { id: 'P6', name: 'Mexican Pizza', prices: { regular: 149, large: 179 }, image: 'P6.jpg' },
  { id: 'P7', name: 'Paneer Pizza', prices: { regular: 229, large: 269 }, image: 'P7.jpg' },
  { id: 'P8', name: 'Peri Peri Chicken Pizza', prices: { regular: 299, large: 349 }, image: 'P8.jpg' },
  { id: 'P9', name: 'Barbeque Chicken Pizza', prices: { regular: 349, large: 399 }, image: 'P9.jpg' },
  { id: 'P10', name: 'Paneer Makhani Pizza', prices: { regular: 249, large: 289 }, image: 'P10.jpg' },
];

const burgers = [
  { id: 'B1', name: 'Veg Burger', price: 99, image: 'B1.jpg' },
  { id: 'B2', name: 'Cheez Burger', price: 129, image: 'B2.jpg' },
  { id: 'B3', name: 'Double Lamb Burger', price: 149, image: 'B3.jpg' },
  { id: 'B4', name: 'Chicken Burger', price: 149, image: 'B4.jpg' },
];

const sandwichesAndSides = [
  { id: 'S1', name: 'French Fries (Regular)', price: 80, image: 'S1.jpg' },
  { id: 'S2', name: 'Masala Sandwich', price: 99, image: 'S2.jpg' },
  { id: 'S3', name: 'French Fries (Large)', price: 149, image: 'S3.jpg' },
  { id: 'S4', name: 'Paneer Tikka Sandwich', price: 129, image: 'S4.jpg' },
  { id: 'S5', name: 'Garlic Bread', price: 129, image: 'S5.jpg' },
  { id: 'S6', name: 'Chicken Sandwich', price: 149, image: 'S6.jpg' },
  { id: 'S7', name: 'Paneer Makhani', price: 169, image: 'S7.jpg' },
  { id: 'S8', name: 'Regular Cheese Loaded Fries', price: 119, image: 'S8.jpg' },
  { id: 'S9', name: 'Large Cheese Loaded Fries', price: 189, image: 'S9.jpg' },
];

const milkshakes = [
  { id: 'M1', name: 'Vanilla Shake', price: 139, image: 'M1.jpg' },
  { id: 'M2', name: 'Strawberry Shake', price: 139, image: 'M2.jpg' },
  { id: 'M3', name: 'Apple Shake', price: 139, image: 'M3.jpg' },
  { id: 'M4', name: 'Chocolate Shake', price: 139, image: 'M4.jpg' },
  { id: 'M5', name: 'Pineapple Shake', price: 139, image: 'M5.jpg' },
  { id: 'M6', name: 'Orange Shake', price: 139, image: 'M6.jpg' },
  { id: 'M7', name: 'Cold Coffee', price: 80, image: 'M7.jpg' },
  { id: 'M8', name: 'Oreo Shake', price: 150, image: 'M8.jpg' },
];

const categories = [
  { key: 'pizzas', name: 'Pizza', emoji: '🍕', items: pizzas },
  { key: 'burgers', name: 'Burgers', emoji: '🍔', items: burgers },
  { key: 'sandwichesAndSides', name: 'Sandwiches & Sides', emoji: '🥪', items: sandwichesAndSides },
  { key: 'milkshakes', name: 'Shakes', emoji: '🥤', items: milkshakes },
];

// Exact bestsellers requested by the restaurant.
const bestsellers = ['P4', 'P5', 'P7', 'B2'];

const allItems = {};
for (const category of categories) {
  for (const item of category.items) allItems[item.id] = { ...item, category: category.key };
}

function findItemById(id) {
  const key = String(id || '').trim().toUpperCase();
  return allItems[key] || null;
}

function hasSizeVariants(item) {
  return Boolean(item && item.prices && typeof item.prices === 'object');
}

function getFinalPrice(item) {
  if (!item) return NaN;
  if (hasSizeVariants(item)) {
    const values = Object.values(item.prices).map(Number).filter(Number.isFinite);
    return values.length ? Math.max(...values) : NaN;
  }
  return Number(item.price);
}

// Kept for compatibility with existing project code.
function getItemPrice(item, size = null) {
  if (!item) return NaN;
  if (hasSizeVariants(item)) {
    if (size && Number.isFinite(Number(item.prices[size]))) return Number(item.prices[size]);
    return getFinalPrice(item);
  }
  return Number(item.price);
}

module.exports = {
  pizzas,
  burgers,
  sandwichesAndSides,
  milkshakes,
  categories,
  allItems,
  bestsellers,
  findItemById,
  hasSizeVariants,
  getItemPrice,
  getFinalPrice,
  EXTRA_CHEESE_PRICE,
};
