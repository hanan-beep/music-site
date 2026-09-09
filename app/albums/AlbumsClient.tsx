// app/albums/AlbumsClient.tsx
'use client';
import Link from 'next/link';
import { useState, useMemo } from 'react';
import { AlbumIcon, MicIcon, SearchIcon } from '@/app/Icons';
import AlbumFavButton from '@/app/AlbumFavButton';

type ViewMode = 'grid' | 'by-artist';

export default function AlbumsClient({ albums }: { albums: any[] }) {
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState<'alpha-asc' | 'alpha-desc'>('alpha-asc');
  const [view, setView] = useState<ViewMode>('grid');

  const filtered = useMemo(() => {
    let list = albums.filter(a =>
      a.name.toLowerCase().includes(search.toLowerCase()) ||
      a.artistName.toLowerCase().includes(search.toLowerCase())
    );
    return [...list].sort((a, b) =>
      sort === 'alpha-asc' ? a.name.localeCompare(b.name, 'he') : b.name.localeCompare(a.name, 'he')
    );
  }, [albums, search, sort]);

  // קיבוץ לפי זמר
  const byArtist = useMemo(() => {
    const map = new Map<string, any[]>();
    filtered.forEach(album => {
      const artist = album.artistName || 'אחר';
      if (!map.has(artist)) map.set(artist, []);
      map.get(artist)!.push(album);
    });
    return Array.from(map.entries()).sort(([a], [b]) => a.localeCompare(b, 'he'));
  }, [filtered]);

  const AlbumCard = ({ album }: { album: any }) => (
    <div className="relative">
      <Link href={`/album/${album.id}?name=${encodeURIComponent(album.name)}`}
        className="bg-[#ffe8cc] rounded-3xl p-5 text-center hover:scale-105 transition-transform cursor-pointer shadow-md block group">
        <div className="flex justify-center mb-2 group-hover:scale-110 transition-transform">
          <AlbumIcon size={44} color="#54A0FF" />
        </div>
        <h3 className="font-bold text-[#DD2476] leading-tight text-sm">{album.name}</h3>
        {view === 'grid' && (
          <p className="text-gray-500 text-xs mt-1 flex items-center justify-center gap-1">
            <MicIcon size={10} color="#999" />{album.artistName}
          </p>
        )}
      </Link>
      <AlbumFavButton album={{ id: album.id, name: album.name, artistName: album.artistName }} />
    </div>
  );

  return (
    <main className="min-h-screen bg-gradient-to-br from-[#ffecd2] via-[#fcb69f] to-[#ffd1a9] text-gray-800" dir="rtl">
      <header className="bg-gradient-to-r from-[#FF512F] to-[#DD2476] p-6 text-center shadow-2xl">
        <Link href="/" className="text-white text-sm mb-2 block">→ חזרה לדף הבית</Link>
        <h1 className="text-3xl font-black text-white flex items-center justify-center gap-3">
          <AlbumIcon size={32} color="white" /> אלבומים
        </h1>
      </header>

      {/* חיפוש + מיון + תצוגה */}
      <div className="px-6 pt-6 pb-2 flex flex-col gap-3">
        <div className="flex gap-3">
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
            <option value="alpha-asc">א ← ת</option>
            <option value="alpha-desc">ת ← א</option>
          </select>
        </div>

        {/* כפתורי תצוגה */}
        <div className="flex gap-2">
          <button onClick={() => setView('grid')}
            className={`flex-1 py-2 rounded-2xl font-bold text-sm transition-all ${
              view === 'grid'
                ? 'bg-gradient-to-r from-[#FF512F] to-[#DD2476] text-white shadow'
                : 'bg-white/80 text-gray-600 border-2 border-gray-200'
            }`}>
            <AlbumIcon size={16} color={view === 'grid' ? 'white' : '#666'} className="inline ml-1" />
            כל האלבומים
          </button>
          <button onClick={() => setView('by-artist')}
            className={`flex-1 py-2 rounded-2xl font-bold text-sm transition-all ${
              view === 'by-artist'
                ? 'bg-gradient-to-r from-[#FF512F] to-[#DD2476] text-white shadow'
                : 'bg-white/80 text-gray-600 border-2 border-gray-200'
            }`}>
            <MicIcon size={16} color={view === 'by-artist' ? 'white' : '#666'} className="inline ml-1" />
            לפי זמר
          </button>
        </div>
      </div>

      {/* תצוגת גריד רגילה */}
      {view === 'grid' && (
        <section className="grid grid-cols-2 md:grid-cols-4 gap-6 p-6">
          {filtered.map(album => <AlbumCard key={album.id} album={album} />)}
          {filtered.length === 0 && (
            <p className="col-span-4 text-center text-gray-500 py-10">לא נמצאו תוצאות</p>
          )}
        </section>
      )}

      {/* תצוגה לפי זמר */}
      {view === 'by-artist' && (
        <div className="p-6 flex flex-col gap-8">
          {byArtist.map(([artistName, artistAlbums]) => (
            <section key={artistName}>
              <div className="flex items-center gap-3 mb-4">
                <MicIcon size={24} color="#DD2476" />
                <h2 className="text-xl font-black text-[#DD2476]">{artistName}</h2>
                <span className="text-gray-400 text-sm">({artistAlbums.length} אלבומים)</span>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {artistAlbums.map(album => <AlbumCard key={album.id} album={album} />)}
              </div>
            </section>
          ))}
          {byArtist.length === 0 && (
            <p className="text-center text-gray-500 py-10">לא נמצאו תוצאות</p>
          )}
        </div>
      )}

      <footer className="bg-[#ffe8cc] text-center py-6 mt-8">
        <p className="text-[#DD2476] font-bold">✨ ♩ ♪ ♫ ♬ יאללה שירים 💪 ♬ ♫ ♪ ♩ ✨</p>
        <p className="text-gray-500 text-sm mt-2">© כל הזכויות שמורות | By Yael</p>
      </footer>
    </main>
  );
}
