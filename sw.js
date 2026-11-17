// เก็บเกมไว้ในเครื่องให้เล่นออฟไลน์ได้ เปลี่ยน VERSION ทุกครั้งที่อยากล้างแคชเก่า
const VERSION='ot-sw-1';
const CORE=['./','./index.html','./manifest.webmanifest','./icon-180.png','./icon-192.png','./icon-512.png'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(VERSION).then(c=>c.addAll(CORE)).then(()=>self.skipWaiting()))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==VERSION).map(k=>caches.delete(k)))).then(()=>self.clients.claim()))});
function timeout(ms){return new Promise((_,rej)=>setTimeout(()=>rej(new Error('timeout')),ms))}
self.addEventListener('fetch',e=>{
  const r=e.request; if(r.method!=='GET')return;
  if(r.mode==='navigate'){
    // มีเน็ต: เอาเวอร์ชันล่าสุด (รอไม่เกิน 4 วิ เผื่อเน็ตบนเครื่องบินช้า) / ไม่มีเน็ต: ใช้ตัวที่เก็บไว้
    e.respondWith(Promise.race([fetch(r),timeout(4000)]).then(res=>{const cp=res.clone();caches.open(VERSION).then(c=>c.put('./index.html',cp));return res})
      .catch(()=>caches.match('./index.html',{ignoreSearch:true})));
    return;
  }
  // ไฟล์อื่น (ไอคอน ฟอนต์): ใช้จากเครื่องก่อน แล้วอัปเดตเบื้องหลัง
  e.respondWith(caches.match(r).then(hit=>{
    const net=fetch(r).then(res=>{if(res&&(res.ok||res.type==='opaque')){const cp=res.clone();caches.open(VERSION).then(c=>c.put(r,cp))}return res}).catch(()=>hit);
    return hit||net;
  }));
});
