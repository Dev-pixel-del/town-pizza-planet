const express = require('express');
const path = require('path');
const { getCatalog } = require('./orderData');
const { createOrder } = require('../db/database');

function createOrderRouter(getWhatsAppClient = () => null) {
  const router = express.Router();

  router.get('/catalog', (req, res) => {
    res.setHeader('Cache-Control', 'no-store');
    res.json({ success: true, catalog: getCatalog() });
  });

  router.post('/place', async (req, res) => {
    try {
      const body = req.body || {};
      const name = String(body.name || '').trim();
      const address = String(body.address || '').trim();
      const phone = String(body.phone || '').trim();
      const language = String(body.language || 'en').trim();
      const paymentMethod = String(body.paymentMethod || 'COD').trim().toUpperCase();
      const rawItems = Array.isArray(body.items) ? body.items : [];

      if (name.length < 2) return res.status(400).json({ success: false, error: 'Please enter your name.' });
      if (address.length < 5) return res.status(400).json({ success: false, error: 'Please enter your complete delivery address.' });
      if (!rawItems.length) return res.status(400).json({ success: false, error: 'Your cart is empty.' });
      if (paymentMethod !== 'COD') return res.status(400).json({ success: false, error: 'Only Cash on Delivery is available.' });

      const catalog = getCatalog();
      const lookup = new Map();
      for (const item of catalog.bestsellers) lookup.set(item.id, item);
      for (const category of catalog.categories) for (const item of category.items) lookup.set(item.id, item);
      for (const combo of catalog.combos) lookup.set(combo.id, { ...combo, isCombo: true });
      for (const pack of catalog.familyPacks) lookup.set(pack.id, { ...pack, isCombo: true });

      const normalized = [];
      for (const raw of rawItems) {
        const id = String(raw.id || '').trim().toUpperCase();
        const item = lookup.get(id);
        const qty = Number(raw.qty);
        if (!item || !Number.isInteger(qty) || qty < 1 || qty > 50) continue;

        const extraCheese = id.startsWith('P') && Boolean(raw.extraCheese);
        const unitPrice = Number(item.price) + (extraCheese ? catalog.extraCheesePrice : 0);
        normalized.push({
          id,
          name: `${item.name}${extraCheese ? ' + Extra Cheese' : ''}`,
          price: unitPrice,
          qty,
          extraCheese,
          isCombo: Boolean(item.isCombo),
        });
      }

      if (!normalized.length) return res.status(400).json({ success: false, error: 'No valid items were found in your cart.' });

      const total = normalized.reduce((sum, item) => sum + (item.price * item.qty), 0);
      const userId = phone ? `${phone.replace(/\D/g, '') || 'web'}@web` : `web-${Date.now()}`;
      const orderId = await createOrder(userId, name, normalized, total, total, {
        address,
        language,
        payment_method: 'COD',
      });

      const orderMessage = [
        '🔔 *NEW WEB ORDER — TOWN PIZZA PLANET*',
        `🆔 Order ID: ${orderId}`,
        `👤 Customer: ${name}`,
        phone ? `📱 Phone: ${phone}` : '📱 Phone: Not provided',
        '',
        ...normalized.map((item, i) => `${i + 1}. ${item.name} × ${item.qty} — ₹${item.price * item.qty}`),
        '',
        `💰 *TOTAL: ₹${total}*`,
        '💵 Payment: Cash on Delivery',
        `📍 Address: ${address}`,
        '',
        '📞 Call for more details: 9448769098 / 6362648283',
      ].join('\n');

      const client = getWhatsAppClient();
      const ownerPhone = String(process.env.OWNER_PHONE || '').replace(/\D/g, '');
      if (client && ownerPhone) {
        try {
          await client.sendMessage(`${ownerPhone}@c.us`, orderMessage);
        } catch (err) {
          console.error('⚠️ Web order owner notification failed:', err.message);
        }
      }

      if (client && phone) {
        try {
          await client.sendMessage(`${phone.replace(/\D/g, '')}@c.us`, `✅ *Order Confirmed!*\n\nOrder ID: *${orderId}*\nTotal: *₹${total}*\n💵 Cash on Delivery\n\nThank you for ordering from *Town Pizza Planet*! ❤️`);
        } catch (err) {
          console.error('⚠️ Web order customer WhatsApp confirmation failed:', err.message);
        }
      }

      res.json({ success: true, orderId, total });
    } catch (err) {
      console.error('❌ Web order failed:', err);
      res.status(500).json({ success: false, error: 'Could not place the order. Please try again.' });
    }
  });

  router.get('/', (req, res) => {
    res.sendFile(path.join(process.cwd(), 'public', 'order', 'index.html'));
  });

  return router;
}

module.exports = { createOrderRouter };
