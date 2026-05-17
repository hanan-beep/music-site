// app/songs/SongsClient.tsx
'use client';
import { useState, useMemo } from 'react';
import Link from 'next/link';
import { usePlayer } from '@/app/PlayerContext';

type Song = { id: string; name: string; artistName: string; albumName: string; isNew: boolean; driveOrder: number; createdTime?: string; };

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
  { value: 'alpha-asc', label: 'א → ת',        icon: '🔤' },
  { value: 'alpha-desc',label: 'ת → א',        icon: '🔡' },
];

export default function SongsClient({ regularSongs, extraSongs }: { regularSongs: Song[]; extraSongs: Song[]; }) {
  const { play, currentIndex, songs: globalSongs } = usePlayer();
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState<SortMode>('newest');
  const [selectedDate, setSelectedDate] = useState('');

  const filtered = useMemo(() => {
    const query = search.toLowerCase();
    const match = (s: Song) =>
      s.name.replace(/\.[^/.]+$/, '').toLowerCase().includes(query) ||
      s.artistName.toLowerCase().includes(query);

    const dedup = (arr: Song[]) => {
      const seen = new Set<string>();
      return arr.filter(s => {
        const key = s.name.replace(/\.[^/.]+$/, '').trim().toLowerCase();
        if (seen.has(key)) return false;
        seen.add(key); return true;
      });
    };

    if (sort === 'newest') {
      const newF = dedup(extraSongs.filter(match)).sort((a, b) => a.driveOrder - b.driveOrder);
      const newIds = new Set(newF.map(s => s.name.replace(/\.[^/.]+$/, '').trim().toLowerCase()));
      const regF = dedup(regularSongs.filter(match).filter(s => !newIds.has(s.name.replace(/\.[^/.]+$/, '').trim().toLowerCase())))
        .sort((a, b) => a.name.replace(/\.[^/.]+$/, '').localeCompare(b.name.replace(/\.[^/.]+$/, ''), 'he'));
      return [...newF, ...regF];
    }
    if (sort === 'week') return dedup(extraSongs.filter(match).filter(s => s.createdTime && isWithinDays(s.createdTime, 7))).sort((a, b) => new Date(b.createdTime!).getTime() - new Date(a.createdTime!).getTime());
    if (sort === 'month') return dedup(extraSongs.filter(match).filter(s => s.createdTime && isWithinDays(s.createdTime, 30))).sort((a, b) => new Date(b.createdTime!).getTime() - new Date(a.createdTime!).getTime());
    if (sort === 'date' && selectedDate) {
      const target = new Date(selectedDate);
      return dedup(extraSongs.filter(match).filter(s => s.createdTime && isSameDay(s.createdTime, target)));
    }
    return dedup([...extraSongs, ...regularSongs].filter(match)).sort((a, b) => {
      const na = a.name.replace(/\.[^/.]+$/, ''), nb = b.name.replace(/\.[^/.]+$/, '');
      return sort === 'alpha-asc' ? na.localeCompare(nb, 'he') : nb.localeCompare(na, 'he');
    });
  }, [regularSongs, extraSongs, search, sort, selectedDate]);

  const isThisPlaylist = globalSongs.length > 0 && filtered.length > 0 && globalSongs[0]?.id === filtered[0]?.id;
  const activeIndex = isThisPlaylist ? currentIndex : -1;

  return (
    <main className="min-h-screen bg-gradient-to-br from-[#ffecd2] via-[#fcb69f] to-[#ffd1a9] pb-48" dir="rtl">
      <header className="bg-gradient-to-r from-[#FF512F] to-[#DD2476] p-6 text-center shadow-2xl">
        <Link href="/" className="text-white text-sm mb-2 block">→ חזרה לדף הבית</Link>
        <h1 className="text-3xl font-black text-white">🎵 שירים</h1>
      </header>

      <div className="px-6 pt-6 pb-3">
        <input type="text" placeholder="🔍 חיפוש שיר או זמר..." value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full rounded-2xl px-4 py-3 border-2 border-[#DD2476]/30 bg-white/80 text-gray-800 font-bold placeholder-gray-400 focus:outline-none focus:border-[#DD2476] shadow" />
      </div>

      <div className="px-6 pb-4">
        <div className="flex gap-2 overflow-x-auto pb-1">
          {SORT_OPTIONS.map(opt => (
            <button key={opt.value} onClick={() => setSort(opt.value)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-2xl font-bold text-sm whitespace-nowrap transition-all flex-shrink-0 ${
                sort === opt.value
                  ? 'bg-gradient-to-r from-[#FF512F] to-[#DD2476] text-white shadow-lg scale-105'
                  : 'bg-white/80 text-gray-600 border-2 border-gray-200 hover:border-[#DD2476]'
              }`}>
              <span>{opt.icon}</span><span>{opt.label}</span>
            </button>
          ))}
        </div>
        {sort === 'date' && (
          <div className="mt-3">
            <input type="date" value={selectedDate} onChange={e => setSelectedDate(e.target.value)}
              className="rounded-2xl px-4 py-3 border-2 border-[#DD2476] bg-white text-gray-800 font-bold focus:outline-none shadow w-full sm:w-auto" />
          </div>
        )}
      </div>

      <section className="flex flex-col gap-3 px-6">
        <p className="text-gray-500 text-sm">{filtered.length} שירים</p>
        {filtered.map((song, idx) => {
          const isActive = activeIndex === idx;
          return (
            <div key={`${song.id}-${idx}`} onClick={() => play(filtered, idx)}
              className={`rounded-2xl p-3 flex items-center gap-3 shadow-md cursor-pointer transition-all duration-200 ${
                isActive
                  ? 'bg-gradient-to-l from-[#FF512F]/20 to-[#DD2476]/20 border-2 border-[#DD2476] scale-[1.01]'
                  : 'bg-[#ffe8cc] hover:bg-[#ffd9aa] border-2 border-transparent'
              }`}>
              <div className={`w-11 h-11 rounded-xl flex-shrink-0 overflow-hidden border-2 shadow ${isActive ? 'border-[#DD2476]' : 'border-white'}`}>
                <img src="/logo.png" alt="" className="w-full h-full object-cover" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  {song.isNew && <span className="text-xs bg-[#DD2476] text-white px-2 py-0.5 rounded-full font-black flex-shrink-0">חדש</span>}
                  <h3 className={`font-bold truncate text-sm ${isActive ? 'text-[#DD2476]' : 'text-gray-800'}`}>
                    {song.name.replace(/\.[^/.]+$/, '')}
                  </h3>
                </div>
                {song.artistName && <p className="text-xs text-gray-500 truncate mt-0.5">🎤 {song.artistName}</p>}
              </div>
              <div className="flex items-center gap-2 flex-shrink-0" onClick={e => e.stopPropagation()}>
                <button onClick={() => play(filtered, idx)}
                  className={`flex items-center gap-1 px-3 py-2 rounded-xl text-sm font-black transition-all ${isActive ? 'bg-[#DD2476] text-white shadow' : 'bg-[#DD2476] text-white hover:opacity-80'}`}>
                  {isActive ? '🎵' : '▶'} <span className="hidden sm:inline">{isActive ? 'מנגן' : 'האזן'}</span>
                </button>
                <a href={`https://drive.google.com/uc?export=download&id=${song.id}`}
                  onClick={e => e.stopPropagation()}
                  className="flex items-center gap-1 bg-[#FF512F] text-white px-3 py-2 rounded-xl text-sm font-black hover:opacity-80">
                  ⬇ <span className="hidden sm:inline">הורד</span>
                </a>
              </div>
            </div>
          );
        })}
        {filtered.length === 0 && (
          <p className="text-center text-gray-400 py-16 text-lg">
            {sort === 'week' ? '⚡ לא עלו שירים בשבוע האחרון' :
             sort === 'month' ? '🌙 לא עלו שירים בחודש האחרון' :
             sort === 'date' && selectedDate ? '🗓 לא עלו שירים בתאריך זה' : 'לא נמצאו שירים'}
          </p>
        )}
      </section>

      <footer className="bg-[#ffe8cc] text-center py-6 mt-8">
        <p className="text-[#DD2476] font-bold">✨ ♩ ♪ ♫ ♬ יאללה שירים 💪 ♬ ♫ ♪ ♩ ✨</p>
        <p className="text-gray-500 text-sm mt-2">© כל הזכויות שמורות | By Yael</p>
      </footer>
    </main>
  );
}