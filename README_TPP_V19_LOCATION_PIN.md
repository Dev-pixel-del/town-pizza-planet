# Town Pizza Planet V19 — GPS + draggable delivery pin

Replace these files in your current project:
- `public/order/app.js` — complete replacement
- `public/order/sw.js` — complete replacement
- `src/web/orderApi.js` — complete replacement

Customer flow: fresh high-accuracy GPS reading(s) → best reading selected → map opens → draggable pin → customer confirms → confirmed coordinates are stored. GPS remains optional.

No new npm package is needed. Leaflet and OpenStreetMap tiles load in the browser.
