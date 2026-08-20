process.env.STORE_NAME = 'Town Pizza Planet';
process.env.REQUIRE_MONGODB = 'false';

const assert = require('assert');
const { categories, pizzas, burgers, sandwiches, sides, milkshakes, drinks } = require('../src/data/menu');
const { combos } = require('../src/data/combos');
const { getSession, initDatabase, resetSession } = require('../src/db/database');
const { handleMessage, STATE } = require('../src/handlers/conversationHandler');

(async () => {
  await initDatabase();
  assert.equal(categories.length, 6);
  assert.equal(pizzas.length, 10);
  assert.equal(burgers.length, 4);
  assert.equal(sandwiches.length, 4);
  assert.equal(sides.length, 3);
  assert.equal(milkshakes.length, 7);
  assert.equal(drinks.length, 4);
  assert.equal(combos.length, 9);
  assert.equal(pizzas.find(p => p.name === 'Margareta Pizza').price, 129);
  assert.equal(pizzas.find(p => p.name === 'Barbeque Chicken Pizza').price, 399);
  assert.equal(drinks.find(d => d.name === 'Sprite').price, 25);
  assert.equal(drinks.find(d => d.name === 'Water 500 ml').price, 10);

  const user = `smoke-test-${Date.now()}@c.us`;
  resetSession(user);
  let r = await handleMessage(user, 'hi', 'Smoke Test');
  assert.ok(r.replies.join('\n').includes('Choose your language'));
  r = await handleMessage(user, '2', 'Smoke Test');
  assert.equal(getSession(user).lang, 'en');
  assert.equal(getSession(user).state, STATE.MAIN_MENU);
  r = await handleMessage(user, 'pizza', 'Smoke Test');
  assert.ok(r.replies.join('\n').includes('Margareta Pizza'));
  r = await handleMessage(user, 'P1', 'Smoke Test');
  assert.ok(getSession(user).cart.length === 1);
  assert.equal(getSession(user).cart[0].price, 129);
  r = await handleMessage(user, 'sprite', 'Smoke Test');
  assert.equal(getSession(user).cart.reduce((s, i) => s + i.price * i.qty, 0), 154);
  r = await handleMessage(user, 'checkout', 'Smoke Test');
  assert.equal(getSession(user).state, STATE.CHECKOUT_LOCATION);
  r = await handleMessage(user, '', 'Smoke Test', { latitude: 16.85, longitude: 75.72 });
  assert.equal(getSession(user).state, STATE.CHECKOUT_LANDMARK);
  r = await handleMessage(user, 'Near Bus Stand', 'Smoke Test');
  assert.equal(getSession(user).state, STATE.CHECKOUT_CONFIRM);
  console.log('✅ Smoke tests passed');
  process.exit(0);
})().catch(err => { console.error('❌ Smoke test failed:', err); process.exit(1); });
