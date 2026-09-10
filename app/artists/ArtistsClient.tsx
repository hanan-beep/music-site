// app/artists/ArtistsClient.tsx
'use client';
import Link from 'next/link';
import { useState, useMemo } from 'react';
import { MicIcon, SearchIcon } from '@/app/Icons';

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
        <Link href="/" className="text-white text-sm mb-2 block">→ חזרה לדף הבית</Link>
        <h1 className="text-3xl font-black text-white flex items-center justify-center gap-3">
          <MicIcon size={32} color="white" /> זמרים
        </h1>
      </header>

      <div className="px-6 pt-6 pb-2 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <input type="text" placeholder="חיפוש זמר..." value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full rounded-2xl pr-12 pl-4 py-3 border-2 border-[#DD2476]/30 bg-white/80 text-gray-800 font-bold placeholder-gray-400 focus:outline-none focus:border-[#DD2476] shadow" />
          <div className="absolute right-4 top-1/2 -translate-y-1/2">
            <SearchIcon size={20} color="#DD2476" />
          </div>
        </div>
        <select value={sort} onChange={e => setSort(e.target.value as any)}
          className="rounded-2xl px-4 py-3 border-2 border-[#DD2476]/30 bg-white/80 text-gray-800 font-bold focus:outline-none focus:border-[#DD2476] shadow">
          <option value="alpha-asc">א ← ת</option>
          <option value="alpha-desc">ת ← א</option>
        </select>
      </div>

      <section className="grid grid-cols-2 md:grid-cols-4 gap-4 p-6">
        {filtered.map((artist: any) => (
          <Link key={artist.id} href={`/artist/${encodeURIComponent(artist.name)}`}
            className="bg-[#ffe8cc] rounded-2xl overflow-hidden shadow-md hover:scale-105 transition-transform block group">
            
            {/* תמונה מרובעת 1:1 */}
            <div className="w-full aspect-square overflow-hidden bg-gradient-to-br from-[#FF512F]/20 to-[#DD2476]/20">
              {artist.imageId ? (
                <img
                  src={`https://drive.google.com/thumbnail?id=${artist.imageId}&sz=w400`}
                  alt={artist.name}
                  className="w-full h-full object-cover object-center group-hover:scale-110 transition-transform duration-300"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <MicIcon size={56} color="#DD2476" />
                </div>
              )}
            </div>

            {/* שם */}
            <div className="px-3 py-2 text-center">
              <h3 className="font-black text-[#DD2476] text-sm leading-tight truncate">{artist.name}</h3>
            </div>
          </Link>
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
