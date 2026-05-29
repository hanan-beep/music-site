// app/favorites/page.tsx
'use client';
import Link from 'next/link';
import { useFavorites } from '@/app/FavoritesContext';
import { usePlayer } from '@/app/PlayerContext';
import FavButton from '@/app/FavButton';
import BackButton from '@/app/BackButton';

export default function FavoritesPage() {
  const { favorites } = useFavorites();
  const { play } = usePlayer();

  return (
    <main className="min-h-screen bg-gradient-to-br from-[#ffecd2] via-[#fcb69f] to-[#ffd1a9] pb-48" dir="rtl">
      <header className="bg-gradient-to-r from-[#FF512F] to-[#DD2476] p-6 text-center shadow-2xl">
        <BackButton />
        <h1 className="text-3xl font-black text-white">❤️ מועדפים</h1>
      </header>

      <div className="px-6 pt-6">
        {favorites.length > 0 ? (
          <>
            <p className="text-gray-500 text-sm mb-4">{favorites.length} שירים שמורים</p>
            <div className="flex flex-col gap-3">
              {favorites.map((song, idx) => (
                <div key={song.id} onClick={() => play(favorites, idx)}
                  className="bg-[#ffe8cc] rounded-2xl p-4 flex items-center gap-3 shadow-md cursor-pointer hover:bg-[#ffd9aa] transition-colors border-2 border-transparent hover:border-[#DD2476]/30">
                  <div className="w-11 h-11 rounded-xl flex-shrink-0 overflow-hidden border-2 border-white shadow">
                    <img src="/logo.png" alt="" className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-gray-800 truncate text-sm">
                      {song.name.replace(/\.[^/.]+$/, '')}
                    </h3>
                    {song.artistName && (
                      <p className="text-xs text-gray-500 truncate">🎤 {song.artistName}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0" onClick={e => e.stopPropagation()}>
                    <FavButton song={song} />
                    <button onClick={() => play(favorites, idx)}
                      className="bg-[#DD2476] text-white px-3 py-2 rounded-xl text-sm font-black hover:opacity-80">
                      ▶ האזן
                    </button>
                    <a href={`https://drive.google.com/uc?export=download&id=${song.id}`}
                      className="bg-[#FF512F] text-white px-3 py-2 rounded-xl text-sm font-black hover:opacity-80">
                      ⬇
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className="text-center py-20">
            <p className="text-6xl mb-4">🤍</p>
            <p className="text-xl font-black text-[#DD2476] mb-2">אין לך מועדפים עדיין</p>
            <p className="text-gray-500 mb-6">לחץ על ❤️ ליד שיר כדי לשמור אותו</p>
            <Link href="/songs"
              className="inline-block bg-gradient-to-r from-[#FF512F] to-[#DD2476] text-white font-black px-8 py-3 rounded-2xl hover:scale-105 transition-transform shadow">
              🎵 לדף השירים
            </Link>
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
