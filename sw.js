// เก็บเกมไว้ในเครื่องให้เล่นออฟไลน์ได้ เปลี่ยน VERSION ทุกครั้งที่อยากล้างแคชเก่า
const VERSION='ot-sw-2';
const CORE=['./','./index.html','./manifest.webmanifest','./icon-180.png','./icon-192.png','./icon-512.png'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(VERSION).then(c=>c.addAll(CORE.map(u=>new Request(u,{cache:'reload'})))).then(()=>self.skipWaiting()))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==VERSION).map(k=>caches.delete(k)))).then(()=>self.clients.claim()))});
function timeout(ms){return new Promise((_,rej)=>setTimeout(()=>rej(new Error('timeout')),ms))}
self.addEventListener('fetch',e=>{
  const r=e.request; if(r.method!=='GET')return;
  if(r.mode==='navigate'){

    // ดึงจากเน็ตแบบไม่ใช้แคชเบราว์เซอร์ ถ้าเกิน 4 วิค่อยใช้ตัวเก่าก่อน แต่ยังโหลดตัวใหม่เก็บไว้เบื้องหลัง เปิดครั้งหน้าได้ของใหม่
    const net=fetch(r,{cache:'no-store'}).then(res=>{if(res&&res.ok){const cp=res.clone();caches.open(VERSION).then(c=>c.put('./index.html',cp))}return res});
    e.waitUntil(net.catch(()=>{}));
    e.respondWith(Promise.race([net,timeout(4000)]).catch(()=>caches.match('./index.html',{ignoreSearch:true}).then(h=>h||net)));
    return;
  }
  // ไฟล์อื่น (ไอคอน ฟอนต์): ใช้จากเครื่องก่อน แล้วอัปเดตเบื้องหลัง
  e.respondWith(caches.match(r).then(hit=>{
    const net=fetch(r).then(res=>{if(res&&(res.ok||res.type==='opaque')){const cp=res.clone();caches.open(VERSION).then(c=>c.put(r,cp))}return res}).catch(()=>hit);
    return hit||net;
  }));
});
