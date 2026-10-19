// app/s/[id]/page.tsx — דף שיר משותף (קישור מוואטסאפ וכו'): מוצג בכרטיס יפה עם כפתור נגן
import type { Metadata } from 'next';
import { getSongById } from '@/lib/catalog';
import SharePlay from './SharePlay';

const clean = (n: string) => n.replace(/\.[^/.]+$/, '');

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const song = await getSongById((await params).id);
  const title = song ? clean(song.name) : 'יאללה שירים';
  const desc = (song && [song.artistName, song.albumName].filter(Boolean).join(' • ')) || 'הארכיון המוזיקלי החרדי הגדול ביותר';
  return {
    metadataBase: new URL('https://music-site-flame.vercel.app'),
    title: `${title} | יאללה שירים`,
    description: desc,
    openGraph: { title, description: desc, images: ['/icon-maskable-512.png'], type: 'website', locale: 'he_IL' },
  };
}

export default async function SharedSong({ params }: { params: Promise<{ id: string }> }) {
  const id = (await params).id;
  const song = await getSongById(id);
  return <SharePlay song={song ?? { id, name: 'שיר מיאללה שירים', artistName: '', albumName: '' }} />;
}
