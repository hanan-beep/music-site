'use client';
import type { ReactNode } from 'react';
import { usePlayer } from './PlayerContext';
import { useHistory } from './HistoryContext';
import { PlayIcon, MusicNoteIcon } from './Icons';

type S = { id: string; name: string; artistName?: string; albumName?: string; isNew?: boolean };

const COLORS = [['#FF512F', '#DD2476'], ['#7B2FF7', '#54A0FF'], ['#FFC93C', '#FF512F'], ['#1B1033', '#7B2FF7'], ['#54A0FF', '#5FF5A0']];
const hash = (s: string) => [...s].reduce((h, c) => (h * 31 + c.charCodeAt(0)) >>> 0, 7);
const clean = (n: string) => n.replace(/\.[^/.]+$/, '');

function Row({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="mt-10">
      <h2 className="px-5 font-display text-2xl font-extrabold sm:px-12">{title}</h2>
      <div className="mt-4 flex snap-x gap-4 overflow-x-auto px-5 pb-3 sm:px-12">{children}</div>
    </section>
  );
}

function Card({ song, onPlay, rank }: { song: S; onPlay: () => void; rank?: number }) {
  const [c1, c2] = COLORS[hash(song.name) % COLORS.length];
  return (
    <button onClick={onPlay} className="group w-36 flex-none snap-start text-right sm:w-40">
      <div className="relative grid aspect-square place-items-center overflow-hidden rounded-3xl shadow-lg transition-transform group-hover:-translate-y-1"
        style={{ background: `linear-gradient(135deg, ${c1}, ${c2})` }}>
        <MusicNoteIcon size={64} color="rgba(255,255,255,.55)" />
        {rank ? <span className="absolute right-2 top-2 grid h-7 w-7 place-items-center rounded-full bg-white text-sm font-extrabold text-[#DD2476]">{rank}</span> : song.isNew && <span className="absolute right-2 top-2 rounded-full bg-white px-2 py-0.5 text-[11px] font-extrabold text-[#DD2476]">חדש</span>}
        <span className="absolute bottom-2 left-2 grid h-10 w-10 place-items-center rounded-full bg-white shadow-lg transition-opacity sm:opacity-0 sm:group-hover:opacity-100">
          <PlayIcon size={14} color="#DD2476" />
        </span>
      </div>
      <h3 className="mt-2 line-clamp-2 text-sm font-extrabold leading-snug">{clean(song.name)}</h3>
      <p className="truncate text-xs text-[#1B1033]/55">{song.artistName || song.albumName}</p>
    </button>
  );
}

const toQ = (s: S) => ({ id: s.id, name: s.name, artistName: s.artistName, albumName: s.albumName });

export function RecentRow({ songs }: { songs: S[] }) {
  const { play } = usePlayer();
  if (!songs.length) return null;
  const list = songs.map(toQ);
  return <Row title="נוספו לאחרונה">{songs.map((s, i) => <Card key={s.id} song={s} onPlay={() => play(list, i)} />)}</Row>;
}

export function HistoryRow() {
  const { history } = useHistory();
  const { play } = usePlayer();
  if (!history.length) return null;
  const songs = history.slice(0, 12);
  const list = songs.map(toQ);
  return <Row title="האזנות אחרונות שלך">{songs.map((s, i) => <Card key={s.id} song={s} onPlay={() => play(list, i)} />)}</Row>;
}

export function TopRow({ songs }: { songs: S[] }) {
  const { play } = usePlayer();
  if (songs.length < 3) return null;
  const list = songs.map(toQ);
  return <Row title="הכי מושמעים החודש">{songs.map((s, i) => <Card key={s.id} song={s} rank={i + 1} onPlay={() => play(list, i)} />)}</Row>;
}
