const CACHE="msi-financial-calculator-v2-3";
const ASSETS=["./manifest.webmanifest","./sw.js","../access-guard.js?v=2","./ui-enhancements.css","./ui-enhancements.js"];

async function enhanceHTML(response){
  if(!response || !response.ok) return response;
  const text=await response.text();
  if(text.includes('ui-enhancements.css')) return new Response(text,{status:response.status,statusText:response.statusText,headers:response.headers});
  const enhanced=text.replace('</head>', '<link rel="stylesheet" href="./ui-enhancements.css"><script src="./ui-enhancements.js" defer></script></head>');
  const headers=new Headers(response.headers);
  headers.delete('content-length');
  return new Response(enhanced,{status:response.status,statusText:response.statusText,headers});
}

self.addEventListener("install",event=>event.waitUntil((async()=>{
  const cache=await caches.open(CACHE);
  await Promise.all(ASSETS.map(async asset=>{
    try{
      const response=await fetch(asset,{cache:"no-store"});
      if(response.ok) await cache.put(asset,response.clone());
    }catch(e){}
  }));
  try{
    const response=await fetch("./index.html",{cache:"no-store"});
    if(response.ok){
      const enhanced=await enhanceHTML(response);
      await cache.put("./index.html",enhanced.clone());
      await cache.put("./",enhanced.clone());
    }
  }catch(e){}
  await self.skipWaiting();
})()));

self.addEventListener("activate",event=>event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(key=>key.startsWith("msi-financial-calculator-v2")&&key!==CACHE).map(key=>caches.delete(key)))).then(()=>self.clients.claim())));

self.addEventListener("fetch",event=>{
  if(event.request.method!=="GET")return;
  event.respondWith((async()=>{
    const cached=await caches.match(event.request);
    if(cached)return cached;
    try{
      const response=await fetch(event.request);
      const url=new URL(event.request.url);
      const acceptsHTML=(event.request.headers.get("accept")||"").includes("text/html");
      const isHTML=acceptsHTML || url.pathname.endsWith("/v2/") || url.pathname.endsWith("/v2/index.html");
      if(url.origin===location.origin){
        const toCache=isHTML?await enhanceHTML(response.clone()):response.clone();
        caches.open(CACHE).then(cache=>cache.put(event.request,toCache)).catch(()=>{});
        if(isHTML)return toCache;
      }
      return response;
    }catch(e){
      return cached;
    }
  })());
});
