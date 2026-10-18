// app/songs/SongsClient.tsx
'use client';
import OfflineMenuItem from '@/app/OfflineMenuItem';
import { useState, useMemo, useEffect } from 'react';
import { usePlayer } from '@/app/PlayerContext';
import FavButton from '@/app/FavButton';
import { PlayIcon, DownloadIcon, SearchIcon } from '@/app/Icons';

const PAGE_SIZE = 50;

type Song = {
  id: string; name: string; artistName: string; albumName: string;
  isNew: boolean; driveOrder: number; createdTime?: string; isMonthly?: boolean;
};

function isWithinDays(dateStr: string, days: number) {
  return (Date.now() - new Date(dateStr).getTime()) < days * 86400000;
}
function isSameDay(dateStr: string, target: Date) {
  const d = new Date(dateStr);
  return d.getFullYear() === target.getFullYear() && d.getMonth() === target.getMonth() && d.getDate() === target.getDate();
}

type SortMode = 'newest' | 'week' | 'month' | 'date' | 'alpha-asc' | 'alpha-desc';

const SORT_OPTIONS: { value: SortMode; label: string; icon: string }[] = [
  { value: 'newest',    label: 'חדשים קודם',   icon: '🔥' },
  { value: 'week',      label: 'שבוע אחרון',   icon: '⚡' },
  { value: 'month',     label: 'חודש אחרון',   icon: '🌙' },
  { value: 'date',      label: 'תאריך ספציפי', icon: '🗓' },
  { value: 'alpha-asc', label: 'א ← ת',        icon: '🔤' },
  { value: 'alpha-desc',label: 'ת ← א',        icon: '🔡' },
];

