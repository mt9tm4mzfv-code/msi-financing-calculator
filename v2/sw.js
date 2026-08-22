const CACHE="msi-financial-calculator-v2-2";
const ASSETS=["./","./index.html","./manifest.webmanifest","./sw.js","../access-guard.js?v=2"];
self.addEventListener("install",event=>event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(ASSETS)).then(()=>self.skipWaiting()).catch(()=>{})));
self.addEventListener("activate",event=>event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(key=>key.startsWith("msi-financial-calculator-v2")&&key!==CACHE).map(key=>caches.delete(key)))).then(()=>self.clients.claim())));
self.addEventListener("fetch",event=>{
  if(event.request.method!=="GET")return;
  event.respondWith(caches.match(event.request).then(cached=>cached||fetch(event.request).then(response=>{
    const copy=response.clone();
    if(new URL(event.request.url).origin===location.origin){caches.open(CACHE).then(cache=>cache.put(event.request,copy));}
    return response;
  }).catch(()=>cached)));
});
