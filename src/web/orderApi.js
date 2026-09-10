const express = require('express');
const path = require('path');
const { getCatalog, getCatalogLookup, calculateDelivery } = require('./orderData');
const { createOrder, getOrderById, getOrdersByPhone } = require('../db/database');
const { EXTRA_CHEESE_PRICE } = require('../data/menu');
const { isBlocked, updateState, getState, getOrderMeta, appendAudit, applyRawMaterialsForOrder } = require('../admin/adminStore');

function createOrderRouter(getWhatsAppClient = () => null) {
  const router = express.Router();

  function currentComboOfDay() {
    const s=getState();
    const weekday=new Intl.DateTimeFormat('en-US',{timeZone:'Asia/Kolkata',weekday:'short'}).format(new Date());
    const wd={Sun:0,Mon:1,Tue:2,Wed:3,Thu:4,Fri:5,Sat:6}[weekday] ?? new Date().getDay();
    return s.settings?.comboOfDay?.[String(wd)] || null;
  }
  async function ensureAutoDriver(order) {
    const meta=getOrderMeta(order.order_id)||{};
    if(meta.driver || order.status==='cancelled') return meta;
    const age=Date.now()-new Date(order.created_at||Date.now()).getTime();
    if(age<5*60*1000)return meta;
    const first=(getState().drivers||[]).find(d=>d.active!==false);
    if(!first)return meta;
    await updateState(s=>{const cur=s.orderMeta[order.order_id]||{};if(cur.driver)return s;s.orderMeta[order.order_id]={...cur,driver:first.name||'',driverPhone:first.phone||'',driverAssignedAt:new Date().toISOString(),driverAutoAssigned:true};return s;});
    await appendAudit('order.driver_auto_assigned',{orderId:order.order_id,driver:first.name,driverPhone:first.phone});
    return getOrderMeta(order.order_id)||{};
  }

  router.get('/catalog', (req, res) => { res.setHeader('Cache-Control', 'no-store'); res.json({ success: true, catalog: getCatalog() }); });
  router.get('/history', (req, res) => {
    try { const phone = String(req.query.phone || '').replace(/\D/g, ''); if (!phone) return res.json({ success: true, orders: [] }); return res.json({ success: true, orders: getOrdersByPhone(phone, 10) }); }
    catch (err) { console.error('❌ Order history failed:', err); return res.status(500).json({ success: false, error: 'Could not load order history.' }); }
  });
  router.get('/status/:orderId', async (req, res) => {
    try {
      const orderId = String(req.params.orderId || '').trim(); const phone = String(req.query.phone || '').replace(/\D/g, '');
      if (!orderId || !phone) return res.status(400).json({ success: false, error: 'Order ID and phone number are required.' });
      const order = getOrderById(orderId); if (!order) return res.status(404).json({ success: false, error: 'Order not found.' });
      const storedPhone = String(order.user_id || '').replace(/\D/g, ''); if (!storedPhone || !storedPhone.includes(phone)) return res.status(403).json({ success: false, error: 'Order access denied.' });
      const meta=await ensureAutoDriver(order);
      const enriched={...order,admin:{driver:meta.driver||'',driverPhone:meta.driverPhone||'',driverAssignedAt:meta.driverAssignedAt||null,driverAutoAssigned:Boolean(meta.driverAutoAssigned),feedback:meta.feedback||null,restaurantNote:meta.customerNote||meta.restaurantNote||order.restaurant_note||''}};
      return res.json({ success: true, order: enriched });
    } catch (err) { console.error('❌ Order status failed:', err); return res.status(500).json({ success:false, error:'Could not load order status.' }); }
  });
  router.post('/place', async (req, res) => {
    try {
      const body = req.body || {};
      const name = String(body.name || '').trim(); const address = String(body.address || '').trim(); const phone = String(body.phone || '').replace(/\D/g, '');
      const language = String(body.language || 'en').trim(); const landmark = String(body.landmark || '').trim(); const restaurantNote = String(body.restaurantNote || '').trim().slice(0,300); const zoneId = String(body.deliveryZone || '').trim();
      const paymentMethod = String(body.paymentMethod || 'COD').trim().toUpperCase();
      const location = body.location && typeof body.location === 'object' ? { latitude:Number(body.location.latitude), longitude:Number(body.location.longitude), accuracy:Number(body.location.accuracy) } : null;
      const rawItems = Array.isArray(body.items) ? body.items : [];
      if (name.length < 2) return res.status(400).json({ success:false, error:'Please enter your name.' });
      if (phone.length < 10) return res.status(400).json({ success:false, error:'Please enter a valid mobile number.' });
      if (address.length < 5) return res.status(400).json({ success:false, error:'Please enter your complete delivery address.' });
      if (!zoneId) return res.status(400).json({ success:false, error:'Please choose your delivery area.' });
      if (!rawItems.length) return res.status(400).json({ success:false, error:'Your cart is empty.' });
      if (paymentMethod !== 'COD') return res.status(400).json({ success:false, error:'Only Cash on Delivery is available.' });
      if (isBlocked(phone)) return res.status(403).json({ success:false, error:'This phone number is currently unable to place orders.' });

      const ordering = getCatalog().ordering;
      if (!ordering.open) return res.status(423).json({ success:false, code:'ORDERING_UNAVAILABLE', error:ordering.reason || 'Ordering is currently unavailable.' });
      const lookup = getCatalogLookup(); const normalized = [];
      for (const raw of rawItems) {
        const id = String(raw.id || '').trim().toUpperCase(); const item = lookup.get(id); const qty = Number(raw.qty);
        if (!item || !Number.isInteger(qty) || qty < 1 || qty > 50) continue;
        if (item.available === false) continue;
        const extraCheese = !item.isCombo && id.startsWith('P') && Boolean(raw.extraCheese);
        const variantKey = String(raw.variantKey || '').trim(); const variant = !item.isCombo && Array.isArray(item.variants) ? item.variants.find(v => String(v.key) === variantKey) : null;
        if (Array.isArray(item.variants) && item.variants.length && id === 'D1' && !variant) continue;
        const basePrice = item.isCombo ? Number(item.price) : (variant ? Number(variant.price) : Number(item.price));
        const unitPrice = basePrice + (extraCheese ? EXTRA_CHEESE_PRICE : 0); if (!Number.isFinite(unitPrice)) continue;
        const displayName = variant ? `${item.name} - ${variant.label}` : item.name;
        normalized.push({ id, name:`${displayName}${extraCheese ? ' + Extra Cheese':''}`, price:unitPrice, originalPrice:unitPrice, discount:0, qty, extraCheese, variantKey:variant ? variant.key : null, variantLabel:variant ? variant.label : null, isCombo:Boolean(item.isCombo), packType:item.packType || null, category:item.category || null, comboOfDay:false });
      }
      if (!normalized.length) return res.status(400).json({ success:false, error:'No valid items were found in your cart.' });
      // Securely apply the current Combo of the Day discount only when the cart item
      // explicitly requests it and its pack matches today's configured offer.
      const cod=currentComboOfDay();
      for(const raw of rawItems){
        if(!raw.comboOfDay || !cod) continue;
        const id=String(raw.id||'').toUpperCase();
        if(id!==String(cod.packId||'').toUpperCase()) continue;
        const found=normalized.find(x=>x.id===id && x.isCombo);
        if(!found) continue;
        const base=Number(found.price); const discount=Math.min(40,Math.round(base*0.10));
        found.originalPrice=base; found.discount=discount; found.price=Math.max(0,base-discount); found.comboOfDay=true; found.name=`${found.name} — Combo of the Day`;
      }
      const subtotal = normalized.reduce((sum,item)=>sum + item.price * item.qty,0); const delivery = calculateDelivery(zoneId, subtotal);
      if (!delivery.valid) return res.status(400).json({ success:false,error:delivery.error,code:'MINIMUM_ORDER',minimumOrder:delivery.minimumOrder,amountNeeded:delivery.amountNeeded||0 });
      const total = subtotal + delivery.charge; const userId = `${phone}@web`;
      const orderId = await createOrder(userId,name,normalized,subtotal,total,{ address, landmark, language, payment_method:'COD', location, delivery_zone:delivery.zone.name, delivery_zone_id:delivery.zone.id, delivery_charge:delivery.charge, free_delivery:delivery.charge===0, estimated_minutes:delivery.estimatedMinutes||30, restaurant_note:restaurantNote, source:'web' });
      const order = getOrderById(orderId);
      // Deduct raw materials only after the order exists. Never fail an otherwise
      // successful customer order because inventory bookkeeping has an error.
      try { await applyRawMaterialsForOrder(order, normalized); }
      catch (inventoryError) { console.error('⚠️ Raw-material deduction failed:', inventoryError); }

      const orderMessage = ['🔔 *NEW WEB ORDER — TOWN PIZZA PLANET*',`🆔 Order ID: ${orderId}`,`👤 Customer: ${name}`,`📱 Phone: ${phone}`,'',...normalized.map((item,i)=>`${i+1}. ${item.name} × ${item.qty} — ₹${item.price*item.qty}`),'',`🧾 *Subtotal: ₹${subtotal}*`,`🚚 Delivery: ${delivery.charge===0?'FREE':`₹${delivery.charge}`}`,`💰 *TOTAL: ₹${total}*`,'💵 Payment: Cash on Delivery',`📍 Area: ${delivery.zone.name}`,`🏠 Address: ${address}`,landmark?`📌 Landmark: ${landmark}`:null,restaurantNote?`📝 Restaurant note: ${restaurantNote}`:null,location&&Number.isFinite(location.latitude)&&Number.isFinite(location.longitude)?`🛰️ GPS: ${location.latitude}, ${location.longitude} (±${Number.isFinite(location.accuracy)?Math.round(location.accuracy):'?'}m)\n🗺️ https://maps.google.com/?q=${location.latitude},${location.longitude}`:'🛰️ GPS: Not provided',`⏱️ Estimated delivery: about ${delivery.estimatedMinutes||30} minutes`,'','📞 9448769098 / 6362648283'].filter(Boolean).join('\n');
      const client = getWhatsAppClient(); const ownerPhone = String(process.env.OWNER_PHONE || '').replace(/\D/g,'');
      if (client && ownerPhone && global.__TPP_WHATSAPP_READY === true) {
        for (let attempt = 1; attempt <= 3; attempt += 1) {
          try { await client.sendMessage(`${ownerPhone}@c.us`, orderMessage); break; }
          catch(err) {
            if (attempt === 3) console.error('⚠️ Web order owner notification failed:', err.message);
            else await new Promise(r=>setTimeout(r, 1200 * attempt));
          }
        }
      } else if (ownerPhone) {
        console.warn('⚠️ Order saved but WhatsApp owner notification is not ready yet.');
      }
      return res.json({ success:true,orderId,total,subtotal,deliveryCharge:delivery.charge,deliveryZone:delivery.zone.name,estimatedMinutes:delivery.estimatedMinutes||30,order });
    } catch (err) { console.error('❌ Web order failed:',err); return res.status(500).json({ success:false,error:'Could not place the order. Please try again.' }); }
  });

  router.post('/feedback/:orderId', async (req, res) => {
    try {
      const orderId = String(req.params.orderId || '').trim();
      const phone = String(req.body?.phone || '').replace(/\D/g,'');
      const rating = Number(req.body?.rating);
      const feedback = String(req.body?.feedback || '').trim().slice(0,500);
      if (!orderId || phone.length < 10) return res.status(400).json({success:false,error:'Order ID and phone number are required.'});
      if (!Number.isInteger(rating) || rating < 1 || rating > 5) return res.status(400).json({success:false,error:'Please choose a rating from 1 to 5.'});
      const order = getOrderById(orderId);
      if (!order) return res.status(404).json({success:false,error:'Order not found.'});
      const storedPhone = String(order.user_id || '').replace(/\D/g,'');
      if (!storedPhone || !storedPhone.includes(phone)) return res.status(403).json({success:false,error:'Feedback access denied.'});
      await updateState(s => {
        const current = s.orderMeta[orderId] || {};
        s.orderMeta[orderId] = {
          ...current,
          feedback: { rating, feedback, submittedAt: new Date().toISOString() },
          updatedAt: new Date().toISOString()
        };
        return s;
      });
      return res.json({success:true, feedback:{rating,feedback}});
    } catch (err) {
      console.error('❌ Feedback failed:', err);
      return res.status(500).json({success:false,error:'Could not submit feedback.'});
    }
  });

  router.get('/', (req,res)=>res.sendFile(path.join(process.cwd(),'public','order','index.html')));
  return router;
}
module.exports = { createOrderRouter };
