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
  return (await all('songs', 'id,name,artist_name,album_name,created_at', 'name'))
    .map(s => ({ id: s.id, name: s.name, artistName: s.artist_name, albumName: s.album_name, createdAt: s.created_at }));
}
