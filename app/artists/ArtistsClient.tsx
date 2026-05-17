// app/artists/ArtistsClient.tsx
'use client';
import { useState, useMemo } from 'react';

export default function ArtistsClient({ artists }: { artists: any[] }) {
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState<'alpha-asc' | 'alpha-desc'>('alpha-asc');

  const filtered = useMemo(() => {
    let list = artists.filter(a => a.name.toLowerCase().includes(search.toLowerCase()));
    return [...list].sort((a, b) =>
      sort === 'alpha-asc' ? a.name.localeCompare(b.name, 'he') : b.name.localeCompare(a.name, 'he')
    );
  }, [artists, search, sort]);

  return (
    <main className="min-h-screen bg-gradient-to-br from-[#ffecd2] via-[#fcb69f] to-[#ffd1a9] text-gray-800" dir="rtl">
      <header className="bg-gradient-to-r from-[#FF512F] to-[#DD2476] p-6 text-center shadow-2xl">
        <a href="/" className="text-white text-sm mb-2 block">→ חזרה לדף הבית</a>
        <h1 className="text-3xl font-black text-white">🎤 זמרים</h1>
      </header>

      <div className="px-6 pt-6 pb-2 flex flex-col sm:flex-row gap-3">
        <input type="text" placeholder="🔍 חיפוש זמר..." value={search}
          onChange={e => setSearch(e.target.value)}
          className="flex-1 rounded-2xl px-4 py-3 border-2 border-[#DD2476]/30 bg-white/80 text-gray-800 font-bold placeholder-gray-400 focus:outline-none focus:border-[#DD2476] shadow" />
        <select value={sort} onChange={e => setSort(e.target.value as any)}
          className="rounded-2xl px-4 py-3 border-2 border-[#DD2476]/30 bg-white/80 text-gray-800 font-bold focus:outline-none focus:border-[#DD2476] shadow">
          <option value="alpha-asc">א ← ת</option>
          <option value="alpha-desc">ת ← א</option>
        </select>
      </div>

      <section className="grid grid-cols-2 md:grid-cols-4 gap-6 p-6">
        {filtered.map((artist: any) => (
          <a key={artist.id} href={`/artist/${encodeURIComponent(artist.name)}`}
            className="bg-[#ffe8cc] rounded-3xl p-6 text-center hover:scale-105 transition-transform cursor-pointer shadow-md block">
            <div className="text-5xl mb-3">🎤</div>
            <h3 className="font-bold text-lg text-[#DD2476]">{artist.name}</h3>
          </a>
        ))}
        {filtered.length === 0 && (
          <p className="col-span-4 text-center text-gray-500 py-10">לא נמצאו תוצאות</p>
        )}
      </section>

      <footer className="bg-[#ffe8cc] text-center py-6 mt-8">
        <p className="text-[#DD2476] font-bold">✨ ♩ ♪ ♫ ♬ יאללה שירים 💪 ♬ ♫ ♪ ♩ ✨</p>
        <p className="text-gray-500 text-sm mt-2">© כל הזכויות שמורות | By Yael</p>
      </footer>
    </main>
  );
}
