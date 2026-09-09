// app/artists/page.tsx — SERVER COMPONENT
import ArtistsClient from './ArtistsClient';

const IMAGE_MIME = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/jpg'];

async function getArtists() {
  const BASE = 'https://music-site-flame.vercel.app/api/drive';
  const res = await fetch(BASE, { next: { revalidate: 3600 } });
  const artists = await res.json();

  // שולף תמונה לכל זמר במקביל
  const artistsWithImages = await Promise.all(
    artists.map(async (artist: any) => {
      try {
        const res = await fetch(`${BASE}?folderId=${artist.id}`, { next: { revalidate: 3600 } });
        const contents = await res.json();
        const image = contents.find((f: any) => IMAGE_MIME.includes(f.mimeType));
        return { ...artist, imageId: image?.id || null };
      } catch {
        return { ...artist, imageId: null };
      }
    })
  );

  return artistsWithImages;
}

export default async function Artists() {
  const artists = await getArtists();
  return <ArtistsClient artists={artists} />;
}
