// app/album/[name]/Player.tsx — רשימת שירים וקבצים של אלבום / זמר
'use client';
import { streamUrl } from '@/lib/streamUrl';
import OfflineMenuItem from '@/app/OfflineMenuItem';
import { useState } from 'react';
import { usePlayer } from '@/app/PlayerContext';
import FavButton from '@/app/FavButton';
import { PlayIcon } from '@/app/Icons';

const IMAGE_MIME = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/jpg'];
const isImg = (f: any) => IMAGE_MIME.includes(f.mimeType);
const isPdf = (f: any) => f.mimeType === 'application/pdf';

export default function Player({ songs, albumImage, artistName, albumName }: {
  songs: any[]; folderId?: string; albumImage?: { id: string; name: string } | null; artistName?: string; albumName?: string;
}) {
  const { play, playNext, enqueue, currentIndex, songs: queue } = usePlayer();
  const [menu, setMenu] = useState<string | null>(null);
  const audio = songs.filter(f => !isImg(f) && !isPdf(f))
    .map(f => ({ id: f.id, name: f.name, artistName, albumName, coverId: albumImage?.id }));
  const extras = songs.filter(f => isImg(f) || isPdf(f));
  const nowId = currentIndex >= 0 ? queue[currentIndex]?.id : null;

  return (
    <div>
      {menu && <div className="fixed inset-0 z-20" onClick={() => setMenu(null)} />}
      <ul className="space-y-2">
        {audio.map((song, i) => {
          const active = nowId === song.id;
          const open = menu === song.id;
          return (
            <li key={song.id} className={`relative ${open ? 'z-30' : ''}`}>
              <div onClick={() => play(audio, i)}
                className={`flex cursor-pointer items-center gap-3 rounded-2xl p-2.5 pr-4 transition-all ${active ? 'bg-[#1B1033] text-white shadow-lg' : 'bg-white shadow-sm hover:shadow-md'}`}>
                <span className={`w-6 flex-none text-center text-sm font-bold ${active ? 'text-[#FFC93C]' : 'text-[#1B1033]/35'}`}>
                  {active ? <span className="eq on inline-flex"><i /><i /><i /></span> : i + 1}
                </span>
                <h3 className={`min-w-0 flex-1 truncate text-[15px] font-extrabold ${active ? 'text-[#FFC93C]' : ''}`}>{song.name.replace(/\.[^/.]+$/, '')}</h3>
                <div className="flex flex-none items-center gap-1" onClick={e => e.stopPropagation()}>
                  <FavButton song={song} size="sm" />
                  <button onClick={() => setMenu(open ? null : song.id)} aria-label="עוד פעולות" aria-expanded={open}
                    className={`rounded-full p-2 ${active ? 'hover:bg-white/10' : 'hover:bg-black/5'}`}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="5" r="2" /><circle cx="12" cy="12" r="2" /><circle cx="12" cy="19" r="2" /></svg>
                  </button>
                  <button onClick={() => play(audio, i)} aria-label="נגן"
                    className="grid h-10 w-10 place-items-center rounded-full bg-gradient-to-br from-[#FFC93C] via-[#FF512F] to-[#DD2476] shadow transition-transform hover:scale-105">
                    <PlayIcon size={15} color="white" />
                  </button>
                </div>
              </div>
              {open && (
                <div className="absolute left-3 top-full z-30 mt-1 w-60 overflow-hidden rounded-2xl bg-white py-1 text-sm font-bold text-[#1B1033] shadow-2xl ring-1 ring-black/5">
                  <button onClick={() => { playNext(song); setMenu(null); }} className="block w-full px-4 py-2.5 text-right hover:bg-[#FFF3EA]">נגן אחר כך</button>
                  <button onClick={() => { enqueue(song); setMenu(null); }} className="block w-full px-4 py-2.5 text-right hover:bg-[#FFF3EA]">הוסף לתור</button>
                  <OfflineMenuItem song={song} onDone={() => setMenu(null)} />
                  <a href={streamUrl(song.id, true)} onClick={() => setMenu(null)} className="block px-4 py-2.5 hover:bg-[#FFF3EA]">הורדה</a>
                </div>
              )}
            </li>
          );
        })}
      </ul>

      {extras.length > 0 && (
        <section className="mt-10">
          <h2 className="mb-3 font-display text-xl font-extrabold">קבצים נוספים</h2>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {extras.map(f => isImg(f) ? (
              <a key={f.id} href={`/api/image/${f.id}?w=1600`} target="_blank" rel="noopener noreferrer" className="block overflow-hidden rounded-2xl shadow-md transition-transform hover:-translate-y-1">
                <img src={`/api/image/${f.id}?w=400`} alt={f.name} loading="lazy" className="h-40 w-full object-cover" />
              </a>
            ) : (
              <a key={f.id} href={`/api/stream/${f.id}`} target="_blank" rel="noopener noreferrer"
                className="flex h-40 flex-col items-center justify-center gap-2 rounded-2xl bg-white p-3 text-center shadow-md transition-transform hover:-translate-y-1">
                <span className="grid h-12 w-12 place-items-center rounded-xl bg-[#FF512F] text-sm font-extrabold text-white">PDF</span>
                <span className="line-clamp-2 text-sm font-bold">{f.name.replace(/\.[^/.]+$/, '')}</span>
              </a>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
