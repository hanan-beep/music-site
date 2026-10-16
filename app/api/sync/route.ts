// app/api/sync/route.ts — סורק את הדרייב ומעדכן את הקטלוג. רץ אוטומטית פעם ביום (vercel.json).
import { google } from 'googleapis';
import { catalogDb } from '@/lib/catalog';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

const FOLDER = 'application/vnd.google-apps.folder';
const AUDIO = /\.(mp3|m4a|aac|wav|flac|ogg|opus|wma)$/i;
const IMG = (f: any) => String(f.mimeType).startsWith('image/');

const auth = new google.auth.GoogleAuth({
  credentials: {
    client_email: process.env.GOOGLE_CLIENT_EMAIL,
    private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  },
  scopes: ['https://www.googleapis.com/auth/drive.readonly'],
});
const drive = google.drive({ version: 'v3', auth });

async function list(folderId: string) {
  const files: any[] = [];
  let pageToken: string | undefined;
  do {
    const res: any = await drive.files.list({
      q: `'${folderId}' in parents and trashed = false`,
      fields: 'nextPageToken, files(id, name, mimeType, createdTime)',
      pageSize: 1000, pageToken, supportsAllDrives: true, includeItemsFromAllDrives: true,
    });
    files.push(...(res.data.files || []));
    pageToken = res.data.nextPageToken;
  } while (pageToken);
  return files;
}

async function pool<T>(items: T[], n: number, fn: (t: T) => Promise<void>) {
  let i = 0;
  await Promise.all(Array.from({ length: n }, async () => { while (i < items.length) await fn(items[i++]); }));
}

async function save(db: any, table: string, rows: any[], start: string) {
  const uniq = [...new Map(rows.map(r => [r.id, { ...r, synced_at: start }])).values()];
  for (let i = 0; i < uniq.length; i += 500) {
    const { error } = await db.from(table).upsert(uniq.slice(i, i + 500));
    if (error) throw new Error(`${table}: ${error.message}`);
  }
  return uniq.length;
}

export async function GET(req: Request) {
  const secret = process.env.CRON_SECRET;
  const given = req.headers.get('authorization')?.replace('Bearer ', '') ?? new URL(req.url).searchParams.get('key');
  if (!secret || given !== secret) return new Response('unauthorized', { status: 401 });

  const db = catalogDb();
  if (!db) return Response.json({ error: 'חסר SUPABASE_SERVICE_ROLE_KEY' }, { status: 500 });

  try {
    const start = new Date().toISOString();
    const roots = [process.env.GOOGLE_FOLDER_1!, process.env.GOOGLE_FOLDER_2!];
    const top = (await Promise.all(roots.map(list))).flat().filter(f => f.mimeType === FOLDER);
    const seen = new Set<string>();
    const artistFolders = top.filter(f => { const k = f.name.trim().toLowerCase(); return seen.has(k) ? false : (seen.add(k), true); });

    const artists: any[] = [], albums: any[] = [], songs: any[] = [];
    const song = (s: any, a: any, al?: any) => ({
      id: s.id, name: s.name, artist_id: a.id, album_id: al?.id ?? null,
      artist_name: a.name, album_name: al?.name ?? '', created_at: s.createdTime,
    });

    await pool(artistFolders, 10, async a => {
      const items = await list(a.id);
      artists.push({ id: a.id, name: a.name, image_id: items.find(IMG)?.id ?? null });
      items.filter(f => AUDIO.test(f.name)).forEach(s => songs.push(song(s, a)));
      await pool(items.filter(f => f.mimeType === FOLDER), 3, async al => {
        const its = await list(al.id);
        albums.push({ id: al.id, name: al.name, artist_id: a.id, artist_name: a.name, cover_id: its.find(IMG)?.id ?? null });
        its.filter(f => AUDIO.test(f.name)).forEach(s => songs.push(song(s, a, al)));
      });
    });

    if (artists.length === 0) throw new Error('לא נמצאו זמרים בדרייב, לא מוחק כלום');
    const counts = {
      artists: await save(db, 'artists', artists, start),
      albums: await save(db, 'albums', albums, start),
      songs: await save(db, 'songs', songs, start),
    };
    for (const t of ['artists', 'albums', 'songs']) await db.from(t).delete().lt('synced_at', start);
    return Response.json({ ok: true, ...counts });
  } catch (e: any) {
    console.error(e);
    return Response.json({ ok: false, error: e.message }, { status: 500 });
  }
}
