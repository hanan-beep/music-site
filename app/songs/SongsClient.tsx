// app/songs/SongsClient.tsx
'use client';
import { useState, useMemo } from 'react';
import { usePlayer } from '@/app/PlayerContext';

type Song = { id: string; name: string; artistName: string; albumName: string; isNew: boolean; driveOrder: number; createdTime?: string; };

function isSameDay(dateStr: string, target: Date) {
  const d = new Date(dateStr);
  return d.getFullYear() === target.getFullYear() &&
    d.getMonth() === target.getMonth() &&
    d.getDate() === target.getDate();
}

function isWithinDays(dateStr: string, days: number) {
  const d = new Date(dateStr);
  const now = new Date();
  return (now.getTime() - d.getTime()) < days * 24 * 60 * 60 * 1000;
}

export default function SongsClient({ regularSongs, extraSongs }: { regularSongs: Song[]; extraSongs: Song[]; }) {
  const { play, currentIndex, songs: globalSongs } = usePlayer();
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState<'newest' | 'alpha-asc' | 'alpha-desc' | 'week' | 'month' | 'date'>('newest');
  const [selectedDate, setSelectedDate] = useState('');
  const [showCalendar, setShowCalendar] = useState(false);

  const filtered = useMemo(() => {
    const query = search.toLowerCase();
    const match = (s: Song) =>
      s.name.replace(/\.[^/.]+$/, '').toLowerCase().includes(query) ||
      s.artistName.toLowerCase().includes(query);

    // הסרת כפילויות לפי שם
    const dedup = (arr: Song[]) => {
      const seen = new Set<string>();
      return arr.filter(s => {
        const key = s.name.replace(/\.[^/.]+$/, '').trim().toLowerCase();
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      });
    };

    if (sort === 'newest') {
      const newF = dedup(extraSongs.filter(match)).sort((a, b) => a.driveOrder - b.driveOrder);
      const regIds = new Set(newF.map(s => s.name.replace(/\.[^/.]+$/, '').trim().toLowerCase()));
      const regF = dedup(regularSongs.filter(match).filter(s =>
        !regIds.has(s.name.replace(/\.[^/.]+$/, '').trim().toLowerCase())
      )).sort((a, b) => a.name.replace(/\.[^/.]+$/, '').localeCompare(b.name.replace(/\.[^/.]+$/, ''), 'he'));
      return [...newF, ...regF];
    }

    if (sort === 'week') {
      return dedup(extraSongs.filter(match).filter(s => s.createdTime && isWithinDays(s.createdTime, 7)))
        .sort((a, b) => new Date(b.createdTime!).getTime() - new Date(a.createdTime!).getTime());
    }

    if (sort === 'month') {
      return dedup(extraSongs.filter(match).filter(s => s.createdTime && isWithinDays(s.createdTime, 30)))
        .sort((a, b) => new Date(b.createdTime!).getTime() - new Date(a.createdTime!).getTime());
    }

    if (sort === 'date' && selectedDate) {
      const target = new Date(selectedDate);
      return dedup(extraSongs.filter(match).filter(s => s.createdTime && isSameDay(s.createdTime, target)));
    }

    const all = dedup([...extraSongs, ...regularSongs].filter(match));
    return all.sort((a, b) => {
      const na = a.name.replace(/\.[^/.]+$/, '');
      const nb = b.name.replace(/\.[^/.]+$/, '');
      return sort === 'alpha-asc' ? na.localeCompare(nb, 'he') : nb.localeCompare(na, 'he');
    });
  }, [regularSongs, extraSongs, search, sort, selectedDate]);

  const isThisPlaylist = globalSongs.length > 0 && filtered.length > 0 && globalSongs[0]?.id === filtered[0]?.id;
  const activeIndex = isThisPlaylist ? currentIndex : -1;

  return (
    <main className="min-h-screen bg-gradient-to-br from-[#ffecd2] via-[#fcb69f] to-[#ffd1a9] pb-48" dir="rtl">
      <header className="bg-gradient-to-r from-[#FF512F] to-[#DD2476] p-6 text-center shadow-2xl">
        <a href="/" className="text-white text-sm mb-2 block">→ חזרה לדף הבית</a>
        <h1 className="text-3xl font-black text-white">🎵 שירים</h1>
      </header>

      {/* חיפוש + מיון */}
      <div className="px-6 pt-6 pb-2 flex flex-col sm:flex-row gap-3">
        <input type="text" placeholder="🔍 חיפוש שיר או זמר..." value={search}
          onChange={e => setSearch(e.target.value)}
          className="flex-1 rounded-2xl px-4 py-3 border-2 border-[#DD2476]/30 bg-white/80 text-gray-800 font-bold placeholder-gray-400 focus:outline-none focus:border-[#DD2476] shadow" />

        <div className="flex gap-2">
          <select value={sort === 'date' ? 'date' : sort}
            onChange={e => { setSort(e.target.value as any); if (e.target.value !== 'date') setShowCalendar(false); else setShowCalendar(true); }}
            className="rounded-2xl px-4 py-3 border-2 border-[#DD2476]/30 bg-white/80 text-gray-800 font-bold focus:outline-none focus:border-[#DD2476] shadow">
            <option value="newest">🆕 חדשים קודם</option>
            <option value="week">📅 שבוע אחרון</option>
            <option value="month">🗓️ חודש אחרון</option>
            <option value="date">📆 תאריך ספציפי</option>
            <option value="alpha-asc">א ← ת</option>
            <option value="alpha-desc">ת ← א</option>
          </select>

          {/* לוח שנה */}
          {sort === 'date' && (
            <input type="date" value={selectedDate}
              onChange={e => setSelectedDate(e.target.value)}
              className="rounded-2xl px-3 py-3 border-2 border-[#DD2476] bg-white text-gray-800 font-bold focus:outline-none shadow" />
          )}
        </div>
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

              {/* לוגו ברירת מחדל */}
              <div className={`w-10 h-10 rounded-xl flex-shrink-0 overflow-hidden border-2 ${isActive ? 'border-[#DD2476]' : 'border-white'}`}>
                <img src="/logo.png" alt="" className="w-full h-full object-cover" />
              </div>

              <div className="flex items-center gap-2 flex-1 min-w-0">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 font-black text-xs ${
                  isActive ? 'bg-[#DD2476] text-white' : 'bg-white/60 text-gray-400'
                }`}>
                  {isActive ? '🎵' : idx + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className={`font-bold truncate text-sm ${isActive ? 'text-[#DD2476]' : 'text-gray-800'}`}>
                    {song.name.replace(/\.[^/.]+$/, '')}
                  </h3>
                  {song.artistName && (
                    <p className="text-xs text-[#DD2476]/70 truncate">
                      🎤 {song.artistName}{song.albumName ? ` · ${song.albumName}` : ''}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2 flex-shrink-0" onClick={e => e.stopPropagation()}>
                {song.isNew && (
                  <span className="text-xs bg-[#DD2476] text-white px-2 py-1 rounded-full font-bold whitespace-nowrap">חדש</span>
                )}
                <button onClick={() => play(filtered, idx)}
                  className={`flex items-center gap-1 px-3 py-2 rounded-full text-sm font-bold transition-colors whitespace-nowrap ${
                    isActive ? 'bg-[#DD2476] text-white' : 'bg-[#DD2476]/80 text-white hover:bg-[#DD2476]'
                  }`}>
                  {isActive ? '🎵 מנגן' : '▶️ האזן'}
                </button>
                <a href={`https://drive.google.com/uc?export=download&id=${song.id}`}
                  onClick={e => e.stopPropagation()}
                  className="flex items-center gap-1 bg-[#FF512F] text-white px-3 py-2 rounded-full text-sm font-bold hover:opacity-80 whitespace-nowrap">
                  ⬇️ הורד
                </a>
              </div>
            </div>
          );
        })}
        {filtered.length === 0 && (
          <p className="text-center text-gray-500 py-10">
            {sort === 'week' ? 'לא עלו שירים בשבוע האחרון' :
             sort === 'month' ? 'לא עלו שירים בחודש האחרון' :
             sort === 'date' && selectedDate ? 'לא עלו שירים בתאריך זה' :
             'לא נמצאו שירים'}
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
