// app/PlayerContext.tsx
'use client';
import { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';

type Song = { id: string; name: string; artistName?: string; albumName?: string };
type PlayerCtx = {
  songs: Song[];
  currentIndex: number;
  play: (songs: Song[], index: number) => void;
  playIndex: (index: number) => void;
  close: () => void;
};

const Ctx = createContext<PlayerCtx | null>(null);
const LS_KEY = 'yallah_player_v2';

export function PlayerProvider({ children }: { children: React.ReactNode }) {
  const [songs, setSongs] = useState<Song[]>([]);
  const [currentIndex, setCurrentIndex] = useState(-1);
  const initialized = useRef(false);

  // טעינה מ-localStorage רק בצד הלקוח
  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;
    try {
      const saved = localStorage.getItem(LS_KEY);
      if (saved) {
        const { s, i } = JSON.parse(saved);
        if (Array.isArray(s) && s.length > 0 && typeof i === 'number' && i >= 0) {
          setSongs(s);
          setCurrentIndex(i);
        }
      }
    } catch {}
  }, []);

  // שמירה ל-localStorage
  useEffect(() => {
    if (!initialized.current) return;
    try {
      if (currentIndex >= 0 && songs.length > 0) {
        localStorage.setItem(LS_KEY, JSON.stringify({ s: songs, i: currentIndex }));
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
    setSongs(prev => {
      if (index >= 0 && index < prev.length) setCurrentIndex(index);
      return prev;
    });
  }, []);

  const close = useCallback(() => {
    setCurrentIndex(-1);
    try { localStorage.removeItem(LS_KEY); } catch {}
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
