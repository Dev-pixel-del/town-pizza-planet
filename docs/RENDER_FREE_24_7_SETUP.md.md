# Town Pizza Planet — Render Free + UptimeRobot + MongoDB Atlas

## Why MongoDB is included

Render Free web services use an ephemeral filesystem. Local files such as WhatsApp LocalAuth sessions and JSON orders can disappear after a restart or spin-down. The production build therefore uses MongoDB Atlas Free for durable application data and whatsapp-web.js RemoteAuth for the WhatsApp session.

## Step 1 — MongoDB Atlas Free

1. Create a MongoDB Atlas account.
2. Create one Free/M0 cluster.
3. Create a database user and password.
4. Add the network access rule required by your Atlas setup. For a simple prototype, `0.0.0.0/0` with a strong database username/password can be used; tighten this later if you can use a fixed egress IP.
5. Copy the application connection string.
6. Put it in Render as:

`MONGODB_URI=mongodb+srv://.../town_pizza_planet?retryWrites=true&w=majority`

## Step 2 — GitHub

Push this project to GitHub.

Do NOT commit:

- `.env`
- `.wwebjs_auth/`
- `data/*.json`
- real credentials

## Step 3 — Render

Create a Web Service from the GitHub repository.

Build command:

`npm install --include=optional && PUPPETEER_CACHE_DIR=.puppeteer-cache npx puppeteer browsers install chrome`

Start command:

`node src/server.js`

Health check path:

`/healthz`

Select the Free plan.

Set these environment variables:

- `STORE_NAME=Town Pizza Planet`
- `STORE_PHONE=...`
- `OWNER_PHONE=91...`
- `ADMIN_PASSWORD=...`
- `NODE_ENV=production`
- `MONGODB_URI=...`
- `REQUIRE_MONGODB=true`
- `FREE_DELIVERY_THRESHOLD=150`
- `MINIMUM_DELIVERY_ORDER=150`
- `DELIVERY_RADIUS_KM=...`
- `RESTAURANT_LATITUDE=...`
- `RESTAURANT_LONGITUDE=...`
- `RESTRICT_HOURS=false`
- `PUPPETEER_CACHE_DIR=.puppeteer-cache`

## Step 4 — First WhatsApp login

Open the Render service logs.

On first authentication, the bot prints a QR code in the logs.

Scan it using the restaurant's WhatsApp account:

WhatsApp → Linked Devices → Link a Device

Wait for:

`Town Pizza Planet WhatsApp bot is LIVE`

RemoteAuth will periodically back up the session to MongoDB.

## Step 5 — UptimeRobot

Create a Free UptimeRobot account.

Create an HTTP monitor:

`https://YOUR-SERVICE.onrender.com/healthz`

Use the free 5-minute interval.

The endpoint deliberately remains unauthenticated so UptimeRobot can reach it.

## Important limitation

UptimeRobot does not make Render truly immutable. Render may restart a Free instance, and Free services are intended for testing/hobby usage. The important part is that the project uses MongoDB RemoteAuth, so a normal Render restart does not require a new QR scan every time.

## Step 6 — Admin dashboard

Open:

`https://YOUR-SERVICE.onrender.com/`

Login using `ADMIN_PASSWORD`.

The dashboard supports:

- New orders
- Preparing
- Ready
- Out for delivery
- Delivered
- Cancelled
- Customer phone
- Customer landmark
- Customer GPS/map link
- COD amount
- Free delivery indicator

## Step 7 — Test before taking real orders

1. Send `Hi` from a second WhatsApp number.
2. Select each language once.
3. Browse every category.
4. Add a pizza and a Sprite.
5. Confirm the cart crosses ₹150.
6. Verify the bot says FREE DELIVERY.
7. Share WhatsApp current location.
8. Send a landmark.
9. Confirm COD.
10. Verify the order appears in the dashboard.
11. Change status to Preparing, Ready, Out for Delivery and Delivered.
12. Verify customer status messages arrive.
