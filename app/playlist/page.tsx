// app/playlist/page.tsx
'use client';
import { useState, useEffect, useMemo } from 'react';
import { usePlayer } from '@/app/PlayerContext';
import { useFavorites } from '@/app/FavoritesContext';
import { useAuth } from '@/app/AuthContext';
import { PlayIcon, DownloadIcon, MusicNoteIcon } from '@/app/Icons';
import BackButton from '@/app/BackButton';

const AUDIO = /\.(mp3|m4a|aac|wav|flac|ogg|opus|wma)$/i;

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export default function PlaylistPage() {
  const { favoriteAlbums } = useFavorites();
  const { user, signInWithGoogle } = useAuth();
  const { play, currentIndex, songs: globalSongs } = usePlayer();
  const [songs, setSongs] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // שולף את כל השירים מהזמרים/אלבומים המועדפים
  useEffect(() => {
    if (!user || favoriteAlbums.length === 0) return;
    setLoading(true);

    async function fetchAll() {
      const BASE = 'https://music-site-flame.vercel.app/api/drive';
      const allSongs: any[] = [];

      await Promise.all(favoriteAlbums.map(async (album) => {
        try {
          const res = await fetch(`${BASE}?folderId=${album.id}`);
          const contents = await res.json();

          // שירים ישירים
          const direct = contents.filter((f: any) =>
            f.mimeType !== 'application/vnd.google-apps.folder' && AUDIO.test(f.name)
          );
          direct.forEach((s: any) => allSongs.push({ ...s, sourceName: album.name }));

          // תת-תיקיות
          const subFolders = contents.filter((f: any) => f.mimeType === 'application/vnd.google-apps.folder');
          await Promise.all(subFolders.map(async (folder: any) => {
            const res2 = await fetch(`${BASE}?folderId=${folder.id}`);
            const items = await res2.json();
            items.filter((f: any) => f.mimeType !== 'application/vnd.google-apps.folder' && AUDIO.test(f.name))
              .forEach((s: any) => allSongs.push({ ...s, sourceName: album.name }));
          }));
        } catch {}
      }));

      setSongs(shuffle(allSongs));
      setLoading(false);
    }

    fetchAll();
  }, [user, favoriteAlbums]);

  const isThisPlaylist = globalSongs.length > 0 && songs.length > 0 && globalSongs[0]?.id === songs[0]?.id;
  const activeIndex = isThisPlaylist ? currentIndex : -1;

  if (!user) return (
    <main className="min-h-screen bg-gradient-to-br from-[#ffecd2] via-[#fcb69f] to-[#ffd1a9] pb-48" dir="rtl">
      <header className="bg-gradient-to-r from-[#FF512F] to-[#DD2476] p-6 text-center shadow-2xl">
        <BackButton />
        <h1 className="text-3xl font-black text-white flex items-center justify-center gap-3">
          <MusicNoteIcon size={32} color="white" /> הפלייליסט שלי
        </h1>
      </header>
      <div className="text-center py-20">
        <p className="text-6xl mb-4">🎵</p>
        <p className="text-xl font-black text-[#DD2476] mb-2">צריך להתחבר</p>
        <button onClick={signInWithGoogle}
          className="inline-flex items-center gap-3 bg-white border-2 border-gray-200 rounded-2xl px-6 py-3 font-bold text-gray-700 hover:border-[#DD2476] shadow mt-4">
          התחבר עם Google
        </button>
      </div>
    </main>
  );

  return (
    <main className="min-h-screen bg-gradient-to-br from-[#ffecd2] via-[#fcb69f] to-[#ffd1a9] pb-48" dir="rtl">
      <header className="bg-gradient-to-r from-[#FF512F] to-[#DD2476] p-6 text-center shadow-2xl">
        <BackButton />
        <h1 className="text-3xl font-black text-white flex items-center justify-center gap-3">
          <MusicNoteIcon size={32} color="white" /> הפלייליסט שלי
        </h1>
        {songs.length > 0 && (
          <button onClick={() => play(songs, 0)}
            className="mt-3 inline-flex items-center gap-2 bg-white/20 border border-white/40 text-white font-bold px-5 py-2 rounded-full hover:bg-white/30 transition-colors text-sm">
            <PlayIcon size={16} color="white" /> נגן הכל ({songs.length} שירים)
          </button>
        )}
      </header>

      <div className="px-6 pt-6">
        {loading && (
          <div className="text-center py-20 text-[#DD2476] font-bold text-xl animate-pulse">
            טוען שירים... 🎵
          </div>
        )}

        {!loading && favoriteAlbums.length === 0 && (
          <div className="text-center py-20">
            <p className="text-6xl mb-4">🤍</p>
            <p className="text-xl font-black text-[#DD2476] mb-2">אין זמרים מועדפים עדיין</p>
            <p className="text-gray-500">סמן ❤️ על זמרים ואלבומים כדי שיופיעו כאן</p>
          </div>
        )}

        {!loading && songs.length > 0 && (
          <div className="flex flex-col gap-3">
            <p className="text-gray-500 text-sm mb-1">{songs.length} שירים מעורבבים</p>
            {songs.map((song, idx) => {
              const isActive = activeIndex === idx;
              return (
                <div key={`${song.id}-${idx}`} onClick={() => play(songs, idx)}
                  className={`rounded-2xl p-3 flex items-center gap-3 shadow-md cursor-pointer transition-all duration-200 ${
                    isActive
                      ? 'bg-gradient-to-l from-[#FF512F]/20 to-[#DD2476]/20 border-2 border-[#DD2476] scale-[1.01]'
                      : 'bg-[#ffe8cc] hover:bg-[#ffd9aa] border-2 border-transparent'
                  }`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 font-black text-sm ${isActive ? 'bg-[#DD2476] text-white' : 'bg-white/60 text-gray-400'}`}>
                    {isActive ? <PlayIcon size={14} color="white" /> : idx + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className={`font-bold truncate text-sm ${isActive ? 'text-[#DD2476]' : 'text-gray-800'}`}>
                      {song.name.replace(/\.[^/.]+$/, '')}
                    </h3>
                    <p className="text-xs text-gray-500 truncate">{song.sourceName}</p>
                  </div>
                  <div className="flex gap-2 flex-shrink-0" onClick={e => e.stopPropagation()}>
                    <button onClick={() => play(songs, idx)}
                      className={`flex items-center gap-1 px-3 py-2 rounded-xl text-sm font-black ${isActive ? 'bg-[#DD2476] text-white' : 'bg-[#DD2476] text-white hover:opacity-80'}`}>
                      <PlayIcon size={14} color="white" />
                    </button>
                    <a href={`https://drive.google.com/uc?export=download&id=${song.id}`}
                      onClick={e => e.stopPropagation()}
                      className="flex items-center gap-1 bg-[#FF512F] text-white px-3 py-2 rounded-xl text-sm font-black hover:opacity-80">
                      <DownloadIcon size={14} color="white" />
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <footer className="bg-[#ffe8cc] text-center py-6 mt-8">
        <p className="text-[#DD2476] font-bold">✨ ♩ ♪ ♫ ♬ יאללה שירים 💪 ♬ ♫ ♪ ♩ ✨</p>
        <p className="text-gray-500 text-sm mt-2">© כל הזכויות שמורות | By Yael</p>
      </footer>
    </main>
  );
}
