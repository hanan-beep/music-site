// app/albums/AlbumsClient.tsx
'use client';
import Link from 'next/link';
import { useState, useMemo } from 'react';
import { AlbumIcon, MicIcon, SearchIcon } from '@/app/Icons';

export default function AlbumsClient({ albums }: { albums: any[] }) {
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState<'alpha-asc' | 'alpha-desc'>('alpha-asc');

  const filtered = useMemo(() => {
    let list = albums.filter(a =>
      a.name.toLowerCase().includes(search.toLowerCase()) ||
      a.artistName.toLowerCase().includes(search.toLowerCase())
    );
    return [...list].sort((a, b) =>
      sort === 'alpha-asc' ? a.name.localeCompare(b.name, 'he') : b.name.localeCompare(a.name, 'he')
    );
  }, [albums, search, sort]);

  return (
    <main className="min-h-screen bg-gradient-to-br from-[#ffecd2] via-[#fcb69f] to-[#ffd1a9] text-gray-800" dir="rtl">
      <header className="bg-gradient-to-r from-[#FF512F] to-[#DD2476] p-6 text-center shadow-2xl">
        <Link href="/" className="text-white text-sm mb-2 block">→ חזרה לדף הבית</Link>
        <h1 className="text-3xl font-black text-white flex items-center justify-center gap-3">
          <AlbumIcon size={32} color="white" /> אלבומים
        </h1>
      </header>

      <div className="px-6 pt-6 pb-2 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <input type="text" placeholder="חיפוש אלבום או זמר..." value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full rounded-2xl pr-12 pl-4 py-3 border-2 border-[#DD2476]/30 bg-white/80 text-gray-800 font-bold placeholder-gray-400 focus:outline-none focus:border-[#DD2476] shadow" />
          <div className="absolute right-4 top-1/2 -translate-y-1/2">
            <SearchIcon size={20} color="#DD2476" />
          </div>
        </div>
        <select value={sort} onChange={e => setSort(e.target.value as any)}
          className="rounded-2xl px-4 py-3 border-2 border-[#DD2476]/30 bg-white/80 text-gray-800 font-bold focus:outline-none focus:border-[#DD2476] shadow">
          <option value="alpha-asc">א → ת</option>
          <option value="alpha-desc">ת → א</option>
        </select>
      </div>

      <section className="grid grid-cols-2 md:grid-cols-4 gap-6 p-6">
        {filtered.map((album: any) => (
          <Link key={album.id}
            href={`/album/${album.id}?name=${encodeURIComponent(album.name)}`}
            className="bg-[#ffe8cc] rounded-3xl p-5 text-center hover:scale-105 transition-transform cursor-pointer shadow-md block group">
            <div className="flex justify-center mb-2 group-hover:scale-110 transition-transform">
              <AlbumIcon size={44} color="#54A0FF" />
            </div>
            <h3 className="font-bold text-[#DD2476] leading-tight">{album.name}</h3>
            <p className="text-gray-500 text-sm mt-1 flex items-center justify-center gap-1">
              <MicIcon size={12} color="#999" />
              {album.artistName}
            </p>
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
