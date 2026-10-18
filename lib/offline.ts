// lib/offline.ts — שמירת שירים במכשיר (Cache Storage) להאזנה ללא אינטרנט
const CACHE = 'yallah-songs';
const KEY = 'yallah-offline';

export type OfflineMeta = { id: string; name: string; artistName?: string; albumName?: string };

const read = (): Record<string, OfflineMeta> => {
  try { return JSON.parse(localStorage.getItem(KEY) || '{}'); } catch { return {}; }
};
const write = (m: Record<string, OfflineMeta>) => {
  localStorage.setItem(KEY, JSON.stringify(m));
  window.dispatchEvent(new Event('offline-changed'));
};

export const getSaved = () => Object.values(read());
export const isSaved = (id: string) => !!read()[id];

export async function saveSong(meta: OfflineMeta) {
  const res = await fetch(`/api/stream/${meta.id}`);
  if (!res.ok) throw new Error('download failed');
  const cache = await caches.open(CACHE);
  await cache.put(`/api/stream/${meta.id}`, res);
  write({ ...read(), [meta.id]: { id: meta.id, name: meta.name, artistName: meta.artistName, albumName: meta.albumName } });
  navigator.storage?.persist?.();
}

export async function removeSong(id: string) {
  await (await caches.open(CACHE)).delete(`/api/stream/${id}`);
  const m = read(); delete m[id]; write(m);
}
