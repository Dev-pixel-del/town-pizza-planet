# Town Pizza Planet — Animated Web Ordering

The customer ordering interface now lives at `/order` and is designed for the zero-third-party-fee route:

WhatsApp -> customer opens ordering link -> animated web catalogue -> cart -> name/address -> COD -> order confirmation.

## Important

- Keep the existing `.env` file in your local project. The replacement package intentionally does not contain secrets.
- Add this variable to `.env`:

  `PUBLIC_ORDER_URL=https://town-pizza-planet.onrender.com`

- The existing WhatsApp account can send customers the ordering link after they type Hi.
- The website uses the existing MongoDB order database and existing product/combo/family-pack images.

## Local test

From `C:\TownPizzaPlanet`:

`npm install`

`npm start`

Open:

`http://localhost:3000/order`

For phone testing, use the public Render URL after deploying the updated code.

## Render deploy

Push the updated project to GitHub and deploy/redeploy on Render. Keep the existing MongoDB-related environment variables unchanged and add:

`PUBLIC_ORDER_URL=https://town-pizza-planet.onrender.com`

The customer page is served by the same Node/Express application, so no separate hosting service is required.
