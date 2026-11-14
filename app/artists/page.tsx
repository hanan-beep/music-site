// app/artists/page.tsx — SERVER COMPONENT
import ArtistsClient from './ArtistsClient';
import { getArtists as getCatalogArtists } from '@/lib/catalog';
import { listArtistFolders, listFolder } from '@/lib/drive';

export const dynamic = 'force-dynamic';

const IMAGE_MIME = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/jpg'];

async function getArtists() {
  const artists = await listArtistFolders();
  // שולף תמונה לכל זמר במקביל
  return Promise.all(
    artists.map(async artist => {
      try {
        const image = (await listFolder(artist.id)).find((f: any) => IMAGE_MIME.includes(f.mimeType));
        return { ...artist, imageId: image?.id || null };
      } catch {
        return { ...artist, imageId: null };
      }
    })
  );
}

export default async function Artists() {
  const cat = await getCatalogArtists();
  if (cat.length) return <ArtistsClient artists={cat} />;
  const artists = await getArtists();
  return <ArtistsClient artists={artists} />;
}
