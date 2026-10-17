// app/history/page.tsx
'use client';
import { useHistory } from '@/app/HistoryContext';
import { usePlayer } from '@/app/PlayerContext';
import PageHero from '@/app/PageHero';
import EmptyState from '@/app/EmptyState';
import SongRow from '@/app/SongRow';
import PlayAllButton from '@/app/PlayAllButton';
import { HistoryIcon } from '@/app/Icons';

function timeAgo(ts: number) {
  const diff = Date.now() - ts;
  const min = Math.floor(diff / 60000);
  const hr = Math.floor(diff / 3600000);
  const day = Math.floor(diff / 86400000);
  if (min < 1) return 'הרגע';
  if (min < 60) return `לפני ${min} דק׳`;
  if (hr < 24) return `לפני ${hr} שע׳`;
  if (day === 1) return 'אתמול';
  return `לפני ${day} ימים`;
}

export default function HistoryPage() {
  const { history, clearHistory } = useHistory();
  const { play, currentIndex, songs: queue } = usePlayer();
  const nowId = currentIndex >= 0 ? queue[currentIndex]?.id : null;

  return (
    <main className="min-h-screen" dir="rtl">
      <PageHero title="היסטוריית האזנה" meta={history.length ? `${history.length} שירים` : undefined}>
        <PlayAllButton songs={history} />
        {history.length > 0 && (
          <button onClick={() => { if (confirm('לנקות את כל היסטוריית ההאזנה?')) clearHistory(); }}
            className="rounded-full px-5 py-3 text-sm font-bold text-white/90 ring-1 ring-white/30 hover:bg-white/10">נקה היסטוריה</button>
        )}
      </PageHero>

      <div className="mx-auto max-w-4xl px-4 py-6 sm:px-6">
        {history.length > 0 ? (
          <ul className="space-y-2">
            {history.map((song, idx) => (
              <SongRow key={`${song.id}-${idx}`} song={song}
                sub={[song.artistName, timeAgo(song.listenedAt)].filter(Boolean).join(' • ')}
                active={nowId === song.id} onPlay={() => play(history, idx)} />
            ))}
          </ul>
        ) : (
          <EmptyState icon={<HistoryIcon size={36} color="white" />} title="עדיין לא האזנתם לשירים"
            text="כשתנגנו שיר, הוא יופיע כאן" href="/songs" cta="לדף השירים" />
        )}
      </div>
      <footer className="px-6 pb-10 pt-6 text-center text-sm text-[#1B1033]/50">© כל הזכויות שמורות | By Yael</footer>
    </main>
  );
}
