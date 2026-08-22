// app/favorites/page.tsx
'use client';
import Link from 'next/link';
import { useFavorites } from '@/app/FavoritesContext';
import { usePlayer } from '@/app/PlayerContext';
import { useAuth } from '@/app/AuthContext';
import FavButton from '@/app/FavButton';
import BackButton from '@/app/BackButton';

export default function FavoritesPage() {
  const { favorites, favoriteAlbums } = useFavorites();
  const { play } = usePlayer();
  const { user, signInWithGoogle } = useAuth();

  if (!user) return (
    <main className="min-h-screen bg-gradient-to-br from-[#ffecd2] via-[#fcb69f] to-[#ffd1a9] pb-48" dir="rtl">
      <header className="bg-gradient-to-r from-[#FF512F] to-[#DD2476] p-6 text-center shadow-2xl">
        <BackButton />
        <h1 className="text-3xl font-black text-white">❤️ מועדפים</h1>
      </header>
      <div className="text-center py-20">
        <p className="text-6xl mb-4">🔐</p>
        <p className="text-xl font-black text-[#DD2476] mb-2">צריך להתחבר</p>
        <p className="text-gray-500 mb-6">התחבר עם Google כדי לראות את המועדפים שלך</p>
        <button onClick={signInWithGoogle}
          className="inline-flex items-center gap-3 bg-white border-2 border-gray-200 rounded-2xl px-6 py-3 font-bold text-gray-700 hover:border-[#DD2476] shadow">
          <svg width="20" height="20" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          התחבר עם Google
        </button>
      </div>
    </main>
  );

  return (
    <main className="min-h-screen bg-gradient-to-br from-[#ffecd2] via-[#fcb69f] to-[#ffd1a9] pb-48" dir="rtl">
      <header className="bg-gradient-to-r from-[#FF512F] to-[#DD2476] p-6 text-center shadow-2xl">
        <BackButton />
        <h1 className="text-3xl font-black text-white">❤️ מועדפים</h1>
      </header>

      <div className="px-6 pt-6">
        {/* שירים מועדפים */}
        {favorites.length > 0 && (
          <section className="mb-8">
            <h2 className="text-xl font-black text-[#DD2476] mb-3">🎵 שירים ({favorites.length})</h2>
            <div className="flex flex-col gap-3">
              {favorites.map((song, idx) => (
                <div key={song.id} onClick={() => play(favorites, idx)}
                  className="bg-[#ffe8cc] rounded-2xl p-4 flex items-center gap-3 shadow-md cursor-pointer hover:bg-[#ffd9aa] transition-colors">
                  <div className="w-11 h-11 rounded-xl flex-shrink-0 overflow-hidden border-2 border-white shadow">
                    <img src="/logo.png" alt="" className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-gray-800 truncate text-sm">{song.name.replace(/\.[^/.]+$/, '')}</h3>
                    {song.artistName && <p className="text-xs text-gray-500 truncate">🎤 {song.artistName}</p>}
                  </div>
                  <div className="flex gap-2 flex-shrink-0" onClick={e => e.stopPropagation()}>
                    <FavButton song={song} size="sm" />
                    <button onClick={() => play(favorites, idx)} className="bg-[#DD2476] text-white px-3 py-2 rounded-xl text-sm font-black hover:opacity-80">▶</button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* אלבומים מועדפים */}
        {favoriteAlbums.length > 0 && (
          <section className="mb-8">
            <h2 className="text-xl font-black text-[#DD2476] mb-3">💿 אלבומים ({favoriteAlbums.length})</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {favoriteAlbums.map(album => (
                <Link key={album.id} href={`/album/${album.id}?name=${encodeURIComponent(album.name)}`}
                  className="bg-[#ffe8cc] rounded-2xl p-4 text-center hover:scale-105 transition-transform shadow-md block relative">
                  <div className="text-4xl mb-2">💿</div>
                  <h3 className="font-bold text-[#DD2476] text-sm leading-tight">{album.name}</h3>
                  {album.artistName && <p className="text-gray-500 text-xs mt-1">🎤 {album.artistName}</p>}
                </Link>
              ))}
            </div>
          </section>
        )}

        {favorites.length === 0 && favoriteAlbums.length === 0 && (
          <div className="text-center py-20">
            <p className="text-6xl mb-4">🤍</p>
            <p className="text-xl font-black text-[#DD2476] mb-2">אין מועדפים עדיין</p>
            <p className="text-gray-500 mb-6">לחץ על ❤️ ליד שיר או אלבום</p>
            <Link href="/songs" className="inline-block bg-gradient-to-r from-[#FF512F] to-[#DD2476] text-white font-black px-8 py-3 rounded-2xl hover:scale-105 transition-transform shadow">
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
