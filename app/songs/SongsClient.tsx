// app/songs/SongsClient.tsx
'use client';
import { useState, useMemo } from 'react';
import { usePlayer } from '@/app/PlayerContext';

type Song = { id: string; name: string; artistName: string; albumName: string; isNew: boolean; driveOrder: number; };

export default function SongsClient({ regularSongs, extraSongs }: { regularSongs: Song[]; extraSongs: Song[]; }) {
  const { play, currentIndex, songs: globalSongs } = usePlayer();
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState<'alpha-asc' | 'alpha-desc' | 'newest'>('newest');

  const filtered = useMemo(() => {
    const query = search.toLowerCase();
    const match = (s: Song) =>
      s.name.replace(/\.[^/.]+$/, '').toLowerCase().includes(query) ||
      s.artistName.toLowerCase().includes(query);

    if (sort === 'newest') {
      return [
        ...extraSongs.filter(match).sort((a, b) => a.driveOrder - b.driveOrder),
        ...regularSongs.filter(match).sort((a, b) =>
          a.name.replace(/\.[^/.]+$/, '').localeCompare(b.name.replace(/\.[^/.]+$/, ''), 'he')
        ),
      ];
    }
    return [...extraSongs, ...regularSongs].filter(match).sort((a, b) => {
      const na = a.name.replace(/\.[^/.]+$/, '');
      const nb = b.name.replace(/\.[^/.]+$/, '');
      return sort === 'alpha-asc' ? na.localeCompare(nb, 'he') : nb.localeCompare(na, 'he');
    });
  }, [regularSongs, extraSongs, search, sort]);

  const isThisPlaylist = globalSongs.length > 0 && filtered.length > 0 && globalSongs[0]?.id === filtered[0]?.id;
  const activeIndex = isThisPlaylist ? currentIndex : -1;

  return (
    <main className="min-h-screen bg-gradient-to-br from-[#ffecd2] via-[#fcb69f] to-[#ffd1a9] pb-48" dir="rtl">
      <header className="bg-gradient-to-r from-[#FF512F] to-[#DD2476] p-6 text-center shadow-2xl">
        <a href="/" className="text-white text-sm mb-2 block">→ חזרה לדף הבית</a>
        <h1 className="text-3xl font-black text-white">🎵 שירים</h1>
      </header>

      <div className="px-6 pt-6 pb-2 flex flex-col sm:flex-row gap-3">
        <input type="text" placeholder="🔍 חיפוש שיר או זמר..." value={search}
          onChange={e => setSearch(e.target.value)}
          className="flex-1 rounded-2xl px-4 py-3 border-2 border-[#DD2476]/30 bg-white/80 text-gray-800 font-bold placeholder-gray-400 focus:outline-none focus:border-[#DD2476] shadow" />
        <select value={sort} onChange={e => setSort(e.target.value as any)}
          className="rounded-2xl px-4 py-3 border-2 border-[#DD2476]/30 bg-white/80 text-gray-800 font-bold focus:outline-none focus:border-[#DD2476] shadow">
          <option value="newest">🆕 חדשים קודם</option>
          <option value="alpha-asc">א ← ת</option>
          <option value="alpha-desc">ת ← א</option>
        </select>
      </div>

      <section className="flex flex-col gap-3 p-6">
        <p className="text-gray-500 text-sm mb-1">{filtered.length} שירים</p>
        {filtered.map((song, idx) => {
          const isActive = activeIndex === idx;
          return (
            <div key={`${song.id}-${idx}`} onClick={() => play(filtered, idx)}
              className={`rounded-2xl p-4 flex items-center justify-between shadow-md gap-3 cursor-pointer transition-all duration-200 ${
                isActive
                  ? 'bg-gradient-to-l from-[#FF512F]/20 to-[#DD2476]/20 border-2 border-[#DD2476] scale-[1.01]'
                  : 'bg-[#ffe8cc] hover:bg-[#ffd9aa] border-2 border-transparent'
              }`}>
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 font-black text-sm ${
                  isActive ? 'bg-[#DD2476] text-white' : 'bg-white/60 text-gray-400'
                }`}>
                  {isActive ? '🎵' : idx + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className={`font-bold truncate ${isActive ? 'text-[#DD2476]' : 'text-gray-800'}`}>
                    {song.name.replace(/\.[^/.]+$/, '')}
                  </h3>
                  {song.artistName && (
                    <p className="text-sm text-[#DD2476]/70 truncate">
                      🎤 {song.artistName}{song.albumName ? ` · ${song.albumName}` : ''}
                    </p>
                  )}
                </div>
              </div>
              <div className="flex gap-2 flex-shrink-0" onClick={e => e.stopPropagation()}>
                {song.isNew && <span className="text-xs bg-[#DD2476] text-white px-2 py-1 rounded-full font-bold">חדש</span>}
                <button onClick={() => play(filtered, idx)}
                  className={`px-4 py-2 rounded-full text-sm font-bold ${isActive ? 'bg-[#DD2476] text-white' : 'bg-[#DD2476]/80 text-white hover:bg-[#DD2476]'}`}>
                  {isActive ? '🎵 מנגן' : '▶️ האזן'}
                </button>
                <a href={`https://drive.google.com/uc?export=download&id=${song.id}`}
                  className="bg-[#FF512F] text-white px-4 py-2 rounded-full text-sm font-bold hover:opacity-80">⬇️</a>
              </div>
            </div>
          );
        })}
        {filtered.length === 0 && <p className="text-center text-gray-500 py-10">לא נמצאו שירים</p>}
      </section>

      <footer className="bg-[#ffe8cc] text-center py-6 mt-8">
        <p className="text-[#DD2476] font-bold">✨ ♩ ♪ ♫ ♬ יאללה שירים 💪 ♬ ♫ ♪ ♩ ✨</p>
        <p className="text-gray-500 text-sm mt-2">© כל הזכויות שמורות | By Yael</p>
      </footer>
    </main>
  );
}
