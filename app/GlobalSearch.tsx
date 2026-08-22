// app/GlobalSearch.tsx
'use client';
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';

export default function GlobalSearch() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 100);
  }, [open]);

  useEffect(() => {
    if (!query.trim()) { setResults([]); return; }
    setLoading(true);
    const t = setTimeout(async () => {
      const BASE = 'https://music-site-flame.vercel.app/api/drive';
      const artistsRes = await fetch(BASE);
      const artists = await artistsRes.json();

      const q = query.toLowerCase();
      const matched: any[] = [];

      // חיפוש זמרים
      artists.filter((a: any) => a.name.toLowerCase().includes(q))
        .slice(0, 3).forEach((a: any) => matched.push({ type: 'artist', id: a.id, name: a.name }));

      // חיפוש אלבומים
      await Promise.all(artists.slice(0, 20).map(async (artist: any) => {
        const res = await fetch(`${BASE}?folderId=${artist.id}`);
        const contents = await res.json();
        contents.filter((f: any) => f.mimeType === 'application/vnd.google-apps.folder' && f.name.toLowerCase().includes(q))
          .slice(0, 2).forEach((f: any) => matched.push({ type: 'album', id: f.id, name: f.name, artistName: artist.name }));
        contents.filter((f: any) => f.mimeType !== 'application/vnd.google-apps.folder' && f.name.toLowerCase().includes(q))
          .slice(0, 2).forEach((f: any) => matched.push({ type: 'song', id: f.id, name: f.name.replace(/\.[^/.]+$/, ''), artistName: artist.name }));
      }));

      setResults(matched.slice(0, 10));
      setLoading(false);
    }, 400);
    return () => clearTimeout(t);
  }, [query]);

  function handleSelect(item: any) {
    setOpen(false); setQuery('');
    if (item.type === 'artist') router.push(`/artist/${encodeURIComponent(item.name)}`);
    else if (item.type === 'album') router.push(`/album/${item.id}?name=${encodeURIComponent(item.name)}`);
  }

  const icons: Record<string, string> = { artist: '🎤', album: '💿', song: '🎵' };
  const labels: Record<string, string> = { artist: 'זמר', album: 'אלבום', song: 'שיר' };

  return (
    <>
      {/* כפתור חיפוש */}
      <button onClick={() => setOpen(true)}
        className="fixed top-4 right-16 z-50 bg-white/20 backdrop-blur-sm border border-white/30 rounded-xl p-2.5 shadow-lg hover:bg-white/30 transition-all">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round">
          <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
        </svg>
      </button>

      {/* Modal חיפוש */}
      {open && (
        <div className="fixed inset-0 z-[100] flex items-start justify-center pt-20 px-4" dir="rtl">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => { setOpen(false); setQuery(''); }} />
          <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden">
            <div className="flex items-center gap-3 px-5 py-4 border-b">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#DD2476" strokeWidth="2.5" strokeLinecap="round">
                <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
              </svg>
              <input ref={inputRef} type="text" placeholder="חפש זמר, אלבום, שיר..."
                value={query} onChange={e => setQuery(e.target.value)}
                className="flex-1 text-gray-800 font-bold text-lg focus:outline-none placeholder-gray-300" />
              {query && <button onClick={() => setQuery('')} className="text-gray-400 hover:text-gray-600">✕</button>}
            </div>

            {loading && <div className="p-6 text-center text-[#DD2476] font-bold">מחפש...</div>}

            {!loading && results.length > 0 && (
              <div className="max-h-80 overflow-y-auto">
                {results.map((item, i) => (
                  <button key={i} onClick={() => handleSelect(item)}
                    className="w-full flex items-center gap-3 px-5 py-3 hover:bg-gray-50 transition-colors text-right">
                    <span className="text-xl flex-shrink-0">{icons[item.type]}</span>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-gray-800 truncate">{item.name}</p>
                      <p className="text-xs text-gray-400">{labels[item.type]}{item.artistName ? ` · ${item.artistName}` : ''}</p>
                    </div>
                  </button>
                ))}
              </div>
            )}

            {!loading && query && results.length === 0 && (
              <div className="p-6 text-center text-gray-400">לא נמצאו תוצאות</div>
            )}

            {!query && (
              <div className="p-6 text-center text-gray-300 text-sm">התחל להקליד לחיפוש...</div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
