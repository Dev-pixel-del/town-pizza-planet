const { getSession, updateSessionCart } = require('../db/database');
const { EXTRA_CHEESE_PRICE } = require('../data/menu');

function addItem(userId, item, qty = 1, extraCheese = false) {
  const session = getSession(userId);
  const cart = session.cart;
  const price = Number(item.price) + (extraCheese ? EXTRA_CHEESE_PRICE : 0);
  const existingIndex = cart.findIndex(c => c.id === item.id && Boolean(c.extraCheese) === Boolean(extraCheese) && !c.isCombo);

  if (existingIndex >= 0) cart[existingIndex].qty += qty;
  else cart.push({
    id: item.id,
    name: item.name,
    price,
    qty,
    extraCheese: Boolean(extraCheese),
    isCombo: false,
  });

  updateSessionCart(userId, cart);
  return cart;
}

function addCombo(userId, combo) {
  const session = getSession(userId);
  session.cart.push({
    id: combo.id,
    name: `🎁 ${combo.name}`,
    price: combo.price,
    qty: 1,
    isCombo: true,
    extraCheese: false,
    description: combo.description,
    notes: combo.notes,
  });
  updateSessionCart(userId, session.cart);
  return session.cart;
}

function removeItem(userId, index) {
  const cart = getSession(userId).cart;
  if (index < 1 || index > cart.length) return { cart, removed: null };
  const removed = cart.splice(index - 1, 1)[0];
  updateSessionCart(userId, cart);
  return { cart, removed };
}

function clearCart(userId) { updateSessionCart(userId, []); }
function getCart(userId) { return getSession(userId).cart; }
function getTotal(cart) { return cart.reduce((sum, item) => sum + Number(item.price || 0) * Number(item.qty || 0), 0); }

module.exports = { addItem, addCombo, removeItem, clearCart, getCart, getTotal };
