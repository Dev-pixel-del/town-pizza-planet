const CACHE='tpp-admin-v4';
self.addEventListener('install',()=>self.skipWaiting());
self.addEventListener('activate',e=>e.waitUntil(self.clients.claim()));
self.addEventListener('fetch',e=>{const u=new URL(e.request.url);if(u.origin!==location.origin||u.pathname.startsWith('/api/'))return;e.respondWith(fetch(e.request).catch(()=>caches.match(e.request)));});
self.addEventListener('push',event=>{
  let d={};try{d=event.data?event.data.json():{}}catch{d={title:'Town Pizza Planet',body:'New order received'}}
  const orderId=d.orderId||'';const title=d.title||'🚨 NEW ORDER — TOWN PIZZA PLANET';const body=d.body||'New order received';
  const isOrder=d.type==='new-order' && Boolean(orderId);
  event.waitUntil((async()=>{
    const openClients=await clients.matchAll({type:'window',includeUncontrolled:true});
    for(const c of openClients){try{c.postMessage({type:'owner-alert-push',payload:d});}catch{}}
    await self.registration.showNotification(title,{body,icon:'/admin/admin-icon-192.png',badge:'/admin/admin-icon-192.png',tag:`tpp-order-${orderId||Date.now()}`,renotify:true,requireInteraction:true,silent:false,vibrate:[700,300,700,300,1000],data:{orderId,url:d.url||'/admin/'},actions:isOrder?[{action:'accept',title:'✅ ACCEPT ORDER'},{action:'reject',title:'❌ REJECT ORDER'}]:[]});
  })());
});
self.addEventListener('notificationclick',event=>{const n=event.notification;const d=n.data||{};const orderId=d.orderId||'';const action=event.action||'view';n.close();event.waitUntil((async()=>{
  if((action==='accept'||action==='reject') && orderId){
    const endpoint=`/api/owner-alerts/${encodeURIComponent(orderId)}/${action==='accept'?'ack':'reject'}`;
    try{
      const r=await fetch(endpoint,{method:'POST',headers:{'Content-Type':'application/json'},credentials:'same-origin',body:action==='reject'?JSON.stringify({reason:'Rejected from owner alert notification'}):'{}'});
      if(!r.ok) throw new Error('Request failed');
      const list=await clients.matchAll({type:'window',includeUncontrolled:true});
      for(const c of list){try{c.postMessage({type:'owner-alert-action',action,orderId});}catch{}}
      if(action==='reject'){return;}
    }catch(err){
      await self.registration.showNotification('⚠️ Town Pizza Planet',{body:`Could not ${action==='accept'?'accept':'reject'} ${orderId}. Open Admin to retry.`,icon:'/admin/admin-icon-192.png',tag:`tpp-action-error-${orderId}`,data:{orderId,url:d.url||'/admin/'}});
    }
  }
  const url=d.url||'/admin/';
  const list=await clients.matchAll({type:'window',includeUncontrolled:true});
  for(const c of list){if('focus' in c){await c.focus();if('navigate' in c)c.navigate(url);return;}}
  if(clients.openWindow)await clients.openWindow(url);
})());});
