// app/FavoritesContext.tsx
'use client';
import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { createClient } from '@/lib/supabase';
import { useAuth } from './AuthContext';

type Song = { id: string; name: string; artistName?: string; albumName?: string; };
type Album = { id: string; name: string; artistName?: string; };

type FavCtx = {
  favorites: Song[];
  favoriteAlbums: Album[];
  toggleSong: (song: Song) => void;
  toggleAlbum: (album: Album) => void;
  isFavSong: (id: string) => boolean;
  isFavAlbum: (id: string) => boolean;
};

const Ctx = createContext<FavCtx | null>(null);

export function FavoritesProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [favorites, setFavorites] = useState<Song[]>([]);
  const [favoriteAlbums, setFavoriteAlbums] = useState<Album[]>([]);
  const supabase = createClient();

  // טעינת מועדפים
  useEffect(() => {
    if (!user) {
      // לא מחובר — נקה
      setFavorites([]);
      setFavoriteAlbums([]);
      return;
    }
    // טעינה מ-Supabase
    async function load() {
      const [{ data: songs }, { data: albums }] = await Promise.all([
        supabase.from('favorites').select('*').eq('user_id', user!.email),
        supabase.from('favorite_albums').select('*').eq('user_id', user!.email),
      ]);
      setFavorites((songs || []).map((s: any) => ({ id: s.song_id, name: s.song_name, artistName: s.artist_name, albumName: s.album_name })));
      setFavoriteAlbums((albums || []).map((a: any) => ({ id: a.album_id, name: a.album_name, artistName: a.artist_name })));
    }
    load();
  }, [user]);

  const toggleSong = useCallback(async (song: Song) => {
    if (!user) return;
    const exists = favorites.some(s => s.id === song.id);
    if (exists) {
      await supabase.from('favorites').delete().eq('user_id', user.email).eq('song_id', song.id);
      setFavorites(prev => prev.filter(s => s.id !== song.id));
    } else {
      await supabase.from('favorites').insert({ user_id: user.email, song_id: song.id, song_name: song.name, artist_name: song.artistName, album_name: song.albumName });
      setFavorites(prev => [song, ...prev]);
    }
  }, [user, favorites]);

  const toggleAlbum = useCallback(async (album: Album) => {
    if (!user) return;
    const exists = favoriteAlbums.some(a => a.id === album.id);
    if (exists) {
      await supabase.from('favorite_albums').delete().eq('user_id', user.email).eq('album_id', album.id);
      setFavoriteAlbums(prev => prev.filter(a => a.id !== album.id));
    } else {
      await supabase.from('favorite_albums').insert({ user_id: user.email, album_id: album.id, album_name: album.name, artist_name: album.artistName });
      setFavoriteAlbums(prev => [album, ...prev]);
    }
  }, [user, favoriteAlbums]);

  const isFavSong = useCallback((id: string) => favorites.some(s => s.id === id), [favorites]);
  const isFavAlbum = useCallback((id: string) => favoriteAlbums.some(a => a.id === id), [favoriteAlbums]);

  return (
    <Ctx.Provider value={{ favorites, favoriteAlbums, toggleSong, toggleAlbum, isFavSong, isFavAlbum }}>
      {children}
    </Ctx.Provider>
  );
}

export function useFavorites() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useFavorites must be used within FavoritesProvider');
  return ctx;
}
