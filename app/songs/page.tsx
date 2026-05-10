// app/songs/page.tsx — SERVER COMPONENT, קורא ל-API אחד בלבד
import SongsClient from './SongsClient';

const EXTRA_FOLDER_ID = '1b6Z7prAcoSS8fwpk8hqsD6g-loB-hbn1';

async function getAllSongs() {
  const BASE = 'https://music-site-flame.vercel.app';
  const [songsRes, extraRes] = await Promise.all([
    fetch(`${BASE}/api/all-songs`, { cache: 'no-store' }),
    fetch(`${BASE}/api/drive?folderId=${EXTRA_FOLDER_ID}`, { cache: 'no-store' }),
  ]);

  const songs = await songsRes.json();
  const extraRaw = await extraRes.json();

  const AUDIO = /\.(mp3|m4a|aac|wav|flac|ogg|opus|wma)$/i;
  const extra = (Array.isArray(extraRaw) ? extraRaw : [])
    .filter((f: any) => f.mimeType !== 'application/vnd.google-apps.folder' && AUDIO.test(f.name))
    .map((s: any, i: number) => ({
      id: s.id,
      name: s.name,
      artistName: '',
      albumName: 'שירים חדשים',
      driveOrder: i,
    }));

  return { songs: Array.isArray(songs) ? songs : [], extra };
}

export default async function SongsPage() {
  const { songs, extra } = await getAllSongs();
  return <SongsClient songs={songs} extraSongs={extra} />;
}
