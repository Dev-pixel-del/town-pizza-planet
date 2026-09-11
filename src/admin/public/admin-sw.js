const CACHE='tpp-admin-v1';
self.addEventListener('install',()=>self.skipWaiting());
self.addEventListener('activate',e=>e.waitUntil(self.clients.claim()));
self.addEventListener('fetch',e=>{const u=new URL(e.request.url);if(u.origin!==location.origin||u.pathname.startsWith('/api/'))return;e.respondWith(fetch(e.request).catch(()=>caches.match(e.request)));});
self.addEventListener('push',event=>{
  let d={};try{d=event.data?event.data.json():{}}catch{d={title:'Town Pizza Planet',body:'New order received'}}
  const orderId=d.orderId||'';const title=d.title||'🚨 NEW ORDER — TOWN PIZZA PLANET';const body=d.body||'New order received';
  event.waitUntil(self.registration.showNotification(title,{body,icon:'/admin/admin-icon-192.png',badge:'/admin/admin-icon-192.png',tag:`tpp-order-${orderId||Date.now()}`,renotify:true,requireInteraction:true,silent:false,vibrate:[500,250,500,250,800],data:{orderId,url:d.url||'/admin/'},actions:[{action:'view',title:'VIEW ORDER'}]}));
});
self.addEventListener('notificationclick',event=>{event.notification.close();const d=event.notification.data||{};const url=d.url||'/admin/';event.waitUntil((async()=>{try{if(d.orderId)await fetch(`/api/owner-alerts/${encodeURIComponent(d.orderId)}/ack`,{method:'POST',credentials:'include',headers:{'Content-Type':'application/json'}})}catch{}const list=await clients.matchAll({type:'window',includeUncontrolled:true});for(const c of list){if('focus' in c){await c.focus();if('navigate' in c)c.navigate(url);return;}}if(clients.openWindow)await clients.openWindow(url);})());});
