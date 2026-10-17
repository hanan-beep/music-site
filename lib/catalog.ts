// lib/catalog.ts — קריאת הקטלוג מ-Supabase (שרת בלבד)
import { createClient } from '@supabase/supabase-js';

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

export async function getArtists() {
  return (await all('artists', 'id,name,image_id', 'name')).map(a => ({ id: a.id, name: a.name, imageId: a.image_id }));
}
export async function getAlbums() {
  return (await all('albums', 'id,name,artist_name,cover_id', 'name'))
    .map(a => ({ id: a.id, name: a.name, artistName: a.artist_name, coverId: a.cover_id }));
}
export async function getAllSongs() {
  return (await all('songs', 'id,name,artist_id,artist_name,album_name,created_at', 'name'))
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

export async function getRecentSongs(limit = 12) {
  const db = catalogDb();
  if (!db) return [];
  try {
    const { data } = await db.from('songs').select('id,name,artist_name,album_name,created_at')
      .order('created_at', { ascending: false, nullsFirst: false }).limit(limit);
    return (data || []).map((s: any) => ({ id: s.id, name: s.name, artistName: s.artist_name as string, albumName: s.album_name as string, createdAt: s.created_at as string | null }));
  } catch { return []; }
}
