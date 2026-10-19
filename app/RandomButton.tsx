'use client';
import { useState } from 'react';
import { usePlayer } from './PlayerContext';

export default function RandomButton() {
  const { play } = usePlayer();
  const [busy, setBusy] = useState(false);
  const go = async () => {
    setBusy(true);
    try {
      const list = await (await fetch('/api/random')).json();
      if (Array.isArray(list) && list.length) play(list, 0);
    } catch {}
    setBusy(false);
  };
  return (
    <button onClick={go} disabled={busy}
      className="mt-6 inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 font-display font-extrabold text-[#DD2476] shadow-xl transition-transform hover:scale-105 disabled:opacity-70">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 3h5v5M4 20 21 3M21 16v5h-5M15 15l6 6M4 4l5 5" /></svg>
      {busy ? 'מערבבים...' : 'שיר אקראי'}
    </button>
  );
}
