'use client';
import { useEffect, useRef, useState } from 'react';
import { usePlayer } from './PlayerContext';
import { useHistory } from './HistoryContext';
import { PrevIcon, NextIcon, CloseIcon } from './Icons';
import FavButton from './FavButton';

import { streamUrl, STREAM_BASE } from '@/lib/streamUrl';
const src = (id: string) => streamUrl(id);
const clean = (n: string) => n.replace(/\.[^/.]+$/, '');
const fmt = (s: number) => (isFinite(s) ? `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}` : '0:00');
type Repeat = 'off' | 'all' | 'one';

const Svg = ({ children, size = 22, color = 'white' }: any) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">{children}</svg>
);
const ShuffleIcon = (p: any) => <Svg {...p}><path d="M16 3h5v5M4 20 21 3M21 16v5h-5M15 15l6 6M4 4l5 5" /></Svg>;
const RepeatIcon = ({ one, ...p }: any) => <Svg {...p}><path d="M17 2l4 4-4 4M3 11V9a3 3 0 0 1 3-3h15M7 22l-4-4 4-4M21 13v2a3 3 0 0 1-3 3H3" />{one && <path d="M11 10h1v4" />}</Svg>;
const ChevronDown = () => <Svg><path d="m6 9 6 6 6-6" /></Svg>;

