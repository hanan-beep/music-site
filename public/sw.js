// public/sw.js — v2: דפים "רשת קודם" (תמיד גרסה עדכנית), קבצים סטטיים ממטמון, ושירים שמורים להאזנה ללא אינטרנט
const VERSION = 'v4';
const STATIC = 'yallah-static-' + VERSION;
const PAGES = 'yallah-pages-' + VERSION;
const IMAGES = 'yallah-img-' + VERSION;
const SONGS = 'yallah-songs'; // לא נמחק בעדכון גרסה!

self.addEventListener('install', e => {
  e.waitUntil(caches.open(STATIC).then(c => c.addAll(['/offline.html', '/logo.png'])).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  const keep = [STATIC, PAGES, IMAGES, SONGS];
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => !keep.includes(k)).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});

async function serveSong(req, path) {
  const hit = await (await caches.open(SONGS)).match(path);
  if (!hit) return null;
  const buf = await hit.arrayBuffer();
  const type = hit.headers.get('content-type') || 'audio/mpeg';
  const range = req.headers.get('range');
  const m = range && /bytes=(\d+)-(\d*)/.exec(range);
  if (!m) return new Response(buf, { headers: { 'Content-Type': type, 'Content-Length': String(buf.byteLength), 'Accept-Ranges': 'bytes' } });
  const start = +m[1];
  const end = m[2] ? Math.min(+m[2], buf.byteLength - 1) : buf.byteLength - 1;
  return new Response(buf.slice(start, end + 1), {
    status: 206,
    headers: { 'Content-Type': type, 'Content-Range': `bytes ${start}-${end}/${buf.byteLength}`, 'Content-Length': String(end - start + 1), 'Accept-Ranges': 'bytes' },
  });
}

async function cacheFirst(req, name) {
  const cache = await caches.open(name);
  const hit = await cache.match(req);
  if (hit) return hit;
  const res = await fetch(req);
  if (res && res.status === 200) cache.put(req, res.clone());
  return res;
}

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);

  // שיר שמור במכשיר → מנגנים ממנו (כולל גלילה בתוך השיר)
  if (url.pathname.startsWith('/api/stream/') && !url.searchParams.has('download')) {
    e.respondWith(serveSong(req, url.pathname).then(r => r || fetch(req)));
    return;
  }
  if (url.origin !== location.origin) return;

  if (url.pathname.startsWith('/api/image/') || url.pathname.startsWith('/api/cover/')) {
    e.respondWith(cacheFirst(req, IMAGES).catch(() => new Response('', { status: 504 })));
    return;
  }
  if (url.pathname.startsWith('/api/')) return;
  if (url.pathname.startsWith('/_next/static/') || /\.(png|jpg|svg|ico|woff2?)$/.test(url.pathname)) {
    e.respondWith(cacheFirst(req, STATIC));
    return;
  }
  if (req.mode === 'navigate') {
    e.respondWith(
      fetch(req).then(res => {
        if (res && res.status === 200) { const c = res.clone(); caches.open(PAGES).then(p => p.put(req, c)); }
        return res;
      }).catch(async () => (await caches.match(req)) || (await caches.match('/offline.html')))
    );
  }
});
