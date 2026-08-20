# Town Pizza Planet — WhatsApp Ordering Bot

A multilingual WhatsApp ordering system for Town Pizza Planet using `whatsapp-web.js`, MongoDB persistence, a simple restaurant dashboard, Cash on Delivery, ₹150+ free delivery, and WhatsApp current-location capture.

## Customer experience

1. Customer messages the restaurant on WhatsApp.
2. Bot asks the customer to choose one of four languages: Kannada, English, Hindi or Urdu.
3. Customer sees categories: Pizza, Burgers, Sandwiches, Sides, Shakes, Cold Drinks & Water, Combos.
4. Customer can browse or type product names naturally.
5. Cart is calculated deterministically from the menu data.
6. Orders of ₹150 or more get FREE DELIVERY.
7. Orders below ₹150 are asked to add items until they reach ₹150.
8. Bot asks the customer to share their current WhatsApp location.
9. Bot asks for a nearby landmark.
10. Customer confirms Cash on Delivery.
11. Restaurant receives a structured order notification.
12. Staff move the order through preparation and delivery statuses.

## Final menu prices

### Pizza
- Margareta Pizza — ₹129
- Classic Pizza — ₹139
- Mushroom Pizza — ₹199
- Sweet Corn Pizza — ₹229
- Baby Corn Pizza — ₹229
- Mexican Pizza — ₹179
- Paneer Pizza — ₹269
- Peri Peri Chicken Pizza — ₹349
- Barbeque Chicken Pizza — ₹399
- Paneer Makhani Pizza — ₹289

### Pizza Add-on
- Extra Cheese — ₹30

### Burgers
- Veg Burger — ₹99
- Cheez Burger — ₹129
- Double Lamb Burger — ₹149
- Chicken Burger — ₹149

### Sandwiches
- Masala Sandwich — ₹99
- Paneer Tikka Sandwich — ₹129
- Chicken Sandwich — ₹149
- Paneer Makhani — ₹169

### Sides
- French Fries (Regular) — ₹80
- French Fries (Large) — ₹149
- Garlic Bread — ₹129

### Shakes
- Vanilla Shake — ₹139
- Strawberry Shake — ₹139
- Apple Shake — ₹139
- Chocolate Shake — ₹139
- Pineapple Shake — ₹139
- Orange Shake — ₹139
- Cold Coffee — ₹80

### Cold Drinks & Water
- Sprite — ₹25
- Mountain Dew — ₹25
- Water 500 ml — ₹10
- Water 1 litre — ₹20

## Important: one price per pizza

The previous regular/large two-price system has been removed. Each pizza now has exactly one customer-facing price: the higher price supplied by the owner.

## Production persistence

Render Free web services have an ephemeral filesystem. Because WhatsApp `LocalAuth` requires persistent storage, the production configuration uses `RemoteAuth` with MongoDB when `MONGODB_URI` is configured. The same MongoDB cluster also stores orders and sessions.

Create a free MongoDB Atlas Free cluster and set `MONGODB_URI`. Free Atlas clusters provide 512 MB of storage and are intended for small workloads. The project will fall back to local JSON only when `MONGODB_URI` is absent (for local testing).

## Local run

Requirements: Node.js 20–22.

```bash
npm install
cp .env.example .env
npm start
```

On first start, scan the QR printed in the terminal with:

WhatsApp → Linked Devices → Link a Device

Open:

`http://localhost:3000/`

## Render + UptimeRobot free setup

### 1. Put this folder in GitHub

Do NOT upload `.env`, `.wwebjs_auth`, or `data/*.json`.

### 2. Create MongoDB Atlas Free cluster

Create a free M0/Free cluster, database user, and network access. Put the connection string into Render as `MONGODB_URI`.

### 3. Deploy on Render

Create a Web Service from the GitHub repository.

Build command:

`npm install`

Start command:

`node src/server.js`

Health check path:

`/healthz`

Set all environment variables from `.env.example` in Render.

### 4. First WhatsApp login

Open Render logs. The bot will print a QR code. Scan it with the restaurant WhatsApp account.

Once `WhatsApp bot is LIVE` appears, the RemoteAuth session is backed up to MongoDB.

### 5. UptimeRobot

Create a free HTTP monitor pointing to:

`https://YOUR-RENDER-SERVICE.onrender.com/healthz`

Use the free 5-minute monitoring interval.

The health endpoint is intentionally lightweight and keeps the Render web service receiving inbound traffic.

### 6. Important Render limitation

Render Free services can still restart, and the free plan is intended for testing/hobby use rather than durable production. UptimeRobot reduces idle spin-down risk, but it does not guarantee that Render will never restart the service. RemoteAuth + MongoDB is therefore used so the WhatsApp session and order data can be restored after a restart.

## Admin dashboard

Open `/` after deployment and login with the `ADMIN_PASSWORD` configured in Render.

The dashboard shows:

- Today's orders
- Today's sales
- New orders
- Preparing orders
- Ready orders
- Out for delivery
- Delivered orders
- Cancelled orders
- Customer name/phone
- Items and totals
- FREE DELIVERY and COD
- Customer location/landmark
- Status controls

## Security

Never commit API keys, admin passwords, MongoDB credentials, WhatsApp session files, or `.env`.

## WhatsApp automation note

This project uses `whatsapp-web.js`, which automates a logged-in WhatsApp Web account; it is not the official WhatsApp Cloud API. It is suitable for an owner-controlled number but carries platform/account stability risks. For a business-critical deployment, evaluate the official WhatsApp Business Platform as a future upgrade.
