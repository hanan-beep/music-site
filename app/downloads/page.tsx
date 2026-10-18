// app/downloads/page.tsx — שירים שנשמרו במכשיר (עובדים גם בלי אינטרנט)
'use client';
import { useEffect, useState } from 'react';
import { usePlayer } from '@/app/PlayerContext';
import { getSaved, type OfflineMeta } from '@/lib/offline';
import PageHero from '@/app/PageHero';
import EmptyState from '@/app/EmptyState';
import SongRow from '@/app/SongRow';
import PlayAllButton from '@/app/PlayAllButton';
import { DownloadIcon } from '@/app/Icons';

export default function DownloadsPage() {
  const [saved, setSaved] = useState<OfflineMeta[]>([]);
  const { play, currentIndex, songs: queue } = usePlayer();
  const nowId = currentIndex >= 0 ? queue[currentIndex]?.id : null;

  useEffect(() => {
    const refresh = () => setSaved(getSaved());
    refresh();
    window.addEventListener('offline-changed', refresh);
    return () => window.removeEventListener('offline-changed', refresh);
  }, []);

  return (
    <main className="min-h-screen" dir="rtl">
      <PageHero title="שמורים במכשיר" meta={saved.length ? `${saved.length} שירים שמתנגנים גם בלי אינטרנט` : undefined}>
        <PlayAllButton songs={saved} />
      </PageHero>
      <div className="mx-auto max-w-4xl px-4 py-6 sm:px-6">
        {saved.length > 0 ? (
          <ul className="space-y-2">
            {saved.map((song, idx) => (
              <SongRow key={song.id} song={song} sub={[song.artistName, song.albumName].filter(Boolean).join(' • ')}
                active={nowId === song.id} onPlay={() => play(saved, idx)} />
            ))}
          </ul>
        ) : (
          <EmptyState icon={<DownloadIcon size={36} color="white" />} title="עדיין לא שמרתם שירים"
            text="בתפריט (שלוש הנקודות) ליד כל שיר יש “שמור להאזנה ללא אינטרנט”" href="/songs" cta="לדף השירים" />
        )}
      </div>
      <footer className="px-6 pb-10 pt-6 text-center text-sm text-[#1B1033]/50">© כל הזכויות שמורות | By Yael</footer>
    </main>
  );
}
