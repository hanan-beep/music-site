// app/songs/page.tsx
import SongsClient from './SongsClient';

const EXTRA_FOLDER_ID = '1b6Z7prAcoSS8fwpk8hqsD6g-loB-hbn1';
const AUDIO = /\.(mp3|m4a|aac|wav|flac|ogg|opus|wma)$/i;
const BASE = 'https://music-site-flame.vercel.app/api/drive';

async function getAllSongs() {
  const artistsRes = await fetch(BASE, { next: { revalidate: 3600 } });
  const artists = await artistsRes.json();

  const artistContents = await Promise.all(
    artists.map(async (artist: any) => {
      const res = await fetch(`${BASE}?folderId=${artist.id}`, { next: { revalidate: 3600 } });
      const contents = await res.json();
      return { artist, contents };
    })
  );

  const songArrays = await Promise.all(
    artistContents.flatMap(({ artist, contents }) => {
      const folders = contents.filter((f: any) => f.mimeType === 'application/vnd.google-apps.folder');
      const direct = contents
        .filter((f: any) => f.mimeType !== 'application/vnd.google-apps.folder' && AUDIO.test(f.name))
        .map((s: any) => ({ id: s.id, name: s.name, artistName: artist.name, albumName: '', isNew: false, driveOrder: 999999, createdTime: s.createdTime }));

      return [
        Promise.resolve(direct),
        ...folders.map(async (folder: any) => {
          const res = await fetch(`${BASE}?folderId=${folder.id}`, { next: { revalidate: 3600 } });
          const items = await res.json();
          return items
            .filter((f: any) => f.mimeType !== 'application/vnd.google-apps.folder' && AUDIO.test(f.name))
            .map((s: any) => ({ id: s.id, name: s.name, artistName: artist.name, albumName: folder.name, isNew: false, driveOrder: 999999, createdTime: s.createdTime }));
        }),
      ];
    })
  );

  // תיקיית שירים חדשים
  const extraRes = await fetch(`${BASE}?folderId=${EXTRA_FOLDER_ID}`, { cache: 'no-store' });
  const extraRaw = await extraRes.json();
  const extra = (Array.isArray(extraRaw) ? extraRaw : [])
    .filter((f: any) => f.mimeType !== 'application/vnd.google-apps.folder')
    .map((s: any, i: number) => ({
      id: s.id, name: s.name, artistName: '', albumName: 'שירים חדשים',
      isNew: true, driveOrder: i, createdTime: s.createdTime,
    }));

  return { regularSongs: songArrays.flat(), extra };
}

export default async function SongsPage() {
  const { regularSongs, extra } = await getAllSongs();
  return <SongsClient regularSongs={regularSongs} extraSongs={extra} />;
}
