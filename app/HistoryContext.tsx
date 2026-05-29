// app/HistoryContext.tsx
'use client';
import { createContext, useContext, useState, useCallback, useEffect } from 'react';

type Song = { id: string; name: string; artistName?: string; albumName?: string; listenedAt: number; };

type HistoryCtx = {
  history: Song[];
  addToHistory: (song: Omit<Song, 'listenedAt'>) => void;
  clearHistory: () => void;
};

const Ctx = createContext<HistoryCtx | null>(null);
const LS_KEY = 'yallah_history';
const MAX_ITEMS = 50;

export function HistoryProvider({ children }: { children: React.ReactNode }) {
  const [history, setHistory] = useState<Song[]>([]);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(LS_KEY);
      if (saved) setHistory(JSON.parse(saved));
    } catch {}
  }, []);

  const addToHistory = useCallback((song: Omit<Song, 'listenedAt'>) => {
    setHistory(prev => {
      // הסר כפילות אם כבר קיים
      const filtered = prev.filter(s => s.id !== song.id);
      const updated = [{ ...song, listenedAt: Date.now() }, ...filtered].slice(0, MAX_ITEMS);
      try { localStorage.setItem(LS_KEY, JSON.stringify(updated)); } catch {}
      return updated;
    });
  }, []);

  const clearHistory = useCallback(() => {
    setHistory([]);
    try { localStorage.removeItem(LS_KEY); } catch {}
  }, []);

  return (
    <Ctx.Provider value={{ history, addToHistory, clearHistory }}>
      {children}
    </Ctx.Provider>
  );
}

export function useHistory() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useHistory must be used within HistoryProvider');
  return ctx;
}
