// app/AlbumFavButton.tsx
'use client';
import { useFavorites } from './FavoritesContext';
import { useAuth } from './AuthContext';

type Album = { id: string; name: string; artistName?: string; };

export default function AlbumFavButton({ album }: { album: Album }) {
  const { toggleAlbum, isFavAlbum } = useFavorites();
  const { user, signInWithGoogle } = useAuth();
  const fav = isFavAlbum(album.id);

  function handleClick(e: React.MouseEvent) {
    e.preventDefault(); e.stopPropagation();
    if (!user) {
      if (confirm('כדי לשמור מועדפים צריך להתחבר עם Google. להתחבר עכשיו?')) signInWithGoogle();
      return;
    }
    toggleAlbum(album);
  }

  return (
    <button onClick={handleClick} aria-label={fav ? 'הסר ממועדפים' : 'הוסף למועדפים'}
      className="absolute top-2 left-2 p-1.5 bg-white/80 rounded-full shadow hover:scale-110 transition-transform">
      {fav ? (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="#DD2476">
          <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
        </svg>
      ) : (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#DD2476" strokeWidth="2">
          <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
        </svg>
      )}
    </button>
  );
}
