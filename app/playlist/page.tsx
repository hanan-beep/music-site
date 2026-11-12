// app/playlist/page.tsx
'use client';
import { useState, useEffect, useMemo } from 'react';
import { usePlayer } from '@/app/PlayerContext';
import { useFavorites } from '@/app/FavoritesContext';
import { useAuth } from '@/app/AuthContext';
import PageHero from '@/app/PageHero';
import SignInPrompt from '@/app/SignInPrompt';
import EmptyState from '@/app/EmptyState';
import SongRow from '@/app/SongRow';
import PlayAllButton from '@/app/PlayAllButton';
import { PlaylistIcon } from '@/app/Icons';

const AUDIO = /\.(mp3|m4a|aac|wav|flac|ogg|opus|wma)$/i;

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export default function PlaylistPage() {
  const { favoriteAlbums } = useFavorites();
  const { user } = useAuth();
  const { play, currentIndex, songs: queue } = usePlayer();
  const [raw, setRaw] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // שולף את כל השירים מהזמרים/אלבומים המועדפים
  useEffect(() => {
    if (!user || favoriteAlbums.length === 0) return;
    setLoading(true);
    async function fetchAll() {
      const BASE = '/api/drive';
      const all: any[] = [];
      await Promise.all(favoriteAlbums.map(async (album) => {
        try {
          const contents = await (await fetch(`${BASE}?folderId=${album.id}`)).json();
          contents.filter((f: any) => f.mimeType !== 'application/vnd.google-apps.folder' && AUDIO.test(f.name))
            .forEach((s: any) => all.push({ ...s, sourceName: album.name }));
          const subFolders = contents.filter((f: any) => f.mimeType === 'application/vnd.google-apps.folder');
          await Promise.all(subFolders.map(async (folder: any) => {
            const items = await (await fetch(`${BASE}?folderId=${folder.id}`)).json();
            items.filter((f: any) => f.mimeType !== 'application/vnd.google-apps.folder' && AUDIO.test(f.name))
              .forEach((s: any) => all.push({ ...s, sourceName: album.name }));
          }));
        } catch {}
      }));
      setRaw(shuffle(all));
      setLoading(false);
    }
    fetchAll();
  }, [user, favoriteAlbums]);

  const songs = useMemo(() => raw.map(s => ({ id: s.id as string, name: s.name as string, artistName: s.sourceName as string })), [raw]);
  const nowId = currentIndex >= 0 ? queue[currentIndex]?.id : null;

  if (!user) return (
    <main className="min-h-screen" dir="rtl">
      <PageHero title="הפלייליסט שלי" />
      <SignInPrompt title="צריך להתחבר" text="הפלייליסט נבנה אוטומטית מהזמרים והאלבומים שסימנתם באהבה" />
    </main>
  );

  return (
    <main className="min-h-screen" dir="rtl">
      <PageHero title="הפלייליסט שלי" meta={songs.length ? `${songs.length} שירים מעורבבים מהמועדפים שלכם` : undefined}>
        <PlayAllButton songs={songs} />
      </PageHero>

      <div className="mx-auto max-w-4xl px-4 py-6 sm:px-6">
        {loading && (
          <div className="flex items-center justify-center gap-3 py-20 font-bold text-[#DD2476]">
            <svg className="animate-spin" width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round"><path d="M12 3a9 9 0 1 0 9 9" /></svg>
            טוענים שירים...
          </div>
        )}

        {!loading && favoriteAlbums.length === 0 && (
          <EmptyState icon={<PlaylistIcon size={36} color="white" />} title="אין זמרים מועדפים עדיין"
            text="סמנו לב על זמרים ואלבומים, והשירים שלהם יופיעו כאן מעורבבים" href="/artists" cta="לדף הזמרים" />
        )}

        {!loading && songs.length > 0 && (
          <ul className="space-y-2">
            {songs.map((song, idx) => (
              <SongRow key={`${song.id}-${idx}`} song={song} sub={song.artistName}
                active={nowId === song.id} onPlay={() => play(songs, idx)} />
            ))}
          </ul>
        )}
      </div>
      <footer className="px-6 pb-10 pt-6 text-center text-sm text-[#1B1033]/50">© כל הזכויות שמורות | By Yael</footer>
    </main>
  );
}