export default function SongsClient({ regularSongs, extraSongs }: { regularSongs: Song[]; extraSongs: Song[]; }) {
  const { play, playNext, enqueue, currentIndex, songs: globalSongs } = usePlayer();
  const [menu, setMenu] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState<SortMode>('newest');
  const [selectedDate, setSelectedDate] = useState('');
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    const query = search.toLowerCase();
    const match = (s: Song) =>
      s.name.replace(/\.[^/.]+$/, '').toLowerCase().includes(query) ||
      s.artistName.toLowerCase().includes(query) ||
      s.albumName.toLowerCase().includes(query);

    const dedup = (arr: Song[]) => {
      const seen = new Set<string>();
      return arr.filter(s => {
        const key = s.name.replace(/\.[^/.]+$/, '').trim().toLowerCase();
        if (seen.has(key)) return false;
        seen.add(key); return true;
      });
    };

    if (sort === 'newest') {
      // שירים חודשיים קודם (לפי תאריך עלייה חדש→ישן), אחר כך שירי זמרים א-ב
      const monthlyF = dedup(extraSongs.filter(match))
        .sort((a, b) => new Date(b.createdTime!).getTime() - new Date(a.createdTime!).getTime());
      const monthIds = new Set(monthlyF.map(s => s.name.replace(/\.[^/.]+$/, '').trim().toLowerCase()));
      const regF = dedup(regularSongs.filter(match).filter(s => !monthIds.has(s.name.replace(/\.[^/.]+$/, '').trim().toLowerCase())))
        .sort((a, b) => a.name.replace(/\.[^/.]+$/, '').localeCompare(b.name.replace(/\.[^/.]+$/, ''), 'he'));
      return [...monthlyF, ...regF];
    }
    if (sort === 'week')
      return dedup(extraSongs.filter(match).filter(s => s.createdTime && isWithinDays(s.createdTime, 7)))
        .sort((a, b) => new Date(b.createdTime!).getTime() - new Date(a.createdTime!).getTime());
    if (sort === 'month')
      return dedup(extraSongs.filter(match).filter(s => s.createdTime && isWithinDays(s.createdTime, 30)))
        .sort((a, b) => new Date(b.createdTime!).getTime() - new Date(a.createdTime!).getTime());
    if (sort === 'date' && selectedDate) {
      const target = new Date(selectedDate);
      return dedup(extraSongs.filter(match).filter(s => s.createdTime && isSameDay(s.createdTime, target)));
    }
    return dedup([...extraSongs, ...regularSongs].filter(match)).sort((a, b) => {
      const na = a.name.replace(/\.[^/.]+$/, ''), nb = b.name.replace(/\.[^/.]+$/, '');
      return sort === 'alpha-asc' ? na.localeCompare(nb, 'he') : nb.localeCompare(na, 'he');
    });
  }, [regularSongs, extraSongs, search, sort, selectedDate]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const pageSongs = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  useEffect(() => setPage(1), [search, sort, selectedDate]);

  const nowId = currentIndex >= 0 ? globalSongs[currentIndex]?.id : null;
  const toQ = (x: Song) => ({ id: x.id, name: x.name, artistName: x.artistName, albumName: x.albumName });
  const go = (p: number) => { setPage(p); window.scrollTo({ top: 0, behavior: 'smooth' }); };

  return (
    <main className="min-h-screen" dir="rtl">
      <header className="bg-gradient-to-br from-[#FF512F] via-[#DD2476] to-[#7B2FF7] px-5 pb-7 pt-20 text-white sm:px-12">
        <div className="mx-auto max-w-4xl">
          <h1 className="text-4xl font-extrabold sm:text-5xl">שירים</h1>
          <p className="mt-1 text-white/80">{filtered.length.toLocaleString('he-IL')} שירים</p>
          <label className="relative mt-6 block">
            <span className="sr-only">חיפוש שיר</span>
            <input type="search" placeholder="חיפוש שיר, זמר או חודש..." value={search} onChange={e => setSearch(e.target.value)}
              className="w-full rounded-full bg-white py-3.5 pl-5 pr-12 font-semibold text-[#1B1033] shadow-lg placeholder:text-[#1B1033]/40" />
            <span className="absolute right-4 top-1/2 -translate-y-1/2"><SearchIcon size={20} color="#DD2476" /></span>
          </label>
        </div>
      </header>

      <div className="mx-auto max-w-4xl px-4 pt-4 sm:px-6">
        <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-2">
          {SORT_OPTIONS.map(opt => (
            <button key={opt.value} onClick={() => setSort(opt.value)}
              className={`flex-none whitespace-nowrap rounded-full px-4 py-2 text-sm font-bold transition-colors ${sort === opt.value ? 'bg-[#1B1033] text-white shadow' : 'bg-white text-[#1B1033]/70 ring-1 ring-black/5 hover:bg-white/60'}`}>
              {opt.label}
            </button>
          ))}
        </div>
        {sort === 'date' && (
          <input type="date" value={selectedDate} onChange={e => setSelectedDate(e.target.value)}
            className="mt-2 w-full rounded-2xl bg-white px-4 py-3 font-bold text-[#1B1033] ring-1 ring-black/10 sm:w-auto" />
        )}

        {menu && <div className="fixed inset-0 z-20" onClick={() => setMenu(null)} />}
        <ul className="mt-3 space-y-2">
          {pageSongs.map((song, idx) => {
            const globalIdx = (page - 1) * PAGE_SIZE + idx;
            const active = nowId === song.id;
            const open = menu === song.id;
            return (
              <li key={`${song.id}-${globalIdx}`} className={`relative ${open ? 'z-30' : ''}`}>
                <div onClick={() => play(filtered, globalIdx)}
                  className={`flex cursor-pointer items-center gap-3 rounded-2xl p-2.5 pr-3 transition-all ${active ? 'bg-[#1B1033] text-white shadow-lg' : 'bg-white shadow-sm hover:shadow-md'}`}>
                  <div className="relative h-12 w-12 flex-none">
                    <img src="/logo.png" alt="" className={`h-full w-full rounded-full object-cover ring-2 ${active ? 'ring-[#FFC93C]' : 'ring-[#FFC93C]/50'}`} />
                    {active && <span className="absolute inset-0 grid place-items-center rounded-full bg-[#1B1033]/70"><span className="eq on"><i /><i /><i /></span></span>}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      {song.isNew && song.isMonthly && <span className="flex-none rounded-full bg-gradient-to-l from-[#FF512F] to-[#DD2476] px-2 py-0.5 text-[11px] font-extrabold text-white">חדש</span>}
                      <h3 className={`truncate text-[15px] font-extrabold ${active ? 'text-[#FFC93C]' : ''}`}>{song.name.replace(/\.[^/.]+$/, '')}</h3>
                    </div>
                    <p className={`mt-0.5 truncate text-xs ${active ? 'text-white/60' : 'text-[#1B1033]/50'}`}>{[song.artistName, song.albumName].filter(Boolean).join(' • ')}</p>
                  </div>
                  <div className="flex flex-none items-center gap-1" onClick={e => e.stopPropagation()}>
                    <FavButton song={song} size="sm" />
                    <button onClick={() => setMenu(open ? null : song.id)} aria-label="עוד פעולות" aria-expanded={open}
                      className={`rounded-full p-2 ${active ? 'hover:bg-white/10' : 'hover:bg-black/5'}`}>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="5" r="2" /><circle cx="12" cy="12" r="2" /><circle cx="12" cy="19" r="2" /></svg>
                    </button>
                    <button onClick={() => play(filtered, globalIdx)} aria-label="נגן"
                      className="grid h-10 w-10 place-items-center rounded-full bg-gradient-to-br from-[#FFC93C] via-[#FF512F] to-[#DD2476] shadow transition-transform hover:scale-105">
                      <PlayIcon size={15} color="white" />
                    </button>
                  </div>
                </div>
                {open && (
                  <div className="absolute left-3 top-full z-30 mt-1 w-60 overflow-hidden rounded-2xl bg-white py-1 text-sm font-bold text-[#1B1033] shadow-2xl ring-1 ring-black/5">
                    <button onClick={() => { playNext(toQ(song)); setMenu(null); }} className="block w-full px-4 py-2.5 text-right hover:bg-[#FFF3EA]">נגן אחר כך</button>
                    <button onClick={() => { enqueue(toQ(song)); setMenu(null); }} className="block w-full px-4 py-2.5 text-right hover:bg-[#FFF3EA]">הוסף לתור</button>
                    <OfflineMenuItem song={toQ(song)} onDone={() => setMenu(null)} />
                    <a href={`/api/stream/${song.id}?download=1`} onClick={() => setMenu(null)} className="block px-4 py-2.5 hover:bg-[#FFF3EA]">הורדה</a>
                  </div>
                )}
              </li>
            );
          })}
        </ul>

        {filtered.length === 0 && (
          <p className="py-16 text-center text-lg text-[#1B1033]/50">
            {sort === 'week' ? 'לא עלו שירים בשבוע האחרון' : sort === 'month' ? 'לא עלו שירים בחודש האחרון'
              : sort === 'date' && selectedDate ? 'לא עלו שירים בתאריך הזה' : 'לא נמצאו שירים. נסי לחפש חלק מהשם.'}
          </p>
        )}

        {totalPages > 1 && (
          <nav className="flex items-center justify-center gap-3 py-8" aria-label="עמודים">
            <button onClick={() => go(Math.max(1, page - 1))} disabled={page === 1} className="rounded-full bg-white px-5 py-2.5 text-sm font-extrabold shadow-sm ring-1 ring-black/5 disabled:opacity-30">→ קודם</button>
            <span className="text-sm font-bold text-[#1B1033]/60">עמוד {page} מתוך {totalPages}</span>
            <button onClick={() => go(Math.min(totalPages, page + 1))} disabled={page === totalPages} className="rounded-full bg-[#1B1033] px-5 py-2.5 text-sm font-extrabold text-white shadow disabled:opacity-30">הבא ←</button>
          </nav>
        )}
      </div>

      <footer className="px-6 pb-10 pt-8 text-center text-sm text-[#1B1033]/50">© כל הזכויות שמורות | By Yael</footer>
    </main>
  );
}
