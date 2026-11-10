import test, { before, after } from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { buildApp, parseEmails } from '../src/server.js';
import { loadConfig } from '../src/config.js';

// "דרייב" מזויף: 1MB לשיר תקין, HTML לקובץ שאסור להגיש. תומך ב-Range.
const SONG = Buffer.alloc(1024 * 1024).map((_, i) => i % 251);
const hits = {};
let drive, server, base, cacheDir;

before(async () => {
  drive = http.createServer((req, res) => {
    const id = req.url.split('?')[0].split('/').pop();
    hits[id] = (hits[id] || 0) + 1;
    if (id === 'notafile00000') { res.writeHead(404).end(); return; }
    if (id === 'badtype000000') { res.writeHead(200, { 'Content-Type': 'text/html' }).end('<html>'); return; }
    const m = /bytes=(\d+)-(\d*)/.exec(req.headers.range || '');
    if (m) {
      const s = +m[1], e = m[2] ? Math.min(+m[2], SONG.length - 1) : SONG.length - 1;
      res.writeHead(206, { 'Content-Type': 'audio/mpeg', 'Content-Range': `bytes ${s}-${e}/${SONG.length}`, 'Content-Length': e - s + 1 });
      res.end(SONG.subarray(s, e + 1));
    } else {
      res.writeHead(200, { 'Content-Type': 'audio/mpeg', 'Content-Length': SONG.length });
      res.end(SONG);
    }
  });
  await new Promise(r => drive.listen(0, r));
  cacheDir = fs.mkdtempSync(path.join(os.tmpdir(), 'ys-cache-'));
  const cfg = loadConfig({
    TEST_MODE: '1', SITE_ORIGIN: 'https://site.test', COOKIE_SECURE: '0', APPROVAL_CACHE_MS: '60000',   // מטמון ארוך בכוונה: מוכיח שהמנהל מנקה אותו
    ADMIN_EMAILS: 'admin@x.com', DRIVE_API_BASE: `http://127.0.0.1:${drive.address().port}`, CACHE_DIR: cacheDir, CACHE_MAX_GB: '1',
  });
  server = http.createServer(buildApp(cfg).app);
  await new Promise(r => server.listen(0, r));
  base = `http://127.0.0.1:${server.address().port}`;
});
after(() => { server.close(); drive.close(); fs.rmSync(cacheDir, { recursive: true, force: true }); });

const H = { Origin: 'https://site.test' };
const JSONH = { ...H, 'Content-Type': 'application/json' };
async function login(email) {
  const r = await fetch(base + '/auth/session', { method: 'POST', headers: JSONH, body: JSON.stringify({ access_token: `test:${email.split('@')[0]}:${email}` }) });
  return { r, json: await r.json(), cookie: (r.headers.get('set-cookie') || '').split(';')[0] };
}
const get = (p, cookie, extra = {}) => fetch(base + p, { headers: { ...H, ...(cookie ? { Cookie: cookie } : {}), ...extra } });
const post = (p, cookie, body, headers = JSONH) => fetch(base + p, { method: 'POST', headers: { ...headers, Cookie: cookie }, body: JSON.stringify(body) });
const sleep = ms => new Promise(r => setTimeout(r, ms));
let adminCookie;

test('בלי התחברות: 401', async () => {
  assert.equal((await get('/stream/songsongsong1')).status, 401);
});

test('טוקן לא תקין נדחה', async () => {
  const r = await fetch(base + '/auth/session', { method: 'POST', headers: JSONH, body: JSON.stringify({ access_token: 'garbage' }) });
  assert.equal(r.status, 401);
});

test('משתמש חדש שלא אושר: מתחבר, אבל מקבל "ממתין לאישור" ו-403 בהזרמה', async () => {
  const { json, cookie } = await login('newbie@gmail.com');
  assert.equal(json.approved, false);
  assert.equal(json.message, 'Waiting for admin approval');
  assert.equal(json.message_he, 'ממתין לאישור מנהל');
  const r = await get('/stream/songsongsong1', cookie);
  assert.equal(r.status, 403);
  assert.equal((await r.json()).error, 'not_approved');
  assert.equal((await get('/me', cookie).then(x => x.json())).approved, false);
});

test('משתמש רגיל לא נכנס לממשק הניהול', async () => {
  const { cookie } = await login('newbie@gmail.com');
  assert.equal((await get('/admin/api/users', cookie)).status, 403);
  assert.equal((await post('/admin/api/approve', cookie, { email: 'newbie@gmail.com' })).status, 403);
  assert.equal((await get('/admin/api/users')).status, 401);
});

