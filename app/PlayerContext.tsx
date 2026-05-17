// app/PlayerContext.tsx
'use client';
import { createContext, useContext, useState, useCallback, useEffect } from 'react';

type Song = { id: string; name: string; artistName?: string; albumName?: string };

type PlayerCtx = {
  songs: Song[];
  currentIndex: number;
  play: (songs: Song[], index: number) => void;
  playIndex: (index: number) => void;
  close: () => void;
};

const Ctx = createContext<PlayerCtx | null>(null);
const LS_KEY = 'yallah_player';

export function PlayerProvider({ children }: { children: React.ReactNode }) {
  const [songs, setSongs] = useState<Song[]>([]);
  const [currentIndex, setCurrentIndex] = useState(-1);

  // טעינה מ-localStorage בטעינה ראשונה
  useEffect(() => {
    try {
      const saved = localStorage.getItem(LS_KEY);
      if (saved) {
        const { songs: s, currentIndex: i } = JSON.parse(saved);
        if (s && i >= 0) { setSongs(s); setCurrentIndex(i); }
      }
    } catch {}
  }, []);

  // שמירה ל-localStorage בכל שינוי
  useEffect(() => {
    try {
      if (currentIndex >= 0 && songs.length > 0) {
        localStorage.setItem(LS_KEY, JSON.stringify({ songs, currentIndex }));
      } else {
        localStorage.removeItem(LS_KEY);
      }
    } catch {}
  }, [songs, currentIndex]);

  const play = useCallback((newSongs: Song[], index: number) => {
    setSongs(newSongs);
    setCurrentIndex(index);
  }, []);

  const playIndex = useCallback((index: number) => {
    setCurrentIndex(prev => {
      if (index >= 0 && index < songs.length) return index;
      return prev;
    });
  }, [songs.length]);

  const close = useCallback(() => {
    setCurrentIndex(-1);
    localStorage.removeItem(LS_KEY);
  }, []);

  return (
    <Ctx.Provider value={{ songs, currentIndex, play, playIndex, close }}>
      {children}
    </Ctx.Provider>
  );
}

export function usePlayer() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('usePlayer must be used within PlayerProvider');
  return ctx;
}
