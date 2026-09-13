// app/songs/page.tsx
export const revalidate = 3600; // cache שעה

import SongsClient from './SongsClient';
import { google } from 'googleapis';

const MONTHLY_FOLDER_ID = '1mlTjhQHWEe1x-GXbw10zVF9EtGxmtn72';
const AUDIO = /\.(mp3|m4a|aac|wav|flac|ogg|opus|wma)$/i;
const THIRTY_DAYS = 30 * 24 * 60 * 60 * 1000;

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
    fields: 'files(id, name, mimeType, createdTime, modifiedTime)',
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

  // זמרים משתי התיקיות הראשיות
  const [files1, files2, monthFolders] = await Promise.all([
    listFolder(folder1, drive),
    listFolder(folder2, drive),
    listFolder(MONTHLY_FOLDER_ID, drive),
  ]);

  // זמרים ללא כפילויות
  const seen = new Set<string>();
  const artists: any[] = [];
  for (const f of [...files1, ...files2]) {
    if (f.mimeType !== 'application/vnd.google-apps.folder') continue;
    const key = f.name.trim().toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    artists.push(f);
  }

  // שירים מזמרים
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
        isNew: false, driveOrder: 999999, createdTime: s.createdTime, isMonthly: false,
      }));
      await Promise.all(folders.map(async (folder: any) => {
        const items = await listFolder(folder.id, drive);
        items.filter((f: any) => f.mimeType !== 'application/vnd.google-apps.folder' && AUDIO.test(f.name))
          .forEach((s: any) => regularSongs.push({
            id: s.id, name: s.name, artistName: artist.name, albumName: folder.name,
            isNew: false, driveOrder: 999999, createdTime: s.createdTime, isMonthly: false,
          }));
      }));
    })
  );

  // שירים חודשיים — ממויינים לפי שם התיקייה (01, 02...)
  const monthDirs = monthFolders
    .filter((f: any) => f.mimeType === 'application/vnd.google-apps.folder')
    .sort((a: any, b: any) => a.name.localeCompare(b.name));

  const monthSongsArrays = await Promise.all(
    monthDirs.map(async (month: any) => {
      const items = await listFolder(month.id, drive);
      return items
        .filter((f: any) => f.mimeType !== 'application/vnd.google-apps.folder' && AUDIO.test(f.name))
        .map((s: any) => {
          const uploadedAt = new Date(s.createdTime).getTime();
          const isNew = Date.now() - uploadedAt < THIRTY_DAYS;
          return {
            id: s.id,
            name: s.name,
            artistName: '',
            albumName: month.name,
            isNew,
            driveOrder: uploadedAt,
            createdTime: s.createdTime,
            isMonthly: true,
          };
        });
    })
  );

  // מאחד ומסדר — החדש ביותר קודם
  const monthlySongs = monthSongsArrays.flat()
    .sort((a, b) => b.driveOrder - a.driveOrder);

  return { regularSongs, monthlySongs };
}

export default async function SongsPage() {
  const { regularSongs, monthlySongs } = await getAllSongs();
  return <SongsClient regularSongs={regularSongs} extraSongs={monthlySongs} />;
}
