'use client';
import Link from 'next/link';
import { usePlayer } from '@/app/PlayerContext';
import { PlayIcon } from '@/app/Icons';

export default function SharePlay({ song }: { song: { id: string; name: string; artistName?: string; albumName?: string } }) {
  const { play } = usePlayer();
  const sub = [song.artistName, song.albumName].filter(Boolean).join(' • ');
  return (
    <main dir="rtl" className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-[#FF512F] via-[#DD2476] to-[#7B2FF7] px-6 pb-32 text-center text-white">
      <div className="disc" style={{ width: 200, height: 200, padding: 8, boxShadow: '0 30px 70px -15px rgba(0,0,0,.4)' }}><img src="/logo.png" alt="" /></div>
      <h1 className="mt-8 max-w-md text-3xl font-extrabold leading-snug">{song.name.replace(/\.[^/.]+$/, '')}</h1>
      {sub && <p className="mt-2 text-white/80">{sub}</p>}
      <button onClick={() => play([song], 0)}
        className="mt-8 inline-flex items-center gap-2 rounded-full bg-white px-8 py-4 font-display text-lg font-extrabold text-[#DD2476] shadow-xl transition-transform hover:scale-105">
        <PlayIcon size={18} color="#DD2476" /> נגן
      </button>
      <Link href="/" className="mt-6 text-sm text-white/85 underline">לכל השירים באתר</Link>
    </main>
  );
}
