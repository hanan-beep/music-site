// app/HistoryContext.tsx
'use client';
import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { createClient } from '@/lib/supabase';
import { useAuth } from './AuthContext';

type Song = { id: string; name: string; artistName?: string; albumName?: string; listenedAt: number; };

type HistoryCtx = {
  history: Song[];
  addToHistory: (song: Omit<Song, 'listenedAt'>) => void;
  clearHistory: () => void;
};

const Ctx = createContext<HistoryCtx | null>(null);

export function HistoryProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [history, setHistory] = useState<Song[]>([]);
  const supabase = createClient();

  useEffect(() => {
    if (!user) { setHistory([]); return; }
    supabase.from('history').select('*').eq('user_id', user.email)
      .order('listened_at', { ascending: false }).limit(50)
      .then(({ data }) => {
        setHistory((data || []).map((s: any) => ({
          id: s.song_id, name: s.song_name,
          artistName: s.artist_name, albumName: s.album_name,
          listenedAt: new Date(s.listened_at).getTime(),
        })));
      });
  }, [user]);

  const addToHistory = useCallback(async (song: Omit<Song, 'listenedAt'>) => {
    const newSong = { ...song, listenedAt: Date.now() };
    setHistory(prev => {
      const filtered = prev.filter(s => s.id !== song.id);
      return [newSong, ...filtered].slice(0, 50);
    });
    if (!user) return;
    await supabase.from('history').insert({
      user_id: user.email, song_id: song.id, song_name: song.name,
      artist_name: song.artistName, album_name: song.albumName,
    });
  }, [user]);

  const clearHistory = useCallback(async () => {
    setHistory([]);
    if (!user) return;
    await supabase.from('history').delete().eq('user_id', user.email);
  }, [user]);

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
