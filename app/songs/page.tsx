// app/songs/page.tsx
export const dynamic = 'force-dynamic';

import SongsClient from './SongsClient';
import { google } from 'googleapis';

const EXTRA_FOLDER_ID = '1b6Z7prAcoSS8fwpk8hqsD6g-loB-hbn1';
const AUDIO = /\.(mp3|m4a|aac|wav|flac|ogg|opus|wma)$/i;

const auth = new google.auth.GoogleAuth({
  credentials: {
    client_email: process.env.GOOGLE_CLIENT_EMAIL,
    private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  },
  scopes: ['https://www.googleapis.com/auth/drive.readonly'],
});

async function listFolder(folderId: string, drive: any) {
  const res = await drive.files.list({
    q: `'${folderId}' in parents and trashed = false`,
    fields: 'files(id, name, mimeType, createdTime)',
    orderBy: 'name',
    supportsAllDrives: true,
    includeItemsFromAllDrives: true,
    pageSize: 1000,
  });
  return res.data.files || [];
}

async function getAllSongs() {
  const drive = google.drive({ version: 'v3', auth });

  const folder1 = process.env.GOOGLE_FOLDER_1!;
  const folder2 = process.env.GOOGLE_FOLDER_2!;

  const [files1, files2] = await Promise.all([
    listFolder(folder1, drive),
    listFolder(folder2, drive),
  ]);

  const seen = new Set<string>();
  const artists: any[] = [];
  for (const f of [...files1, ...files2]) {
    if (f.mimeType !== 'application/vnd.google-apps.folder') continue;
    const key = f.name.trim().toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    artists.push(f);
  }

  const artistContents = await Promise.all(
    artists.map(async (artist) => {
      const contents = await listFolder(artist.id, drive);
      return { artist, contents };
    })
  );

  const regularSongs: any[] = [];

  await Promise.all(
    artistContents.map(async ({ artist, contents }) => {
      const folders = contents.filter((f: any) => f.mimeType === 'application/vnd.google-apps.folder');
      const direct = contents.filter((f: any) => f.mimeType !== 'application/vnd.google-apps.folder' && AUDIO.test(f.name));

      direct.forEach((s: any) => regularSongs.push({
        id: s.id, name: s.name, artistName: artist.name, albumName: '',
        isNew: false, driveOrder: 999999, createdTime: s.createdTime,
      }));

      await Promise.all(folders.map(async (folder: any) => {
        const items = await listFolder(folder.id, drive);
        items.filter((f: any) => f.mimeType !== 'application/vnd.google-apps.folder' && AUDIO.test(f.name))
          .forEach((s: any) => regularSongs.push({
            id: s.id, name: s.name, artistName: artist.name, albumName: folder.name,
            isNew: false, driveOrder: 999999, createdTime: s.createdTime,
          }));
      }));
    })
  );

  const extraFiles = await listFolder(EXTRA_FOLDER_ID, drive);
  const extra = extraFiles
    .filter((f: any) => f.mimeType !== 'application/vnd.google-apps.folder')
    .map((s: any, i: number) => ({
      id: s.id, name: s.name, artistName: '', albumName: 'שירים חדשים',
      isNew: true, driveOrder: i, createdTime: s.createdTime,
    }));

  return { regularSongs, extra };
}

export default async function SongsPage() {
  const { regularSongs, extra } = await getAllSongs();
  return <SongsClient regularSongs={regularSongs} extraSongs={extra} />;
}
