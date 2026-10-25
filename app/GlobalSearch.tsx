// app/GlobalSearch.tsx
'use client';
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { usePlayer } from './PlayerContext';
import { MicIcon, AlbumIcon, MusicNoteIcon } from './Icons';

type Item = { kind: 'artist' | 'album' | 'song'; id: string; name: string; artist_name: string; album_name: string };

const clean = (n: string) => n.replace(/\.[^/.]+$/, '');
const META = {
  artist: { title: 'זמרים', bg: '#DD2476', icon: <MicIcon size={18} color="white" /> },
  album: { title: 'אלבומים', bg: '#FFC93C', icon: <AlbumIcon size={18} color="#1B1033" /> },
  song: { title: 'שירים', bg: '#1B1033', icon: <MusicNoteIcon size={18} color="#FFC93C" /> },
} as const;

export default function GlobalSearch() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(false);
  const [failed, setFailed] = useState(false);
  const [active, setActive] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const { play } = usePlayer();

  useEffect(() => { if (open) setTimeout(() => inputRef.current?.focus(), 100); }, [open]);

  useEffect(() => {
    const q = query.trim();
    if (!q) { setItems([]); setLoading(false); setFailed(false); return; }
    setLoading(true);
    const ctrl = new AbortController();
    const t = setTimeout(async () => {
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`, { signal: ctrl.signal });
        if (!res.ok) throw new Error('bad response');
        setItems(await res.json()); setFailed(false); setActive(0);
      } catch (e: any) { if (e.name !== 'AbortError') setFailed(true); }
      if (!ctrl.signal.aborted) setLoading(false);
    }, 200);
    return () => { clearTimeout(t); ctrl.abort(); };
  }, [query]);

  useEffect(() => { document.getElementById(`sr-${active}`)?.scrollIntoView({ block: 'nearest' }); }, [active]);

  const close = () => { setOpen(false); setQuery(''); };

  function select(item: Item) {
    close();
    if (item.kind === 'artist') router.push(`/artist/${encodeURIComponent(item.name)}`);
    else if (item.kind === 'album') router.push(`/album/${item.id}?name=${encodeURIComponent(item.name)}`);
    else {
      // שיר: מנגנים אותו, והשירים הבאים ברשימת התוצאות ממשיכים אחריו
      const songs = items.filter(i => i.kind === 'song').map(i => ({ id: i.id, name: i.name, artistName: i.artist_name, albumName: i.album_name }));
      play(songs, Math.max(0, songs.findIndex(s => s.id === item.id)));
    }
  }

  function onKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'ArrowDown') { e.preventDefault(); setActive(a => Math.min(a + 1, items.length - 1)); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setActive(a => Math.max(a - 1, 0)); }
    else if (e.key === 'Enter' && items[active]) select(items[active]);
    else if (e.key === 'Escape') close();
  }

  const sub = (i: Item) =>
    i.kind === 'artist' ? 'זמר'
      : i.kind === 'album' ? ['אלבום', i.artist_name].filter(Boolean).join(' • ')
        : [i.artist_name, i.album_name].filter(Boolean).join(' • ');

  return (
    <>
      <button onClick={() => setOpen(true)} aria-label="חיפוש"
        className="fixed top-4 right-16 z-50 rounded-xl border border-white/20 bg-[#1B1033]/85 p-2.5 shadow-lg backdrop-blur-md transition-all hover:bg-[#1B1033]">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round">
          <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
        </svg>
      </button>

      {open && (
        <div className="fixed inset-0 z-[100] flex items-start justify-center px-4 pt-20" dir="rtl" role="dialog" aria-label="חיפוש">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={close} />
          <div className="relative w-full max-w-lg overflow-hidden rounded-3xl bg-white shadow-2xl">
            <div className="flex items-center gap-3 border-b border-black/5 px-5 py-4">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#DD2476" strokeWidth="2.5" strokeLinecap="round">
                <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
              </svg>
              <input ref={inputRef} type="search" placeholder="חיפוש זמר, אלבום או שיר..." value={query}
                onChange={e => setQuery(e.target.value)} onKeyDown={onKeyDown}
                className="flex-1 bg-transparent text-lg font-bold text-[#1B1033] placeholder-[#1B1033]/30 focus:outline-none" />
              {loading && <span className="h-4 w-4 animate-spin rounded-full border-2 border-[#DD2476] border-t-transparent" />}
              {query && !loading && <button onClick={() => setQuery('')} aria-label="נקה" className="text-[#1B1033]/40 hover:text-[#1B1033]">✕</button>}
            </div>

            {items.length > 0 && (
              <div className="max-h-[60vh] overflow-y-auto py-1">
                {items.map((item, i) => (
                  <div key={`${item.kind}-${item.id}`}>
                    {(i === 0 || items[i - 1].kind !== item.kind) && (
                      <p className="px-5 pb-1 pt-3 text-xs font-extrabold text-[#1B1033]/45">{META[item.kind].title}</p>
                    )}
                    <button id={`sr-${i}`} onClick={() => select(item)} onMouseEnter={() => setActive(i)}
                      className={`flex w-full items-center gap-3 px-5 py-2.5 text-right transition-colors ${i === active ? 'bg-[#FFF3EA]' : ''}`}>
                      <span className="grid h-9 w-9 flex-none place-items-center rounded-full" style={{ background: META[item.kind].bg }}>{META[item.kind].icon}</span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate font-bold text-[#1B1033]">{item.kind === 'song' ? clean(item.name) : item.name}</span>
                        <span className="block truncate text-xs text-[#1B1033]/50">{sub(item)}</span>
                      </span>
                    </button>
                  </div>
                ))}
              </div>
            )}

            {!loading && query.trim() && !failed && items.length === 0 && (
              <p className="p-6 text-center text-[#1B1033]/50">לא נמצאו תוצאות. נסו מילה אחת או חלק מהשם.</p>
            )}
            {failed && <p className="p-6 text-center text-[#DD2476]">החיפוש לא זמין כרגע, נסו שוב בעוד רגע.</p>}
            {!query.trim() && <p className="p-6 text-center text-sm text-[#1B1033]/40">אפשר לחפש לפי שם זמר, שם אלבום, שם שיר או חודש.</p>}
          </div>
        </div>
      )}
    </>
  );
}
