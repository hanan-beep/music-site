// lib/catalog.ts — קריאת הקטלוג מ-Supabase (שרת בלבד)
import { createClient } from '@supabase/supabase-js';

// זיכרון קצר טווח: שרת Node שרץ ברציפות לא צריך לשאול את Supabase שוב על אותו דבר בכל כניסה.
// תוצאות ריקות לא נשמרות, כך שכשל זמני לא "נתקע".
const memoCache = new Map<string, { t: number; v: any }>();
async function memo<T>(key: string, ttlMs: number, fn: () => Promise<T>): Promise<T> {
  const hit = memoCache.get(key);
  if (hit && Date.now() - hit.t < ttlMs) return hit.v as T;
  const v = await fn();
  if (Array.isArray(v) ? v.length : v) memoCache.set(key, { t: Date.now(), v });
  return v;
}

export function catalogDb() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  return url && key ? createClient(url, key, { auth: { persistSession: false } }) : null;
}

async function all(table: string, cols: string, order: string): Promise<any[]> {
  const db = catalogDb();
  if (!db) return [];
  const rows: any[] = [];
  try {
    for (let from = 0; ; from += 1000) {
      const { data, error } = await db.from(table).select(cols).order(order).range(from, from + 999);
      if (error || !data) return [];
      rows.push(...data);
      if (data.length < 1000) break;
    }
  } catch { return []; }
  return rows;
}

async function getArtistsRaw() {
  return (await all('artists', 'id,name,image_id', 'name')).map(a => ({ id: a.id, name: a.name, imageId: a.image_id }));
}
async function getAlbumsRaw() {
  return (await all('albums', 'id,name,artist_name,cover_id', 'name'))
    .map(a => ({ id: a.id, name: a.name, artistName: a.artist_name, coverId: a.cover_id }));
}
async function getAllSongsRaw() {
  return (await all('songs', 'id,name,artist_id,artist_name,album_name,created_at', 'name'))
    .filter(s => s.artist_id !== 'monthly-album')
    .map(s => ({ id: s.id, name: s.name, artistId: s.artist_id, artistName: s.artist_name, albumName: s.album_name, createdAt: s.created_at }));
}

export async function getArtistCatalog(artistId: string) {
  const empty = { albums: [] as { id: string; name: string; coverId?: string }[], songs: [] as any[] };
  const db = catalogDb();
  if (!db) return empty;
  try {
    const [al, so] = await Promise.all([
      db.from('albums').select('id,name,cover_id').eq('artist_id', artistId),
      db.from('songs').select('id,name,artist_name,album_id,album_name').eq('artist_id', artistId).order('album_name').order('name').range(0, 999),
    ]);
    const covers = new Map<string, string | null>((al.data || []).map((a: any): [string, string | null] => [a.id, a.cover_id]));
    return {
      albums: (al.data || []).map((a: any) => ({ id: a.id, name: a.name, coverId: a.cover_id || undefined })),
      songs: (so.data || []).map((x: any) => ({
        id: x.id, name: x.name, artistName: x.artist_name, albumName: x.album_name,
        coverId: (x.album_id && covers.get(x.album_id)) || undefined,
      })),
    };
  } catch { return empty; }
}

async function getRecentSongsRaw(limit = 12) {
  const db = catalogDb();
  if (!db) return [];
  try {
    // רק מתיקיית החודשים (שירים ואלבומים שלמים), לא משירי הזמרים
    const { data } = await db.from('songs').select('id,name,artist_id,artist_name,album_name,created_at')
      .in('artist_id', ['monthly', 'monthly-album'])
      .order('created_at', { ascending: false, nullsFirst: false }).limit(limit);
    return (data || []).map((s: any) => ({
      id: s.id as string, name: s.name as string, artistId: s.artist_id as string,
      artistName: s.artist_name as string, albumName: s.album_name as string, createdAt: s.created_at as string | null,
    }));
  } catch { return []; }
}

export async function getSongById(id: string) {
  const db = catalogDb();
  if (!db) return null;
  try {
    const { data } = await db.from('songs').select('id,name,artist_name,album_name').eq('id', id).maybeSingle();
    return data ? { id: data.id as string, name: data.name as string, artistName: data.artist_name as string, albumName: data.album_name as string } : null;
  } catch { return null; }
}

export async function getRandomSongs(n = 40) {
  const db = catalogDb();
  if (!db) return [];
  try {
    const { count } = await db.from('songs').select('id', { count: 'exact', head: true }).neq('artist_id', 'monthly-album');
    const total = count || 0;
    if (!total) return [];
    const from = Math.floor(Math.random() * Math.max(1, total - n));
    const { data } = await db.from('songs').select('id,name,artist_name,album_name').neq('artist_id', 'monthly-album').order('id').range(from, from + n - 1);
    return (data || []).map((s: any) => ({ id: s.id as string, name: s.name as string, artistName: s.artist_name as string, albumName: s.album_name as string }))
      .sort(() => Math.random() - 0.5);
  } catch { return []; }
}

async function getTopSongsRaw(limit = 12, days = 30) {
  const db = catalogDb();
  if (!db) return [];
  try {
    const { data } = await db.rpc('top_songs', { days, lim: limit });
    return ((data as any[]) || []).map(s => ({ id: s.id as string, name: s.name as string, artistName: s.artist_name as string, albumName: s.album_name as string }));
  } catch { return []; }
}

export const getArtists = () => memo('getArtists', 300000, () => getArtistsRaw());

export const getAlbums = () => memo('getAlbums', 300000, () => getAlbumsRaw());

export const getAllSongs = () => memo('getAllSongs', 300000, () => getAllSongsRaw());

export const getRecentSongs = (limit = 12) => memo('getRecentSongs' + ':' + [limit].join(','), 120000, () => getRecentSongsRaw(limit));

export const getTopSongs = (limit = 12, days = 30) => memo('getTopSongs' + ':' + [limit, days].join(','), 120000, () => getTopSongsRaw(limit, days));
