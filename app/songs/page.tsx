// app/songs/page.tsx
'use client';
import { useState, useEffect, useMemo } from 'react';

const EXTRA_FOLDER_ID = '1b6Z7prAcoSS8fwpk8hqsD6g-loB-hbn1';

// רק קבצי אודיו
const AUDIO_EXTENSIONS = /\.(mp3|m4a|aac|wav|flac|ogg|opus|wma)$/i;

export default function Songs() {
  const [songs, setSongs] = useState<any[]>([]);
  const [extraSongs, setExtraSongs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [current, setCurrent] = useState<any>(null);
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState<'alpha-asc' | 'alpha-desc' | 'newest'>('alpha-asc');

  useEffect(() => {
    async function load() {
      const BASE = 'https://music-site-flame.vercel.app/api/drive';

      // שולף זמרים
      const artistsRes = await fetch(BASE);
      const artists = await artistsRes.json();

      // שולף תוכן כל זמר
      const artistContents = await Promise.all(
        artists.map(async (artist: any) => {
          const res = await fetch(`${BASE}?folderId=${artist.id}`);
          return { artist, contents: await res.json() };
        })
      );

      // שולף שירים מתוך האלבומים
      const albumFetches = await Promise.all(
        artistContents.flatMap(({ artist, contents }) => {
          const folders = contents.filter(
            (f: any) => f.mimeType === 'application/vnd.google-apps.folder'
          );
          const directSongs = contents
            .filter((f: any) =>
              f.mimeType !== 'application/vnd.google-apps.folder' &&
              AUDIO_EXTENSIONS.test(f.name)
            )
            .map((s: any) => ({ ...s, artistName: artist.name, albumName: '' }));

          return [
            Promise.resolve(directSongs),
            ...folders.map(async (folder: any) => {
              const res = await fetch(`${BASE}?folderId=${folder.id}`);
              const items = await res.json();
              return items
                .filter((f: any) =>
                  f.mimeType !== 'application/vnd.google-apps.folder' &&
                  AUDIO_EXTENSIONS.test(f.name)
                )
                .map((s: any) => ({
                  ...s,
                  artistName: artist.name,
                  albumName: folder.name,
                }));
            }),
          ];
        })
      );

      // תיקייה נוספת — שירים חדשים (שומרים בסדר המקורי מהדרייב)
      let extra: any[] = [];
      if (EXTRA_FOLDER_ID) {
        const res = await fetch(`${BASE}?folderId=${EXTRA_FOLDER_ID}`);
        const items = await res.json();
        extra = items
          .filter((f: any) =>
            f.mimeType !== 'application/vnd.google-apps.folder' &&
            AUDIO_EXTENSIONS.test(f.name)
          )
          .map((s: any, index: number) => ({
            ...s,
            artistName: '',
            albumName: 'שירים חדשים',
            driveOrder: index, // סדר מקורי מהדרייב = מהחדש לישן
          }));
      }

      setSongs(albumFetches.flat());
      setExtraSongs(extra);
      setLoading(false);
    }
    load();
  }, []);

  const allSongs = useMemo(() => [...songs, ...extraSongs], [songs, extraSongs]);

  const filtered = useMemo(() => {
    let list = allSongs.filter(s =>
      s.name.replace(/\.[^/.]+$/, '').toLowerCase().includes(search.toLowerCase()) ||
      (s.artistName || '').toLowerCase().includes(search.toLowerCase())
    );

    if (sort === 'newest') {
      // מציג רק שירים מהתיקייה החדשה, בסדר הדרייב
      list = extraSongs
        .filter(s =>
          s.name.replace(/\.[^/.]+$/, '').toLowerCase().includes(search.toLowerCase()) ||
          (s.artistName || '').toLowerCase().includes(search.toLowerCase())
        )
        .sort((a, b) => a.driveOrder - b.driveOrder);
    } else {
      list = [...list].sort((a, b) => {
        const nameA = a.name.replace(/\.[^/.]+$/, '');
        const nameB = b.name.replace(/\.[^/.]+$/, '');
        return sort === 'alpha-asc'
          ? nameA.localeCompare(nameB, 'he')
          : nameB.localeCompare(nameA, 'he');
      });
    }
    return list;
  }, [allSongs, extraSongs, search, sort]);

  return (
    <main className="min-h-screen bg-gradient-to-br from-[#ffecd2] via-[#fcb69f] to-[#ffd1a9] pb-32" dir="rtl">

      <header className="bg-gradient-to-r from-[#FF512F] to-[#DD2476] p-6 text-center shadow-2xl">
        <a href="/" className="text-white text-sm mb-2 block">→ חזרה לדף הבית</a>
        <h1 className="text-3xl font-black text-white">🎵 שירים</h1>
      </header>

      <div className="px-6 pt-6 pb-2 flex flex-col sm:flex-row gap-3">
        <input
          type="text"
          placeholder="🔍 חיפוש שיר או זמר..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="flex-1 rounded-2xl px-4 py-3 border-2 border-[#DD2476]/30 bg-white/80 text-gray-800 font-bold placeholder-gray-400 focus:outline-none focus:border-[#DD2476] shadow"
        />
        <select
          value={sort}
          onChange={e => setSort(e.target.value as any)}
          className="rounded-2xl px-4 py-3 border-2 border-[#DD2476]/30 bg-white/80 text-gray-800 font-bold focus:outline-none focus:border-[#DD2476] shadow"
        >
          <option value="alpha-asc">א ← ת</option>
          <option value="alpha-desc">ת ← א</option>
          <option value="newest">🆕 חדשים ביותר</option>
        </select>
      </div>

      {loading ? (
        <div className="text-center py-20 text-[#DD2476] font-bold text-xl animate-pulse">
          טוען שירים... 🎵
        </div>
      ) : (
        <section className="flex flex-col gap-3 p-6">
          <p className="text-gray-500 text-sm mb-1">{filtered.length} שירים</p>
          {filtered.map((song: any) => (
            <div key={song.id}
              className="bg-[#ffe8cc] rounded-2xl p-4 flex items-center justify-between shadow-md gap-3">
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-gray-800 truncate">
                  {song.name.replace(/\.[^/.]+$/, '')}
                </h3>
                {(song.artistName || song.albumName) && (
                  <p className="text-sm text-[#DD2476] font-semibold truncate">
                    {song.artistName && `🎤 ${song.artistName}`}
                    {song.artistName && song.albumName && ' · '}
                    {song.albumName && song.albumName}
                  </p>
                )}
              </div>
              <div className="flex gap-2 flex-shrink-0">
                <button
                  onClick={() => setCurrent(song)}
                  className="bg-[#DD2476] text-white px-4 py-2 rounded-full text-sm font-bold hover:opacity-80"
                >
                  ▶️ האזן
                </button>
                <a
                  href={`https://drive.google.com/uc?export=download&id=${song.id}`}
                  className="bg-[#FF512F] text-white px-4 py-2 rounded-full text-sm font-bold hover:opacity-80"
                >
                  ⬇️ הורד
                </a>
              </div>
            </div>
          ))}
          {filtered.length === 0 && (
            <p className="text-center text-gray-500 py-10">לא נמצאו שירים</p>
          )}
        </section>
      )}

      {current && (
        <div className="fixed bottom-0 left-0 right-0 w-full shadow-2xl" style={{ zIndex: 100 }}>
          <div className="bg-gradient-to-r from-[#FF512F] to-[#DD2476] px-6 py-2 flex items-center justify-between w-full">
            <p className="font-black text-white text-lg truncate">
              🎵 {current.name.replace(/\.[^/.]+$/, '')}
            </p>
            <button
              onClick={() => setCurrent(null)}
              className="text-white hover:opacity-70 text-2xl font-bold ml-4 flex-shrink-0"
            >
              ✕
            </button>
          </div>
          <div className="w-full bg-black" style={{ height: 80 }}>
            <iframe
              key={current.id}
              src={`https://drive.google.com/file/d/${current.id}/preview`}
              style={{ width: '100%', height: '80px', display: 'block', border: 'none' }}
              allow="autoplay"
            />
          </div>
        </div>
      )}

      <footer className="bg-[#ffe8cc] text-center py-6 mt-8">
        <p className="text-[#DD2476] font-bold">✨ ♩ ♪ ♫ ♬ יאללה שירים 💪 ♬ ♫ ♪ ♩ ✨</p>
        <p className="text-gray-500 text-sm mt-2">© כל הזכויות שמורות | By Yael</p>
      </footer>
    </main>
  );
}
