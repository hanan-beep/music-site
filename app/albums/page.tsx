// app/albums/page.tsx — SERVER COMPONENT
import AlbumsClient from './AlbumsClient';
import { getAlbums } from '@/lib/catalog';

export const revalidate = 300;

async function getAllAlbums() {
  const BASE = 'https://music-site-flame.vercel.app/api/drive';

  // שולף זמרים
  const artistsRes = await fetch(BASE, { next: { revalidate: 3600 } });
  const artists = await artistsRes.json();

  // שולף אלבומים של כל זמר במקביל
  const results = await Promise.all(
    artists.map(async (artist: any) => {
      const res = await fetch(`${BASE}?folderId=${artist.id}`, {
        next: { revalidate: 3600 },
      });
      const contents = await res.json();
      return contents
        .filter((f: any) => f.mimeType === 'application/vnd.google-apps.folder')
        .map((f: any) => ({ ...f, artistName: artist.name }));
    })
  );

  return results.flat();
}

export default async function Albums() {
  const cat = await getAlbums();
  if (cat.length) return <AlbumsClient albums={cat} />;
  const albums = await getAllAlbums();
  return <AlbumsClient albums={albums} />;
}
