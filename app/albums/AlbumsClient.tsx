// app/albums/AlbumsClient.tsx
'use client';
import Link from 'next/link';
import { useState, useMemo } from 'react';
import PageHeader from '@/app/PageHeader';
import AlbumFavButton from '@/app/AlbumFavButton';

const COLORS = [['#FF512F', '#DD2476'], ['#7B2FF7', '#54A0FF'], ['#FFC93C', '#FF512F'], ['#1B1033', '#7B2FF7'], ['#54A0FF', '#5FF5A0']];
const hash = (s: string) => [...s].reduce((h, c) => (h * 31 + c.charCodeAt(0)) >>> 0, 7);

export default function AlbumsClient({ albums }: { albums: any[] }) {
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState<'alpha-asc' | 'alpha-desc'>('alpha-asc');

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    const list = albums.filter(a => a.name.toLowerCase().includes(q) || a.artistName.toLowerCase().includes(q));
    return [...list].sort((a, b) => (sort === 'alpha-asc' ? 1 : -1) * a.name.localeCompare(b.name, 'he'));
  }, [albums, search, sort]);

  return (
    <main className="min-h-screen" dir="rtl">
      <PageHeader title="אלבומים" count={filtered.length} unit="אלבומים" placeholder="חיפוש אלבום או זמר..."
        search={search} setSearch={setSearch} sort={sort} setSort={setSort} />

      <section className="mx-auto grid max-w-6xl grid-cols-2 gap-5 p-5 sm:grid-cols-3 sm:gap-6 sm:p-8 lg:grid-cols-4">
        {filtered.map((album: any) => {
          const [c1, c2] = COLORS[hash(album.name) % COLORS.length];
          return (
            <div key={album.id} className="relative">
              <Link href={`/album/${album.id}?name=${encodeURIComponent(album.name)}`} className="group block">
                <div className="relative aspect-square overflow-hidden rounded-[28px] shadow-lg transition-transform duration-300 group-hover:-translate-y-1"
                  style={{ background: `linear-gradient(135deg, ${c1}, ${c2})` }}>
                  <div className="absolute -left-[18%] top-1/2 h-[85%] w-[85%] -translate-y-1/2 rounded-full bg-[#1B1033] shadow-2xl transition-transform duration-500 group-hover:translate-x-3"
                    style={{ background: 'radial-gradient(circle, #FFC93C 0 9%, #1B1033 10% 38%, #2b1d4d 39% 40%, #1B1033 41% 62%, #2b1d4d 63% 64%, #1B1033 65%)' }} />
                </div>
                <h3 className="mt-3 line-clamp-2 font-display text-[15px] font-extrabold leading-snug">{album.name}</h3>
                <p className="mt-0.5 truncate text-sm text-[#1B1033]/55">{album.artistName}</p>
              </Link>
              <AlbumFavButton album={{ id: album.id, name: album.name, artistName: album.artistName }} />
            </div>
          );
        })}
        {filtered.length === 0 && <p className="col-span-full py-16 text-center text-[#1B1033]/60">לא נמצא אלבום. נסי לחפש חלק מהשם או שם זמר.</p>}
      </section>
    </main>
  );
}
