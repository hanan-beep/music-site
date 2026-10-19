'use client';
import { streamUrl } from '@/lib/streamUrl';
import OfflineMenuItem from './OfflineMenuItem';
import ShareMenuItem from './ShareMenuItem';
import { useState } from 'react';
import { usePlayer } from './PlayerContext';
import FavButton from './FavButton';
import { PlayIcon } from './Icons';

type S = { id: string; name: string; artistName?: string; albumName?: string };

export default function SongRow({ song, sub, active, onPlay }: { song: S; sub?: string; active: boolean; onPlay: () => void }) {
  const { playNext, enqueue } = usePlayer();
  const [open, setOpen] = useState(false);
  const q = { id: song.id, name: song.name, artistName: song.artistName, albumName: song.albumName };
  return (
    <li className={`relative ${open ? 'z-30' : ''}`}>
      {open && <div className="fixed inset-0 z-20" onClick={() => setOpen(false)} />}
      <div onClick={onPlay}
        className={`flex cursor-pointer items-center gap-3 rounded-2xl p-2.5 pr-3 transition-all ${active ? 'bg-[#1B1033] text-white shadow-lg' : 'bg-white shadow-sm hover:shadow-md'}`}>
        <div className="relative h-12 w-12 flex-none">
          <img src="/logo.png" alt="" className={`h-full w-full rounded-full object-cover ring-2 ${active ? 'ring-[#FFC93C]' : 'ring-[#FFC93C]/50'}`} />
          {active && <span className="absolute inset-0 grid place-items-center rounded-full bg-[#1B1033]/70"><span className="eq on"><i /><i /><i /></span></span>}
        </div>
        <div className="min-w-0 flex-1">
          <h3 className={`truncate text-[15px] font-extrabold ${active ? 'text-[#FFC93C]' : ''}`}>{song.name.replace(/\.[^/.]+$/, '')}</h3>
          {sub && <p className={`mt-0.5 truncate text-xs ${active ? 'text-white/60' : 'text-[#1B1033]/50'}`}>{sub}</p>}
        </div>
        <div className="flex flex-none items-center gap-1" onClick={e => e.stopPropagation()}>
          <FavButton song={q} size="sm" />
          <button onClick={() => setOpen(!open)} aria-label="עוד פעולות" aria-expanded={open} className={`rounded-full p-2 ${active ? 'hover:bg-white/10' : 'hover:bg-black/5'}`}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="5" r="2" /><circle cx="12" cy="12" r="2" /><circle cx="12" cy="19" r="2" /></svg>
          </button>
          <button onClick={onPlay} aria-label="נגן" className="grid h-10 w-10 place-items-center rounded-full bg-gradient-to-br from-[#FFC93C] via-[#FF512F] to-[#DD2476] shadow transition-transform hover:scale-105">
            <PlayIcon size={15} color="white" />
          </button>
        </div>
      </div>
      {open && (
        <div className="absolute left-3 top-full z-30 mt-1 w-60 overflow-hidden rounded-2xl bg-white py-1 text-sm font-bold text-[#1B1033] shadow-2xl ring-1 ring-black/5">
          <button onClick={() => { playNext(q); setOpen(false); }} className="block w-full px-4 py-2.5 text-right hover:bg-[#FFF3EA]">נגן אחר כך</button>
          <button onClick={() => { enqueue(q); setOpen(false); }} className="block w-full px-4 py-2.5 text-right hover:bg-[#FFF3EA]">הוסף לתור</button>
          <OfflineMenuItem song={q} onDone={() => setOpen(false)} />
          <ShareMenuItem song={q} onDone={() => setOpen(false)} />
          <a href={streamUrl(song.id, true)} onClick={() => setOpen(false)} className="block px-4 py-2.5 hover:bg-[#FFF3EA]">הורדה</a>
        </div>
      )}
    </li>
  );
}
