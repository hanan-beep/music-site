import { google } from 'googleapis';
export const dynamic = 'force-dynamic';
export const preferredRegion = 'fra1';

const auth = new google.auth.GoogleAuth({
  credentials: {
    client_email: process.env.GOOGLE_CLIENT_EMAIL,
    private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  },
  scopes: ['https://www.googleapis.com/auth/drive.readonly'],
});

const miss = () => new Response('no cover', { status: 404, headers: { 'Cache-Control': 'public, max-age=3600, s-maxage=86400' } });
const syncsafe = (b: Uint8Array, o: number) => (b[o] << 21) | (b[o + 1] << 14) | (b[o + 2] << 7) | b[o + 3];
const be32 = (b: Uint8Array, o: number) => ((b[o] << 24) | (b[o + 1] << 16) | (b[o + 2] << 8) | b[o + 3]) >>> 0;

async function range(id: string, token: string, from: number, to: number) {
  const r = await fetch(`https://www.googleapis.com/drive/v3/files/${id}?alt=media&supportsAllDrives=true`, {
    headers: { Authorization: token, Range: `bytes=${from}-${to}` },
  });
  return r.ok ? new Uint8Array(await r.arrayBuffer()) : null;
}

// עטיפת האלבום שמוטמעת בתוך קובץ ה-MP3 (תגית ID3, מסגרת APIC). אם אין — 404.
export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!/^[\w-]{10,}$/.test(id)) return new Response('bad id', { status: 400 });
  const token = `Bearer ${await auth.getAccessToken()}`;

  const head = await range(id, token, 0, 9);
  if (!head || head.length < 10 || String.fromCharCode(head[0], head[1], head[2]) !== 'ID3') return miss();
  const ver = head[3];
  if (ver < 3) return miss();
  const size = syncsafe(head, 6);
  if (size > 8_000_000) return miss();
  const tag = await range(id, token, 0, size + 9);
  if (!tag) return miss();

  let p = 10;
  if (head[5] & 0x40) p += ver === 4 ? syncsafe(tag, 10) : 4 + be32(tag, 10);
  while (p + 10 <= tag.length) {
    const fid = String.fromCharCode(tag[p], tag[p + 1], tag[p + 2], tag[p + 3]);
    if (!/^[A-Z0-9]{4}$/.test(fid)) break;
    const fs = ver === 4 ? syncsafe(tag, p + 4) : be32(tag, p + 4);
    if (fs <= 0 || p + 10 + fs > tag.length) break;
    if (fid === 'APIC') {
      const f = tag.subarray(p + 10, p + 10 + fs);
      const enc = f[0];
      let i = 1;
      while (i < f.length && f[i] !== 0) i++;
      i += 2; // סוף ה-mime + סוג התמונה
      if (enc === 1 || enc === 2) { while (i + 1 < f.length && !(f[i] === 0 && f[i + 1] === 0)) i += 2; i += 2; }
      else { while (i < f.length && f[i] !== 0) i++; i += 1; }
      const img = f.slice(i);
      if (img.length < 100) return miss();
      const type = img[0] === 0x89 && img[1] === 0x50 ? 'image/png' : 'image/jpeg';
      return new Response(img.buffer as ArrayBuffer, {
        headers: { 'Content-Type': type, 'Cache-Control': 'public, max-age=86400, s-maxage=604800' },
      });
    }
    p += 10 + fs;
  }
  return miss();
}
