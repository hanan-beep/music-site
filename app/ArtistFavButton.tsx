// app/ArtistFavButton.tsx
'use client';
import { useFavorites } from './FavoritesContext';
import { useAuth } from './AuthContext';
import { HeartIcon } from './Icons';

type Artist = { id: string; name: string; };

export default function ArtistFavButton({ artist }: { artist: Artist }) {
  const { toggleAlbum, isFavAlbum } = useFavorites();
  const { user, signInWithGoogle } = useAuth();
  const fav = isFavAlbum(artist.id);

  function handleClick(e: React.MouseEvent) {
    e.preventDefault(); e.stopPropagation();
    if (!user) {
      if (confirm('כדי לשמור מועדפים צריך להתחבר עם Google. להתחבר עכשיו?')) signInWithGoogle();
      return;
    }
    toggleAlbum({ id: artist.id, name: artist.name });
  }

  return (
    <button onClick={handleClick}
      aria-label={fav ? 'הסר ממועדפים' : 'הוסף למועדפים'}
      className="p-2 rounded-full hover:scale-110 transition-transform flex-shrink-0">
      <HeartIcon size={24} filled={fav} color={fav ? '#FF6B9D' : 'white'} />
    </button>
  );
}
