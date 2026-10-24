// Cloudflare Worker — הזרמת שירים מהדרייב (בלי תקרת תעבורה, עם מטמון קרוב למאזין)
// מדביקים בלוח הבקרה של Cloudflare. סודות: GOOGLE_CLIENT_EMAIL, GOOGLE_PRIVATE_KEY. משתנה: ALLOWED_ORIGINS

let tokenCache = { token: null, exp: 0 };

const b64url = bytes => btoa(String.fromCharCode(...bytes)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');

function pemToDer(pem) {
  const b64 = pem.replace(/^"|"$/g, '').replace(/\\n/g, '\n').replace(/-----[A-Z ]+-----/g, '').replace(/\s+/g, '');
  return Uint8Array.from(atob(b64), c => c.charCodeAt(0));
}

async function getToken(env) {
  const now = Math.floor(Date.now() / 1000);
  if (tokenCache.token && tokenCache.exp - 60 > now) return tokenCache.token;
  // שיתוף הטוקן בין מופעים של ה-Worker דרך המטמון, כדי לא לחתום ולבקש מגוגל מחדש בכל התחלה קרה
  const tkey = new Request('https://token-cache.invalid/t');
  const saved = await caches.default.match(tkey).then(r => (r ? r.json() : null)).catch(() => null);
  if (saved && saved.exp - 60 > now) { tokenCache = saved; return saved.token; }
  const enc = o => b64url(new TextEncoder().encode(JSON.stringify(o)));
  const unsigned = `${enc({ alg: 'RS256', typ: 'JWT' })}.${enc({
    iss: env.GOOGLE_CLIENT_EMAIL, scope: 'https://www.googleapis.com/auth/drive.readonly',
    aud: 'https://oauth2.googleapis.com/token', iat: now, exp: now + 3600,
  })}`;
  const key = await crypto.subtle.importKey('pkcs8', pemToDer(env.GOOGLE_PRIVATE_KEY),
    { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' }, false, ['sign']);
  const sig = await crypto.subtle.sign('RSASSA-PKCS1-v1_5', key, new TextEncoder().encode(unsigned));
  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer', assertion: `${unsigned}.${b64url(new Uint8Array(sig))}` }),
  });
  const j = await res.json();
  if (!j.access_token) throw new Error('google auth failed');
  tokenCache = { token: j.access_token, exp: now + (j.expires_in || 3600) };
  await caches.default.put(tkey, new Response(JSON.stringify(tokenCache), { headers: { 'Cache-Control': 'max-age=3000' } })).catch(() => {});
  return j.access_token;
}

const okType = t => /^(audio\/|video\/mp4|application\/(ogg|pdf|octet-stream))/.test(t || '');
const kind = t => (/^(audio\/|application\/pdf)/.test(t || '') ? t : 'audio/mpeg');

export default {
  // מופעל לפי Cron Triggers שמגדירים ב-Cloudflare: כל 15 דקות סריקה מהירה, כל 3 שעות סריקה מלאה
  async scheduled(event, env, ctx) {
    const base = env.SITE_URL || 'https://music-site-flame.vercel.app';
    const full = event.cron === (env.FULL_CRON || '0 */3 * * *');
    ctx.waitUntil(fetch(`${base}/api/sync${full ? '' : '?scope=monthly'}`, { headers: { Authorization: `Bearer ${env.SYNC_KEY}` } }).catch(() => {}));
  },

  async fetch(req, env, ctx) {
    const url = new URL(req.url);
    if (url.pathname === '/') return new Response('yalla stream ok');

    const origins = (env.ALLOWED_ORIGINS || 'https://music-site-flame.vercel.app').split(',').map(s => s.trim()).filter(Boolean);
    const origin = req.headers.get('Origin');
    let src = origin;
    if (!src && req.headers.get('Referer')) { try { src = new URL(req.headers.get('Referer')).origin; } catch {} }
    const allowed = !src || origins.includes(src); // בלי Referer (פתיחה ישירה) מותר; אתר זר — חסום
    const cors = origin && allowed ? { 'Access-Control-Allow-Origin': origin, Vary: 'Origin' } : { Vary: 'Origin' };

    if (req.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: { ...cors, 'Access-Control-Allow-Methods': 'GET, OPTIONS', 'Access-Control-Allow-Headers': 'Range', 'Access-Control-Max-Age': '86400' } });
    }
    const m = /^\/api\/stream\/([\w-]{10,})$/.exec(url.pathname);
    if (req.method !== 'GET' || !m) return new Response('not found', { status: 404 });
    if (!allowed) return new Response('forbidden', { status: 403 });

    try {
      const id = m[1];
      const range = req.headers.get('Range');
      const start = range ? Number((/bytes=(\d+)-/.exec(range) || [])[1] || 0) : 0;
      const cache = caches.default;
      const keyUrl = `https://stream-cache.invalid/${id}`;

      let res = await cache.match(new Request(keyUrl, range ? { headers: { Range: range } } : undefined));
      if (!res) {
        const auth = { Authorization: `Bearer ${await getToken(env)}` };
        const driveUrl = `https://www.googleapis.com/drive/v3/files/${id}?alt=media&supportsAllDrives=true`;
        if (start > 0) {
          // גלילה לאמצע שיר שעדיין לא במטמון — מעבירים ישירות
          const up = await fetch(driveUrl, { headers: { ...auth, Range: range } });
          if (!up.ok) return new Response('not found', { status: up.status === 404 ? 404 : 502 });
          if (!okType(up.headers.get('content-type'))) return new Response('forbidden', { status: 403 });
          const h = new Headers({ 'Content-Type': kind(up.headers.get('content-type')), 'Accept-Ranges': 'bytes' });
          for (const k of ['content-length', 'content-range']) if (up.headers.get(k)) h.set(k, up.headers.get(k));
          res = new Response(up.body, { status: up.status, headers: h });
        } else {
          const up = await fetch(driveUrl, { headers: auth });
          if (!up.ok) return new Response('not found', { status: up.status === 404 ? 404 : 502 });
          if (!okType(up.headers.get('content-type'))) return new Response('forbidden', { status: 403 });
          const h = new Headers({ 'Content-Type': kind(up.headers.get('content-type')), 'Accept-Ranges': 'bytes', 'Cache-Control': 'public, max-age=604800' });
          if (up.headers.get('content-length')) h.set('Content-Length', up.headers.get('content-length'));
          const [a, b] = up.body.tee();
          ctx.waitUntil(cache.put(new Request(keyUrl), new Response(a, { status: 200, headers: h })));
          res = new Response(b, { status: 200, headers: h });
        }
      }

      const out = new Headers(res.headers);
      for (const [k, v] of Object.entries(cors)) out.set(k, v);
      out.set('Access-Control-Expose-Headers', 'Content-Length, Content-Range, Accept-Ranges');
      if (url.searchParams.has('download')) {
        const meta = await fetch(`https://www.googleapis.com/drive/v3/files/${id}?fields=name&supportsAllDrives=true`,
          { headers: { Authorization: `Bearer ${await getToken(env)}` } }).then(r => r.json()).catch(() => ({}));
        out.set('Content-Disposition', `attachment; filename*=UTF-8''${encodeURIComponent(meta.name || 'song.mp3')}`);
      }
      return new Response(res.body, { status: res.status, headers: out });
    } catch (e) {
      return new Response('stream error', { status: 502, headers: cors });
    }
  },
};
