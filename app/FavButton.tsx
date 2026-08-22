// app/FavButton.tsx
'use client';
import { useFavorites } from './FavoritesContext';
import { useAuth } from './AuthContext';

type Song = { id: string; name: string; artistName?: string; albumName?: string; };

export default function FavButton({ song, size = 'md' }: { song: Song; size?: 'sm' | 'md' }) {
  const { toggleSong, isFavSong } = useFavorites();
  const { user, signInWithGoogle } = useAuth();
  const fav = isFavSong(song.id);

  function handleClick(e: React.MouseEvent) {
    e.stopPropagation();
    if (!user) {
      if (confirm('כדי לשמור מועדפים צריך להתחבר עם Google. להתחבר עכשיו?')) {
        signInWithGoogle();
      }
      return;
    }
    toggleSong(song);
  }

  return (
    <button onClick={handleClick} aria-label={fav ? 'הסר ממועדפים' : 'הוסף למועדפים'}
      className={`flex-shrink-0 transition-all duration-200 rounded-full hover:scale-110 active:scale-95 ${
        size === 'sm' ? 'p-1' : 'p-2'
      }`}>
      {fav ? (
        <svg width={size === 'sm' ? 18 : 22} height={size === 'sm' ? 18 : 22} viewBox="0 0 24 24" fill="#DD2476">
          <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
        </svg>
      ) : (
        <svg width={size === 'sm' ? 18 : 22} height={size === 'sm' ? 18 : 22} viewBox="0 0 24 24" fill="none" stroke="#ccc" strokeWidth="2">
          <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
        </svg>
      )}
    </button>
  );
}
