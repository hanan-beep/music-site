// app/PlayerContext.tsx
'use client';
import { createContext, useContext, useState, useCallback } from 'react';

type Song = { id: string; name: string; artistName?: string; albumName?: string };

type PlayerCtx = {
  songs: Song[];
  currentIndex: number;
  play: (songs: Song[], index: number) => void;
  playIndex: (index: number) => void;
  close: () => void;
};

const Ctx = createContext<PlayerCtx | null>(null);

export function PlayerProvider({ children }: { children: React.ReactNode }) {
  const [songs, setSongs] = useState<Song[]>([]);
  const [currentIndex, setCurrentIndex] = useState(-1);

  const play = useCallback((newSongs: Song[], index: number) => {
    setSongs(newSongs);
    setCurrentIndex(index);
  }, []);

  const playIndex = useCallback((index: number) => {
    if (index >= 0 && index < songs.length) setCurrentIndex(index);
  }, [songs]);

  const close = useCallback(() => setCurrentIndex(-1), []);

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
