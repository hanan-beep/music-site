'use client';
import { useEffect, useRef, useState } from 'react';
import { usePlayer } from './PlayerContext';
import { useHistory } from './HistoryContext';
import { PrevIcon, NextIcon, CloseIcon } from './Icons';
import FavButton from './FavButton';

const BASE = process.env.NEXT_PUBLIC_STREAM_BASE || '';
const src = (id: string) => `${BASE}/api/stream/${id}`;
const clean = (n: string) => n.replace(/\.[^/.]+$/, '');
const fmt = (s: number) => (isFinite(s) ? `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}` : '0:00');

export default function GlobalPlayer() {
  const { songs, currentIndex, playIndex, close } = usePlayer();
  const { addToHistory } = useHistory();
  const audio = useRef<HTMLAudioElement>(null);
  const preload = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);
  const [time, setTime] = useState(0);
  const [dur, setDur] = useState(0);
  const [failed, setFailed] = useState(false);
  const [loading, setLoading] = useState(false);
  const current = currentIndex >= 0 ? songs[currentIndex] : null;
  const next = () => currentIndex < songs.length - 1 && playIndex(currentIndex + 1);
  const prev = () => (time > 3 ? (audio.current!.currentTime = 0) : currentIndex > 0 && playIndex(currentIndex - 1));

  useEffect(() => {
    if (!current || !audio.current) return;
    setFailed(false); setTime(0); setLoading(true);
    audio.current.src = src(current.id);
    audio.current.play().catch(() => {});
    addToHistory({ id: current.id, name: current.name, artistName: current.artistName, albumName: current.albumName });
    const nx = songs[currentIndex + 1];
    if (preload.current && nx) preload.current.src = src(nx.id);
    if ('mediaSession' in navigator) {
      navigator.mediaSession.metadata = new MediaMetadata({
        title: clean(current.name), artist: current.artistName || 'יאללה שירים', album: current.albumName || '',
        artwork: [{ src: '/logo.png', sizes: '512x512', type: 'image/png' }],
      });
      navigator.mediaSession.setActionHandler('play', () => audio.current?.play());
      navigator.mediaSession.setActionHandler('pause', () => audio.current?.pause());
      navigator.mediaSession.setActionHandler('previoustrack', prev);
      navigator.mediaSession.setActionHandler('nexttrack', next);
    }
  }, [current?.id]);

  if (!current) return null;
  const pct = dur ? (time / dur) * 100 : 0;

  return (
    <div className="fixed inset-x-0 bottom-0 z-[200] p-3 sm:p-4 pointer-events-none">
      <audio ref={audio} onPlay={() => setPlaying(true)} onWaiting={() => setLoading(true)} onPlaying={() => setLoading(false)} onCanPlay={() => setLoading(false)} onPause={() => setPlaying(false)}
        onTimeUpdate={e => setTime(e.currentTarget.currentTime)}
        onLoadedMetadata={e => setDur(e.currentTarget.duration)}
        onEnded={next} onError={() => { setFailed(true); setTimeout(next, 1500); }} />
      <audio ref={preload} preload="auto" className="hidden" muted />

      <div className="pointer-events-auto mx-auto max-w-3xl rounded-[28px] bg-[#1B1033]/95 backdrop-blur-xl text-white shadow-[0_20px_60px_-10px_rgba(221,36,118,.55)] ring-1 ring-white/10 overflow-hidden" dir="rtl">
        <div className="flex items-center gap-3 px-4 pt-3 sm:px-5">
          <div className={`disc ${playing ? 'spin' : ''}`}><img src="/logo.png" alt="" /></div>
          <div className="min-w-0 flex-1">
            <p className="truncate font-display text-[15px] font-extrabold">{failed ? 'השיר לא נטען, עובר לבא…' : clean(current.name)}</p>
            <p className="truncate text-xs text-white/55">{[current.artistName, current.albumName].filter(Boolean).join(' • ') || `${currentIndex + 1} מתוך ${songs.length}`}</p>
          </div>
          <div className={`eq ${playing ? 'on' : ''}`} aria-hidden><i /><i /><i /><i /></div>
          <FavButton song={{ id: current.id, name: current.name, artistName: current.artistName, albumName: current.albumName }} />
          <button onClick={close} aria-label="סגור נגן" className="p-2 text-white/50 hover:text-white"><CloseIcon size={18} color="currentColor" /></button>
        </div>

        <div className="flex items-center gap-3 px-4 pb-3 pt-2 sm:px-5">
                    <span className="w-9 text-xs tabular-nums text-white/55" dir="ltr">{fmt(dur)}</span>
          <input dir="ltr" type="range" min={0} max={dur || 1} step={0.1} value={time} aria-label="התקדמות"
            onChange={e => { audio.current!.currentTime = +e.target.value; }}
            className="seek flex-1" style={{ ['--p' as string]: `${pct}%` }} />
          <span className="w-9 text-left text-xs tabular-nums text-white/55" dir="ltr">{fmt(time)}</span>

                    <button onClick={prev} aria-label="הקודם" className="p-2 hover:scale-110 transition-transform"><PrevIcon size={22} color="white" /></button>
          <button onClick={() => (playing ? audio.current?.pause() : audio.current?.play())} aria-label={playing ? 'השהה' : 'נגן'}
            className="grid h-12 w-12 place-items-center rounded-full bg-gradient-to-br from-[#FFC93C] via-[#FF512F] to-[#DD2476] shadow-lg active:scale-95 transition-transform">
            {loading
              ? <svg className="animate-spin" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round"><path d="M12 3a9 9 0 1 0 9 9" /></svg>
              : playing
              ? <svg width="20" height="20" viewBox="0 0 24 24" fill="white"><rect x="6" y="5" width="4" height="14" rx="1.5" /><rect x="14" y="5" width="4" height="14" rx="1.5" /></svg>
              : <svg width="20" height="20" viewBox="0 0 24 24" fill="white"><path d="M8 5.5v13a1 1 0 0 0 1.5.86l10.5-6.5a1 1 0 0 0 0-1.72L9.5 4.64A1 1 0 0 0 8 5.5z" /></svg>}
          </button>
          <button onClick={next} disabled={currentIndex >= songs.length - 1} aria-label="הבא" className="p-2 hover:scale-110 transition-transform disabled:opacity-30"><NextIcon size={22} color="white" /></button>
        </div>
      </div>
    </div>
  );
}
