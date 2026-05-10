// app/artists/page.tsx  — SERVER COMPONENT (מהיר)
import ArtistsClient from './ArtistsClient';

async function getArtists() {
  const res = await fetch('https://music-site-flame.vercel.app/api/drive', {
    next: { revalidate: 3600 }, // cache שעה
  });
  return res.json();
}

export default async function Artists() {
  const artists = await getArtists();
  return <ArtistsClient artists={artists} />;
}
