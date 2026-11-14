// app/albums/page.tsx — SERVER COMPONENT
import AlbumsClient from './AlbumsClient';
import { getAlbums } from '@/lib/catalog';
import { listArtistFolders, listFolder } from '@/lib/drive';

export const dynamic = 'force-dynamic';

async function getAllAlbums() {
  const artists = await listArtistFolders();
  // שולף אלבומים של כל זמר במקביל
  const results = await Promise.all(
    artists.map(async artist => {
      const contents = await listFolder(artist.id);
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
