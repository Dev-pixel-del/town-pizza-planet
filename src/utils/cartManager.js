// Town Pizza Planet — final session cart manager.
// Cart entries are plain objects stored in the existing database session.

const { getSession, updateSessionCart } = require('../db/database');
const { findItemById, getFinalPrice, EXTRA_CHEESE_PRICE } = require('../data/menu');

function normalizeMenuItem(item) {
  const id = String(item?.id || '').trim().toUpperCase();
  const source = findItemById(id);
  if (!source) throw new Error(`Invalid menu item: ${id || 'missing id'}`);

  const name = String(source.name || '').trim();
  const price = Number(getFinalPrice(source));
  if (!name) throw new Error(`Menu item ${id} has no name`);
  if (!Number.isFinite(price) || price < 0) throw new Error(`Invalid price for ${id}`);

  return { id, name, price };
}

function getUserCart(userId) {
  const session = getSession(userId);
  return Array.isArray(session.cart) ? session.cart : [];
}

function addItem(userId, item, qty = 1, size = null, extraCheese = false) {
  const quantity = Number(qty);
  if (!Number.isInteger(quantity) || quantity <= 0) {
    throw new Error(`Invalid quantity: ${qty}`);
  }

  const normalized = normalizeMenuItem(item);
  const cheese = Boolean(extraCheese);
  const finalPrice = normalized.price + (cheese ? EXTRA_CHEESE_PRICE : 0);

  // Pizza has one final customer-facing price, so do not store a size variant.
  const storedSize = normalized.id.startsWith('P') ? null : (size || null);
  const cart = getUserCart(userId);
  const index = cart.findIndex(c =>
    c && c.id === normalized.id &&
    (c.size || null) === storedSize &&
    Boolean(c.extraCheese) === cheese &&
    !c.isCombo
  );

  if (index >= 0) {
    cart[index].qty = Number(cart[index].qty || 0) + quantity;
    cart[index].price = finalPrice;
    cart[index].name = normalized.name;
  } else {
    cart.push({
      id: normalized.id,
      name: normalized.name,
      price: finalPrice,
      qty: quantity,
      size: storedSize,
      extraCheese: cheese,
      isCombo: false,
    });
  }

  updateSessionCart(userId, cart);
  return cart;
}

function addCombo(userId, combo, qty = 1) {
  if (!combo?.id || !combo?.name) throw new Error('Invalid combo/family pack');

  const quantity = Number(qty);
  const price = Number(combo.price);
  if (!Number.isInteger(quantity) || quantity <= 0 || !Number.isFinite(price) || price < 0) {
    throw new Error('Invalid combo quantity/price');
  }

  const cart = getUserCart(userId);
  const id = String(combo.id).trim().toUpperCase();
  const index = cart.findIndex(c => c && c.id === id && c.isCombo);

  if (index >= 0) {
    cart[index].qty = Number(cart[index].qty || 0) + quantity;
  } else {
    cart.push({
      id,
      name: `🎁 ${String(combo.name).trim()}`,
      price,
      qty: quantity,
      size: null,
      extraCheese: false,
      isCombo: true,
      description: String(combo.description || ''),
    });
  }

  updateSessionCart(userId, cart);
  return cart;
}

function removeItem(userId, index) {
  const cart = getUserCart(userId);
  const i = Number(index);
  if (!Number.isInteger(i) || i < 1 || i > cart.length) {
    return { cart, removed: null };
  }

  const removed = cart.splice(i - 1, 1)[0];
  updateSessionCart(userId, cart);
  return { cart, removed };
}

function clearCart(userId) {
  updateSessionCart(userId, []);
}

function getCart(userId) {
  return getUserCart(userId);
}

function getTotal(cart) {
  return (Array.isArray(cart) ? cart : []).reduce((sum, item) => {
    const price = Number(item?.price);
    const qty = Number(item?.qty);
    if (!Number.isFinite(price) || !Number.isFinite(qty)) return sum;
    return sum + price * qty;
  }, 0);
}

module.exports = { addItem, addCombo, removeItem, clearCart, getCart, getTotal };
