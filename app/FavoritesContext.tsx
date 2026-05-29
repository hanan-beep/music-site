// app/FavoritesContext.tsx
'use client';
import { createContext, useContext, useState, useCallback, useEffect } from 'react';

type Song = { id: string; name: string; artistName?: string; albumName?: string; };

type FavCtx = {
  favorites: Song[];
  toggle: (song: Song) => void;
  isFav: (id: string) => boolean;
};

const Ctx = createContext<FavCtx | null>(null);
const LS_KEY = 'yallah_favorites';

export function FavoritesProvider({ children }: { children: React.ReactNode }) {
  const [favorites, setFavorites] = useState<Song[]>([]);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(LS_KEY);
      if (saved) setFavorites(JSON.parse(saved));
    } catch {}
  }, []);

  const toggle = useCallback((song: Song) => {
    setFavorites(prev => {
      const exists = prev.some(s => s.id === song.id);
      const updated = exists ? prev.filter(s => s.id !== song.id) : [song, ...prev];
      try { localStorage.setItem(LS_KEY, JSON.stringify(updated)); } catch {}
      return updated;
    });
  }, []);

  const isFav = useCallback((id: string) => favorites.some(s => s.id === id), [favorites]);

  return (
    <Ctx.Provider value={{ favorites, toggle, isFav }}>
      {children}
    </Ctx.Provider>
  );
}

export function useFavorites() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useFavorites must be used within FavoritesProvider');
  return ctx;
}
