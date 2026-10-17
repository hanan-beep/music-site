'use client';
import { usePlayer } from './PlayerContext';
import { PlayIcon } from './Icons';

type S = { id: string; name: string; artistName?: string; albumName?: string; coverId?: string };

export default function PlayAllButton({ songs }: { songs: S[] }) {
  const { play } = usePlayer();
  if (!songs.length) return null;
  const shuffled = () => {
    const a = [...songs];
    for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
    return a;
  };
  return (
    <>
      <button onClick={() => play(songs, 0)}
        className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 font-display font-extrabold text-[#DD2476] shadow-xl transition-transform hover:scale-105">
        <PlayIcon size={16} color="#DD2476" /> נגן הכל
      </button>
      <button onClick={() => play(shuffled(), 0)}
        className="inline-flex items-center gap-2 rounded-full bg-white/15 px-6 py-3 font-display font-extrabold text-white ring-1 ring-white/40 backdrop-blur transition-transform hover:scale-105">
        ערבוב
      </button>
    </>
  );
}
