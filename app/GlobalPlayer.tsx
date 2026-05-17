// app/GlobalPlayer.tsx
'use client';
import { usePlayer } from './PlayerContext';

export default function GlobalPlayer() {
  const { songs, currentIndex, playIndex, close } = usePlayer();
  const current = currentIndex >= 0 ? songs[currentIndex] : null;
  if (!current) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 w-full shadow-2xl" style={{ zIndex: 200 }}>
      <div className="bg-gradient-to-r from-[#FF512F] to-[#DD2476] px-4 py-3 flex items-center gap-3 w-full">
        <button onClick={() => playIndex(currentIndex - 1)} disabled={currentIndex <= 0}
          className="flex-shrink-0 flex items-center gap-1 bg-white/20 hover:bg-white/30 disabled:opacity-30 text-white font-black px-3 py-2 rounded-xl text-sm">
          ⏮ <span className="hidden sm:inline">קודם</span>
        </button>

        <div className="flex-1 text-center min-w-0">
          <p className="font-black text-white truncate text-sm">
            {current.name.replace(/\.[^/.]+$/, '')}
          </p>
          <p className="text-white/60 text-xs">{currentIndex + 1} / {songs.length}</p>
        </div>

        <button onClick={() => playIndex(currentIndex + 1)} disabled={currentIndex >= songs.length - 1}
          className="flex-shrink-0 flex items-center gap-1 bg-white text-[#DD2476] font-black px-3 py-2 rounded-xl hover:bg-pink-50 disabled:opacity-30 shadow text-sm">
          <span className="hidden sm:inline">הבא</span> ⏭
        </button>

        <button onClick={close} className="flex-shrink-0 text-white hover:opacity-70 text-xl font-bold">✕</button>
      </div>
      <div className="w-full bg-black" style={{ height: 80 }}>
        <iframe
          key={current.id}
          src={`https://drive.google.com/file/d/${current.id}/preview`}
          style={{ width: '100%', height: '80px', display: 'block', border: 'none' }}
          allow="autoplay"
        />
      </div>
    </div>
  );
}
