// app/songs/SongsClient.tsx
'use client';
import { useState, useMemo } from 'react';

type Song = {
  id: string;
  name: string;
  artistName: string;
  albumName: string;
  isNew: boolean;
  driveOrder: number;
};

export default function SongsClient({
  regularSongs,
  extraSongs,
}: {
  regularSongs: Song[];
  extraSongs: Song[];
}) {
  const [current, setCurrent] = useState<Song | null>(null);
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState<'alpha-asc' | 'alpha-desc' | 'newest'>('newest');

  const filtered = useMemo(() => {
    const query = search.toLowerCase();

    const match = (s: Song) =>
      s.name.replace(/\.[^/.]+$/, '').toLowerCase().includes(query) ||
      s.artistName.toLowerCase().includes(query);

    if (sort === 'newest') {
      // שירים חדשים קודם (לפי סדר דרייב), אחר כך שאר השירים א-ב
      const newFiltered = extraSongs.filter(match).sort((a, b) => a.driveOrder - b.driveOrder);
      const regularFiltered = regularSongs.filter(match).sort((a, b) =>
        a.name.replace(/\.[^/.]+$/, '').localeCompare(b.name.replace(/\.[^/.]+$/, ''), 'he')
      );
      return [...newFiltered, ...regularFiltered];
    }

    const all = [...extraSongs, ...regularSongs].filter(match);
    return [...all].sort((a, b) => {
      const na = a.name.replace(/\.[^/.]+$/, '');
      const nb = b.name.replace(/\.[^/.]+$/, '');
      return sort === 'alpha-asc' ? na.localeCompare(nb, 'he') : nb.localeCompare(na, 'he');
    });
  }, [regularSongs, extraSongs, search, sort]);

  return (
    <main className="min-h-screen bg-gradient-to-br from-[#ffecd2] via-[#fcb69f] to-[#ffd1a9] pb-32" dir="rtl">
      <header className="bg-gradient-to-r from-[#FF512F] to-[#DD2476] p-6 text-center shadow-2xl">
        <a href="/" className="text-white text-sm mb-2 block">→ חזרה לדף הבית</a>
        <h1 className="text-3xl font-black text-white">🎵 שירים</h1>
      </header>

      <div className="px-6 pt-6 pb-2 flex flex-col sm:flex-row gap-3">
        <input
          type="text"
          placeholder="🔍 חיפוש שיר או זמר..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="flex-1 rounded-2xl px-4 py-3 border-2 border-[#DD2476]/30 bg-white/80 text-gray-800 font-bold placeholder-gray-400 focus:outline-none focus:border-[#DD2476] shadow"
        />
        <select
          value={sort}
          onChange={e => setSort(e.target.value as any)}
          className="rounded-2xl px-4 py-3 border-2 border-[#DD2476]/30 bg-white/80 text-gray-800 font-bold focus:outline-none focus:border-[#DD2476] shadow"
        >
          <option value="newest">🆕 חדשים קודם</option>
          <option value="alpha-asc">א ← ת</option>
          <option value="alpha-desc">ת ← א</option>
        </select>
      </div>

      <section className="flex flex-col gap-3 p-6">
        <p className="text-gray-500 text-sm mb-1">{filtered.length} שירים</p>
        {filtered.map((song, i) => (
          <div key={`${song.id}-${i}`}
            className="bg-[#ffe8cc] rounded-2xl p-4 flex items-center justify-between shadow-md gap-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                {song.isNew && (
                  <span className="text-xs bg-[#DD2476] text-white px-2 py-0.5 rounded-full font-bold flex-shrink-0">חדש</span>
                )}
                <h3 className="font-bold text-gray-800 truncate">
                  {song.name.replace(/\.[^/.]+$/, '')}
                </h3>
              </div>
              {song.artistName && (
                <p className="text-sm text-[#DD2476] font-semibold truncate">
                  🎤 {song.artistName}{song.albumName ? ` · ${song.albumName}` : ''}
                </p>
              )}
            </div>
            <div className="flex gap-2 flex-shrink-0">
              <button
                onClick={() => setCurrent(song)}
                className="bg-[#DD2476] text-white px-4 py-2 rounded-full text-sm font-bold hover:opacity-80">
                ▶️ האזן
              </button>
              <a
                href={`https://drive.google.com/uc?export=download&id=${song.id}`}
                className="bg-[#FF512F] text-white px-4 py-2 rounded-full text-sm font-bold hover:opacity-80">
                ⬇️ הורד
              </a>
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <p className="text-center text-gray-500 py-10">לא נמצאו שירים</p>
        )}
      </section>

      {current && (
        <div className="fixed bottom-0 left-0 right-0 w-full shadow-2xl" style={{ zIndex: 100 }}>
          <div className="bg-gradient-to-r from-[#FF512F] to-[#DD2476] px-6 py-2 flex items-center justify-between w-full">
            <p className="font-black text-white text-lg truncate">
              🎵 {current.name.replace(/\.[^/.]+$/, '')}
            </p>
            <button onClick={() => setCurrent(null)}
              className="text-white hover:opacity-70 text-2xl font-bold ml-4 flex-shrink-0">
              ✕
            </button>
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
      )}

      <footer className="bg-[#ffe8cc] text-center py-6 mt-8">
        <p className="text-[#DD2476] font-bold">✨ ♩ ♪ ♫ ♬ יאללה שירים 💪 ♬ ♫ ♪ ♩ ✨</p>
        <p className="text-gray-500 text-sm mt-2">© כל הזכויות שמורות | By Yael</p>
      </footer>
    </main>
  );
}
