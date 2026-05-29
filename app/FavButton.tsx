// app/FavButton.tsx — כפתור לב שניתן לייבא בכל מקום
'use client';
import { useFavorites } from './FavoritesContext';

type Song = { id: string; name: string; artistName?: string; albumName?: string; };

export default function FavButton({ song, size = 'md' }: { song: Song; size?: 'sm' | 'md' }) {
  const { toggle, isFav } = useFavorites();
  const fav = isFav(song.id);

  return (
    <button
      onClick={e => { e.stopPropagation(); toggle(song); }}
      aria-label={fav ? 'הסר ממועדפים' : 'הוסף למועדפים'}
      className={`flex-shrink-0 transition-all duration-200 rounded-full hover:scale-110 active:scale-95 ${
        size === 'sm' ? 'text-lg p-1' : 'text-xl p-2'
      } ${fav ? 'text-red-500' : 'text-gray-300 hover:text-red-400'}`}
    >
      {fav ? '❤️' : '🤍'}
    </button>
  );
}