test('המנהל רואה את הממתינים ומאשר: מיד יש גישה, גם עם מטמון אישורים', async () => {
  ({ cookie: adminCookie } = await login('admin@x.com'));
  const pend = await (await get('/admin/api/users?status=pending', adminCookie)).json();
  assert.ok(pend.users.some(u => u.email === 'newbie@gmail.com'));

  const user = await login('newbie@gmail.com');
  assert.equal((await get('/stream/songsongsong1', user.cookie)).status, 403);     // נכנס למטמון כ"לא מאושר"
  const ok = await post('/admin/api/approve', adminCookie, { email: ' Newbie@Gmail.com ' });
  assert.equal(ok.status, 200);
  assert.equal((await get('/stream/songsongsong1', user.cookie)).status, 200);      // מיד, בלי לחכות למטמון
});

test('שמע מלא, גלילה (Range) ומטמון דיסק למאושרים', async () => {
  const { cookie } = await login('newbie@gmail.com');
  const full = await get('/stream/songsongsong9', cookie);
  assert.equal(full.status, 200);
  assert.equal(full.headers.get('accept-ranges'), 'bytes');
  assert.ok(Buffer.from(await full.arrayBuffer()).equals(SONG));
  await sleep(300);
  assert.ok(fs.existsSync(path.join(cacheDir, 'songsongsong9')));

  const before = hits.songsongsong9;
  const part = await get('/stream/songsongsong9', cookie, { Range: 'bytes=1000-1999' });
  assert.equal(part.status, 206);
  assert.equal(part.headers.get('content-range'), `bytes 1000-1999/${SONG.length}`);
  assert.ok(Buffer.from(await part.arrayBuffer()).equals(SONG.subarray(1000, 2000)));
  assert.equal((await get('/stream/songsongsong9', cookie, { Range: 'bytes=0-1' })).status, 206);   // בדיקת ספארי
  assert.equal(hits.songsongsong9, before);
});

test('גלילה לאמצע שיר שלא במטמון: 206 ישיר מהדרייב', async () => {
  const { cookie } = await login('newbie@gmail.com');
  const part = await get('/stream/songsongsong2', cookie, { Range: 'bytes=500000-500099' });
  assert.equal(part.status, 206);
  assert.ok(Buffer.from(await part.arrayBuffer()).equals(SONG.subarray(500000, 500100)));
});

test('ביטול גישה נכנס לתוקף מיד', async () => {
  const { cookie } = await login('newbie@gmail.com');
  assert.equal((await get('/stream/songsongsong2', cookie)).status, 200);
  assert.equal((await post('/admin/api/revoke', adminCookie, { email: 'newbie@gmail.com' })).status, 200);
  assert.equal((await get('/stream/songsongsong2', cookie)).status, 403);
});

test('אישור מראש: מייל שאושר לפני הכניסה הראשונה מקבל גישה מיד', async () => {
  await post('/admin/api/approve', adminCookie, { emails: ['early@gmail.com'] });
  const { json, cookie } = await login('early@gmail.com');
  assert.equal(json.approved, true);
  assert.equal((await get('/stream/songsongsong1', cookie)).status, 200);
});

test('אישור של רשימה מודבקת: מנקה, מאחד כפילויות ומתעלם ממה שאינו מייל', async () => {
  assert.deepEqual(parseEmails({ text: 'A@x.com, b@y.com;\n a@X.com  not-an-email <c@z.org>' }), ['a@x.com', 'b@y.com', 'c@z.org']);
  const r = await post('/admin/api/approve', adminCookie, { text: 'one@x.com two@x.com ONE@x.com' });
  assert.equal((await r.json()).count, 2);
  assert.equal((await post('/admin/api/approve', adminCookie, { text: 'no emails here' })).status, 400);
});

test('המנהל לא יכול לבטל בטעות את עצמו; ובקשת ניהול שאינה JSON נדחית (CSRF)', async () => {
  assert.equal((await post('/admin/api/revoke', adminCookie, { email: 'admin@x.com' })).status, 400);
  const r = await fetch(base + '/admin/api/approve', { method: 'POST', headers: { ...H, 'Content-Type': 'text/plain', Cookie: adminCookie }, body: '{"email":"evil@x.com"}' });
  assert.equal(r.status, 415);
});

test('אתר זר נחסם; קובץ שאינו שמע לא מוגש', async () => {
  const { cookie } = await login('early@gmail.com');
  assert.equal((await fetch(base + '/stream/songsongsong1', { headers: { Origin: 'https://evil.test', Cookie: cookie } })).status, 403);
  assert.equal((await get('/stream/badtype000000', cookie)).status, 403);
  assert.equal((await get('/stream/notafile00000', cookie)).status, 404);
});

test('דף הניהול נטען עם הגנות', async () => {
  const r = await get('/admin');
  assert.equal(r.status, 200);
  assert.match(r.headers.get('content-security-policy'), /frame-ancestors 'none'/);
  assert.match(await r.text(), /ניהול גישה/);
});
