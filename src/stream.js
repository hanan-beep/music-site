// src/stream.js — הזרמת שירים מהדרייב: תמיכה מלאה ב-Range, מטמון דיסק (LRU) והגנת מנוי
import fs from 'node:fs';
import fsp from 'node:fs/promises';
import path from 'node:path';
import { Readable } from 'node:stream';
import { GoogleAuth } from 'google-auth-library';
import { NOT_APPROVED } from './auth.js';

const ID_RE = /^[\w-]{10,}$/;
const OK_TYPE = /^(audio\/|video\/mp4|application\/(ogg|pdf|octet-stream))/;

const waitDrain = s => new Promise(resolve => {
  const done = () => { s.off('drain', done); s.off('close', done); resolve(); };
  s.once('drain', done); s.once('close', done);
});

export function makeStreamer(cfg, access) {
  const dir = path.resolve(cfg.CACHE_DIR);
  fs.mkdirSync(dir, { recursive: true });
  const auth = cfg.TEST_MODE ? null : new GoogleAuth({
    credentials: { client_email: cfg.GOOGLE_CLIENT_EMAIL, private_key: cfg.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n') },
    scopes: ['https://www.googleapis.com/auth/drive.readonly'],
  });
  const token = async () => (auth ? await auth.getAccessToken() : 'test');
  const driveUrl = id => `${cfg.DRIVE_API_BASE}/files/${id}?alt=media&supportsAllDrives=true`;
  const driveFetch = async (id, extra = {}) =>
    fetch(driveUrl(id), { ...extra, headers: { Authorization: `Bearer ${await token()}`, ...(extra.headers || {}) } });

  const inflight = new Set();
  let fills = 0;
  let evicting = false;

  async function cached(id) {
    const file = path.join(dir, id);
    try {
      const meta = JSON.parse(await fsp.readFile(file + '.json', 'utf8'));
      await fsp.access(file);
      return { file, type: meta.type };
    } catch { return null; }
  }

  // מוחק את השירים שלא הושמעו הכי הרבה זמן כשהמטמון עובר את המגבלה
  async function evict() {
    if (evicting) return;
    evicting = true;
    try {
      const names = (await fsp.readdir(dir)).filter(n => !n.endsWith('.json') && !n.endsWith('.part'));
      const stats = await Promise.all(names.map(async n => { const st = await fsp.stat(path.join(dir, n)); return { n, size: st.size, t: st.mtimeMs }; }));
      let total = stats.reduce((a, s) => a + s.size, 0);
      if (total <= cfg.CACHE_MAX_BYTES) return;
      stats.sort((a, b) => a.t - b.t);
      for (const s of stats) {
        if (total <= cfg.CACHE_MAX_BYTES * 0.9) break;
        await fsp.rm(path.join(dir, s.n), { force: true });
        await fsp.rm(path.join(dir, s.n + '.json'), { force: true });
        total -= s.size;
      }
    } finally { evicting = false; }
  }

  async function finalize(id, tmp, type, written, expected) {
    if (expected && written !== expected) { await fsp.rm(tmp, { force: true }); return; }   // הורדה חלקית: לא שומרים
    const file = path.join(dir, id);
    await fsp.rename(tmp, file);
    await fsp.writeFile(file + '.json', JSON.stringify({ type }));
    evict().catch(() => {});
  }

  // הורדה שקטה של שיר מלא למטמון (כשהמשתמש מבקש קטע מהאמצע)
  async function backgroundFill(id) {
    if (cfg.CACHE_MAX_BYTES <= 0 || inflight.has(id) || fills >= cfg.CACHE_FILL_CONCURRENCY) return;
    inflight.add(id); fills++;
    const tmp = path.join(dir, id + '.part');
    try {
      const up = await driveFetch(id);
      const type = up.headers.get('content-type') || '';
      if (!up.ok || !OK_TYPE.test(type)) return;
      const out = fs.createWriteStream(tmp);
      let written = 0;
      for await (const chunk of Readable.fromWeb(up.body)) { written += chunk.length; if (!out.write(chunk)) await waitDrain(out); }
      await new Promise(r => out.end(r));
      await finalize(id, tmp, type, written, Number(up.headers.get('content-length')) || 0);
    } catch { await fsp.rm(tmp, { force: true }).catch(() => {}); }
    finally { inflight.delete(id); fills--; }
  }

  // בקשה מלאה (בלי Range או bytes=0-): מזרימים ללקוח ובאותו זמן שומרים למטמון, בהורדה אחת מהדרייב
  async function teeAndCache(res, id, up, type) {
    const len = Number(up.headers.get('content-length')) || 0;
    res.status(200).set({ 'Content-Type': type, 'Accept-Ranges': 'bytes', 'Cache-Control': 'private, max-age=600' });
    if (len) res.set('Content-Length', String(len));
    const tmp = path.join(dir, id + '.part');
    const out = fs.createWriteStream(tmp);
    let clientGone = false, written = 0, ok = true;
    res.on('close', () => { clientGone = true; });
    try {
      for await (const chunk of Readable.fromWeb(up.body)) {
        written += chunk.length;
        if (!out.write(chunk)) await waitDrain(out);
        if (!clientGone && !res.write(chunk)) await waitDrain(res);
      }
    } catch { ok = false; }
    if (!clientGone) res.end();
    await new Promise(r => out.end(r));
    if (ok) await finalize(id, tmp, type, written, len); else await fsp.rm(tmp, { force: true });
  }

  return async function handler(req, res) {
    const id = req.params.id;
    if (!ID_RE.test(id)) return res.status(400).json({ error: 'bad_id' });

    // בדיקת אישור בצד השרת, בכל בקשה: מי שלא ברשימה המאושרת לא מקבל שמע
    if (!(await access.isApproved(req.user.email))) return res.status(403).json(NOT_APPROVED);
    if (req.method === 'HEAD') return res.status(200).set('Accept-Ranges', 'bytes').end();

    // 1. כבר במטמון: express מטפל בכל הסוגים של Range בעצמו
    const hit = await cached(id);
    if (hit) {
      const now = new Date(); fsp.utimes(hit.file, now, now).catch(() => {});
      return res.sendFile(hit.file, { headers: { 'Content-Type': hit.type || 'audio/mpeg', 'Cache-Control': 'private, max-age=600' }, acceptRanges: true, dotfiles: 'allow' });
    }

    const range = req.headers.range;
    const open = !range || /^bytes=0-$/.test(range);
    const ctrl = new AbortController();
    res.on('close', () => ctrl.abort());

    let up;
    try {
      up = await driveFetch(id, { signal: ctrl.signal, headers: open ? {} : { Range: range } });
    } catch { return res.status(502).json({ error: 'upstream_failed' }); }
    if (!up.ok) return res.status(up.status === 404 ? 404 : 502).json({ error: 'upstream_' + up.status });
    const type = up.headers.get('content-type') || '';
    if (!OK_TYPE.test(type)) { ctrl.abort(); return res.status(403).json({ error: 'forbidden_type' }); }

    // 2. בקשה מלאה ואף אחד לא מוריד את השיר כרגע: מזרימים ושומרים
    if (open && up.status === 200 && cfg.CACHE_MAX_BYTES > 0 && !inflight.has(id)) {
      inflight.add(id);
      try { return await teeAndCache(res, id, up, type); } finally { inflight.delete(id); }
    }

    // 3. קטע מהאמצע (גלילה) או שהורדה כבר רצה: מעבירים ישירות מהדרייב, ובמקביל ממלאים את המטמון לפעם הבאה
    res.status(up.status);
    res.set({ 'Content-Type': type, 'Accept-Ranges': 'bytes', 'Cache-Control': 'private, max-age=600' });
    for (const h of ['content-length', 'content-range']) { const v = up.headers.get(h); if (v) res.set(h, v); }
    if (!open) backgroundFill(id);
    Readable.fromWeb(up.body).on('error', () => res.destroy()).pipe(res);
  };
}