export default function GlobalPlayer() {
  const { songs, currentIndex, playIndex, close, removeAt } = usePlayer();
  const { addToHistory } = useHistory();
  const audio = useRef<HTMLAudioElement>(null);
  const preload = useRef<HTMLAudioElement>(null);
  const played = useRef<number[]>([]);
  const counted = useRef<string | null>(null);
  const planned = useRef<number | null>(null); // השיר הבא שנבחר מראש בערבוב, כדי להכין אותו מראש
  const triedFallback = useRef<string | null>(null);
  const stallTimer = useRef<any>(null);
  const resumeAt = useRef(0);
  const savedPos = useRef<{ id: string; t: number } | null>(null);
  const [sleepAt, setSleepAt] = useState<number | null>(null);
  const [sleepEnd, setSleepEnd] = useState(false);
  const [sleepOpen, setSleepOpen] = useState(false);
  const [sleepLeft, setSleepLeft] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [loading, setLoading] = useState(false);
  const [failed, setFailed] = useState(false);
  const [time, setTime] = useState(0);
  const [dur, setDur] = useState(0);
  const [open, setOpen] = useState(false);
  const [shuffle, setShuffle] = useState(false);
  const [repeat, setRepeat] = useState<Repeat>('off');
  const current = currentIndex >= 0 ? songs[currentIndex] : null;
  const [art, setArt] = useState('/logo.png');
  const isLogo = art === '/logo.png';

  const pickShuffle = () => {
    const others = songs.map((_, i) => i).filter(i => i !== currentIndex);
    const fresh = others.filter(i => !played.current.includes(i));
    if (!fresh.length) played.current = [];
    const pool = fresh.length ? fresh : others;
    return pool[Math.floor(Math.random() * pool.length)];
  };
  const advance = (auto = false) => {
    if (auto && repeat === 'one') { audio.current!.currentTime = 0; audio.current!.play(); return; }
    let n = -1;
    if (shuffle && songs.length > 1) {
      n = planned.current != null && planned.current !== currentIndex && songs[planned.current] ? planned.current : pickShuffle();
    } else if (currentIndex < songs.length - 1) n = currentIndex + 1;
    else if (repeat === 'all') n = 0;
    if (n >= 0) { played.current.push(currentIndex); playIndex(n); }
  };
  const back = () => {
    if (time > 3) { audio.current!.currentTime = 0; return; }
    const p = played.current.pop();
    if (p !== undefined && p < songs.length) playIndex(p);
    else if (currentIndex > 0) playIndex(currentIndex - 1);
  };
  const fns = useRef({ advance, back });
  fns.current = { advance, back };

  useEffect(() => {
    try { savedPos.current = JSON.parse(localStorage.getItem('yallah-pos') || 'null'); } catch {}
    try { const as = (navigator as any).audioSession; if (as) as.type = 'playback'; } catch {}
    const online = () => { const a = audio.current; if (a && !a.paused && a.readyState < 3) reconnectRef.current(); };
    window.addEventListener('online', online);
    return () => window.removeEventListener('online', online);
  }, []);

  useEffect(() => {
    if (!current || !audio.current) return;
    setFailed(false); setTime(0); setLoading(true);
    audio.current.src = src(current.id);
    const restored = savedPos.current?.id === current.id; // פתיחה מחדש: ממשיכים מאותה נקודה, בלי להתחיל לנגן לבד
    resumeAt.current = restored ? savedPos.current!.t : 0;
    savedPos.current = null;
    if (!restored) audio.current.play().catch(() => {});
    addToHistory({ id: current.id, name: current.name, artistName: current.artistName, albumName: current.albumName });
    let nxIdx = currentIndex + 1;
    if (shuffle && songs.length > 1) { nxIdx = pickShuffle(); planned.current = nxIdx; } else planned.current = null;
    const nx = songs[nxIdx];
    if (preload.current && nx) preload.current.src = src(nx.id);
    if ('mediaSession' in navigator) {
      navigator.mediaSession.metadata = new MediaMetadata({
        title: clean(current.name), artist: current.artistName || 'יאללה שירים', album: current.albumName || '',
        artwork: [{ src: '/logo.png', sizes: '512x512', type: 'image/png' }],
      });
      const h = (a: MediaSessionAction, f: MediaSessionActionHandler) => { try { navigator.mediaSession.setActionHandler(a, f); } catch {} };
      h('play', () => audio.current?.play());
      h('pause', () => audio.current?.pause());
      h('stop', () => audio.current?.pause());
      h('previoustrack', () => fns.current.back());
      h('nexttrack', () => fns.current.advance());
      h('seekbackward', () => { if (audio.current) audio.current.currentTime = Math.max(0, audio.current.currentTime - 10); });
      h('seekforward', () => { if (audio.current) audio.current.currentTime += 10; });
      h('seekto', d => { if (audio.current && d.seekTime != null) audio.current.currentTime = d.seekTime; });
    }
  }, [current?.id]);

  useEffect(() => {
    if (!current) return;
    let dead = false;
    setArt('/logo.png');
    const chain = [`/api/cover/${current.id}`, ...(current.coverId ? [`/api/image/${current.coverId}?w=700`] : [])];
    (async () => {
      for (const u of chain) {
        const ok = await new Promise<boolean>(res => { const im = new Image(); im.onload = () => res(true); im.onerror = () => res(false); im.src = u; });
        if (dead) return;
        if (ok) { setArt(u); return; }
      }
    })();
    return () => { dead = true; };
  }, [current?.id, current?.coverId]);

  useEffect(() => {
    try {
      if ('mediaSession' in navigator && navigator.mediaSession.metadata && current) {
        navigator.mediaSession.metadata = new MediaMetadata({
          title: clean(current.name), artist: current.artistName || 'יאללה שירים', album: current.albumName || '',
          artwork: [{ src: new URL(art, location.href).href }],
        });
      }
    } catch {}
  }, [art]);

  useEffect(() => {
    try {
      if ('mediaSession' in navigator && dur > 0 && isFinite(dur)) navigator.mediaSession.setPositionState({ duration: dur, position: Math.min(time, dur), playbackRate: 1 });
    } catch {}
  }, [Math.floor(time / 2), dur]);

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    const esc = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    window.addEventListener('keydown', esc);
    return () => { window.removeEventListener('keydown', esc); document.body.style.overflow = ''; };
  }, [open]);

  const setMS = (state: 'playing' | 'paused') => { try { if ('mediaSession' in navigator) navigator.mediaSession.playbackState = state; } catch {} };
  // רשת חלשה (למשל ברכב): אם השיר תקוע יותר מ-12 שניות, מתחברים מחדש ממש מאותה נקודה
  const reconnect = () => {
    const a = audio.current;
    if (!a || !current || a.paused) return;
    resumeAt.current = a.currentTime;
    a.src = src(current.id);
    a.play().catch(() => {});
  };
  const reconnectRef = useRef(reconnect);
  reconnectRef.current = reconnect;
  const armStall = () => { clearTimeout(stallTimer.current); stallTimer.current = setTimeout(() => reconnectRef.current(), 12000); };
  const clearStall = () => clearTimeout(stallTimer.current);
  const chooseSleep = (m: number | 'end') => {
    setSleepOpen(false);
    if (m === 0) { setSleepAt(null); setSleepEnd(false); }
    else if (m === 'end') { setSleepAt(null); setSleepEnd(true); }
    else { setSleepEnd(false); setSleepAt(Date.now() + m * 60000); }
  };

  useEffect(() => {
    if (!current || time < 1) return;
    try { localStorage.setItem('yallah-pos', JSON.stringify({ id: current.id, t: time })); } catch {}
  }, [Math.floor(time / 5)]);

  useEffect(() => {
    if (!current || time < 30 || counted.current === current.id) return;
    counted.current = current.id; // האזנה נספרת רק אחרי 30 שניות, כדי שדילוגים לא ייספרו
    fetch('/api/play', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: current.id }), keepalive: true }).catch(() => {});
  }, [Math.floor(time / 5)]);

  useEffect(() => {
    if (!sleepAt) { setSleepLeft(0); return; }
    const tick = () => {
      const left = sleepAt - Date.now();
      setSleepLeft(Math.max(0, left));
      const a = audio.current;
      if (a && left < 10000 && left > 0) a.volume = Math.max(0.05, left / 10000);
      if (left <= 0) { a?.pause(); if (a) a.volume = 1; setSleepAt(null); }
    };
    tick();
    const id = setInterval(tick, 500);
    return () => { clearInterval(id); if (audio.current) audio.current.volume = 1; };
  }, [sleepAt]);

  const toggle = () => (playing ? audio.current?.pause() : audio.current?.play());
  const noNext = !shuffle && repeat !== 'all' && currentIndex >= songs.length - 1;
  const cycleRepeat = () => setRepeat(r => (r === 'off' ? 'all' : r === 'all' ? 'one' : 'off'));
  const pct = dur ? (time / dur) * 100 : 0;
  const song = current && { id: current.id, name: current.name, artistName: current.artistName, albumName: current.albumName };

  const PlayBtn = ({ size }: { size: number }) => (
    <button onClick={toggle} aria-label={playing ? 'השהה' : 'נגן'} style={{ width: size, height: size }}
      className="grid shrink-0 place-items-center rounded-full bg-gradient-to-br from-[#FFC93C] via-[#FF512F] to-[#DD2476] shadow-lg transition-transform active:scale-95">
      {loading
        ? <svg className="animate-spin" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round"><path d="M12 3a9 9 0 1 0 9 9" /></svg>
        : playing
          ? <svg width="22" height="22" viewBox="0 0 24 24" fill="white"><rect x="6" y="5" width="4" height="14" rx="1.5" /><rect x="14" y="5" width="4" height="14" rx="1.5" /></svg>
          : <svg width="22" height="22" viewBox="0 0 24 24" fill="white"><path d="M8 5.5v13a1 1 0 0 0 1.5.86l10.5-6.5a1 1 0 0 0 0-1.72L9.5 4.64A1 1 0 0 0 8 5.5z" /></svg>}
    </button>
  );
  const Seek = () => (
    <div dir="ltr" className="flex items-center gap-3">
      <span className="w-10 text-xs tabular-nums text-white/60">{fmt(time)}</span>
      <input type="range" min={0} max={dur || 1} step={0.1} value={time} aria-label="התקדמות" className="seek flex-1"
        onChange={e => { audio.current!.currentTime = +e.target.value; }} style={{ ['--p' as string]: `${pct}%` }} />
      <span className="w-10 text-left text-xs tabular-nums text-white/60">{fmt(dur)}</span>
    </div>
  );

  return (
    <>
      <audio ref={audio} onPlay={() => { setPlaying(true); setMS('playing'); }} onPause={() => { setPlaying(false); setMS('paused'); }}
        onWaiting={() => { setLoading(true); armStall(); }} onStalled={armStall}
        onPlaying={() => { setLoading(false); clearStall(); }} onCanPlay={() => { setLoading(false); clearStall(); }}
        onTimeUpdate={e => setTime(e.currentTarget.currentTime)} onLoadedMetadata={e => { setDur(e.currentTarget.duration); if (resumeAt.current > 0) { e.currentTarget.currentTime = resumeAt.current; resumeAt.current = 0; } }}
        onEnded={() => { if (sleepEnd) { setSleepEnd(false); return; } advance(true); }} onError={() => {
          if (STREAM_BASE && current && triedFallback.current !== current.id) {
            triedFallback.current = current.id; // ה-Worker נכשל? מנסים דרך האתר עצמו
            audio.current!.src = `/api/stream/${current.id}`; audio.current!.play().catch(() => {}); return;
          }
          setFailed(true); setTimeout(() => advance(), 1500);
        }} />
      <audio ref={preload} preload="auto" className="hidden" muted />

      {current && !open && (
        <div className="pointer-events-none fixed inset-x-0 bottom-0 z-[200] p-3 sm:p-4">
          <div className="pointer-events-auto mx-auto max-w-3xl overflow-hidden rounded-[28px] bg-[#1B1033]/95 text-white shadow-[0_20px_60px_-10px_rgba(221,36,118,.55)] ring-1 ring-white/10 backdrop-blur-xl" dir="rtl">
            <div className="flex items-center gap-2 px-4 pt-3 sm:px-5">
              <button onClick={() => setOpen(true)} aria-label="פתח נגן מלא" className="flex min-w-0 flex-1 items-center gap-3 text-right">
                <div className={`disc ${playing ? 'spin' : ''}`}><img src={art} alt="" /></div>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-display text-[15px] font-extrabold">{failed ? 'השיר לא נטען, עובר לבא…' : clean(current.name)}</p>
                  <p className="truncate text-xs text-white/55">{[current.artistName, current.albumName].filter(Boolean).join(' • ') || `${currentIndex + 1} מתוך ${songs.length}`}</p>
                </div>
              </button>
              <div dir="ltr" className="flex flex-none items-center">
                <button onClick={back} aria-label="הקודם" className="flex-none p-2 transition-transform active:scale-90"><PrevIcon size={24} color="white" /></button>
                {PlayBtn({ size: 46 })}
                <button onClick={() => advance()} disabled={noNext} aria-label="הבא" className="flex-none p-2 transition-transform active:scale-90 disabled:opacity-30"><NextIcon size={24} color="white" /></button>
              </div>
            </div>
            <div className="flex items-center gap-1 px-4 pb-3 pt-1 sm:px-5">
              <div className="min-w-0 flex-1">{Seek()}</div>
              <FavButton song={song!} />
              <button onClick={close} aria-label="סגור נגן" className="flex-none p-2 text-white/50 hover:text-white"><CloseIcon size={18} color="currentColor" /></button>
            </div>
          </div>
        </div>
      )}

      {current && open && (
        <div dir="rtl" className="fixed inset-0 z-[300] flex flex-col overflow-y-auto bg-gradient-to-b from-[#3a1160] via-[#1B1033] to-[#0e0820] text-white" role="dialog" aria-label="נגן מלא">
          <div className="mx-auto flex w-full max-w-md flex-1 flex-col px-6 pb-10 pt-5">
            <div className="flex items-center justify-between">
              <button onClick={() => setOpen(false)} aria-label="מזער נגן" className="rounded-full bg-white/10 p-2.5 hover:bg-white/20"><ChevronDown /></button>
              <span className="text-sm font-semibold text-white/60">מתנגן עכשיו</span>
              <FavButton song={song!} />
            </div>

            <div className="my-8 grid place-items-center">
              <div className={`disc ${playing ? 'spin' : ''}`} style={{ width: 272, height: 272, padding: 10, boxShadow: '0 30px 70px -15px rgba(221,36,118,.6)' }}><img src={art} alt="" /></div>
            </div>

            <h2 className="font-display text-2xl font-extrabold leading-snug">{clean(current.name)}</h2>
            <p className="mt-1 text-white/60">{[current.artistName, current.albumName].filter(Boolean).join(' • ')}</p>

            <div className="mt-6">{Seek()}</div>

            <div dir="ltr" className="mt-4 flex items-center justify-between">
              <button onClick={() => { setShuffle(s => !s); played.current = []; planned.current = null; }} aria-label="ערבוב" aria-pressed={shuffle} className="p-2.5"><ShuffleIcon color={shuffle ? '#FFC93C' : 'rgba(255,255,255,.55)'} /></button>
              <button onClick={back} aria-label="הקודם" className="p-2.5"><PrevIcon size={28} color="white" /></button>
              {PlayBtn({ size: 68 })}
              <button onClick={() => advance()} disabled={noNext} aria-label="הבא" className="p-2.5 disabled:opacity-30"><NextIcon size={28} color="white" /></button>
              <button onClick={cycleRepeat} aria-label="חזרה" className="p-2.5"><RepeatIcon one={repeat === 'one'} color={repeat === 'off' ? 'rgba(255,255,255,.55)' : '#FFC93C'} /></button>
            </div>

            <div className="mt-6 flex flex-col items-center gap-3">
              <button onClick={() => setSleepOpen(o => !o)}
                className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-bold ring-1 ${sleepAt || sleepEnd ? 'bg-[#FFC93C]/15 text-[#FFC93C] ring-[#FFC93C]/40' : 'text-white/70 ring-white/20 hover:bg-white/10'}`}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" /></svg>
                {sleepAt ? `נרדם בעוד ${fmt(sleepLeft / 1000)}` : sleepEnd ? 'נרדם בסוף השיר' : 'טיימר שינה'}
              </button>
              {sleepOpen && (
                <div className="flex flex-wrap justify-center gap-2">
                  {([['כבוי', 0], ['15 דק׳', 15], ['30 דק׳', 30], ['45 דק׳', 45], ['שעה', 60], ['סוף השיר', 'end']] as [string, number | 'end'][]).map(([l, v]) => (
                    <button key={l} onClick={() => chooseSleep(v)} className="rounded-full bg-white/10 px-4 py-2 text-sm font-bold hover:bg-white/20">{l}</button>
                  ))}
                </div>
              )}
            </div>

            <h3 className="mb-2 mt-10 font-display text-lg font-extrabold">התור ({songs.length})</h3>
            <ul className="space-y-1">
              {songs.map((s, i) => (
                <li key={`${s.id}-${i}`} className={`flex items-center gap-1 rounded-2xl ${i === currentIndex ? 'bg-white/15' : 'hover:bg-white/10'}`}>
                  <button onClick={() => playIndex(i)} className="flex min-w-0 flex-1 items-center gap-3 px-3 py-2.5 text-right">
                    <span className="w-5 text-center text-xs text-white/45">{i === currentIndex ? <span className={`eq inline-flex ${playing ? 'on' : ''}`}><i /><i /><i /></span> : i + 1}</span>
                    <span className="min-w-0 flex-1">
                      <span className={`block truncate text-sm ${i === currentIndex ? 'font-extrabold text-[#FFC93C]' : 'font-semibold'}`}>{clean(s.name)}</span>
                      <span className="block truncate text-xs text-white/45">{s.artistName}</span>
                    </span>
                  </button>
                  {i !== currentIndex && <button onClick={() => removeAt(i)} aria-label="הסר מהתור" className="p-2.5 text-white/35 hover:text-white"><CloseIcon size={16} color="currentColor" /></button>}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </>
  );
}
