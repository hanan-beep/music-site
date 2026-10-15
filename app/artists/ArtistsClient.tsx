// app/artists/ArtistsClient.tsx
'use client';
import Link from 'next/link';
import { useState, useMemo } from 'react';
import PageHeader from '@/app/PageHeader';

const GRADS = ['from-[#FF512F] to-[#DD2476]', 'from-[#7B2FF7] to-[#54A0FF]', 'from-[#FFC93C] to-[#FF512F]', 'from-[#1B1033] to-[#7B2FF7]'];

export default function ArtistsClient({ artists }: { artists: any[] }) {
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState<'alpha-asc' | 'alpha-desc'>('alpha-asc');

  const filtered = useMemo(() => {
    const list = artists.filter(a => a.name.toLowerCase().includes(search.toLowerCase()));
    return [...list].sort((a, b) => (sort === 'alpha-asc' ? 1 : -1) * a.name.localeCompare(b.name, 'he'));
  }, [artists, search, sort]);

  return (
    <main className="min-h-screen" dir="rtl">
      <PageHeader title="זמרים" count={filtered.length} unit="זמרים" placeholder="חיפוש זמר..."
        search={search} setSearch={setSearch} sort={sort} setSort={setSort} />

      <section className="mx-auto grid max-w-6xl grid-cols-2 gap-4 p-5 sm:grid-cols-3 sm:gap-5 sm:p-8 lg:grid-cols-5">
        {filtered.map((artist: any, i: number) => (
          <Link key={artist.id} href={`/artist/${encodeURIComponent(artist.name)}`}
            className="group relative block aspect-square overflow-hidden rounded-[28px] shadow-lg transition-transform duration-300 hover:-translate-y-1">
            {artist.imageId ? (
              <img src={`/api/image/${artist.imageId}?w=600`} alt="" loading="lazy"
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110" />
            ) : (
              <div className={`grid h-full w-full place-items-center bg-gradient-to-br ${GRADS[i % GRADS.length]}`}>
                <span className="font-display text-7xl font-extrabold text-white/90">{artist.name.trim()[0]}</span>
              </div>
            )}
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-[#1B1033]/90 via-[#1B1033]/50 to-transparent px-4 pb-3 pt-10">
              <h3 className="truncate font-display text-base font-extrabold text-white">{artist.name}</h3>
            </div>
          </Link>
        ))}
        {filtered.length === 0 && <p className="col-span-full py-16 text-center text-[#1B1033]/60">לא נמצא זמר בשם הזה. נסי לחפש חלק מהשם.</p>}
      </section>
    </main>
  );
}
