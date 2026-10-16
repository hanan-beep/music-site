// app/api/all-songs/route.ts
// שולף את כל השירים מכל הזמרים — בצד השרת, מהיר
import { google } from 'googleapis';
import { getAllSongs } from '@/lib/catalog';

const auth = new google.auth.GoogleAuth({
  credentials: {
    client_email: process.env.GOOGLE_CLIENT_EMAIL,
    private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  },
  scopes: ['https://www.googleapis.com/auth/drive.readonly'],
});

const AUDIO = /\.(mp3|m4a|aac|wav|flac|ogg|opus|wma)$/i;
const FOLDER = 'application/vnd.google-apps.folder';

async function listFolder(folderId: string, drive: any) {
  const res = await drive.files.list({
    q: `'${folderId}' in parents and trashed = false`,
    fields: 'files(id, name, mimeType)',
    orderBy: 'name',
    supportsAllDrives: true,
    includeItemsFromAllDrives: true,
    pageSize: 1000,
  });
  return res.data.files || [];
}

export async function GET() {
  const cat = await getAllSongs();
  if (cat.length) return Response.json(cat);
  try {
    const drive = google.drive({ version: 'v3', auth });

    const folder1 = process.env.GOOGLE_FOLDER_1!;
    const folder2 = process.env.GOOGLE_FOLDER_2!;

    // שולף זמרים משתי התיקיות
    const [files1, files2] = await Promise.all([
      listFolder(folder1, drive),
      listFolder(folder2, drive),
    ]);

    // מסיר כפילויות זמרים
    const seen = new Set<string>();
    const artists: any[] = [];
    for (const f of [...files1, ...files2]) {
      if (f.mimeType !== FOLDER) continue;
      const key = f.name.trim().toLowerCase();
      if (seen.has(key)) continue;
      seen.add(key);
      artists.push(f);
    }

    // שולף תוכן כל זמר במקביל
    const artistContents = await Promise.all(
      artists.map(async (artist) => {
        const contents = await listFolder(artist.id, drive);
        return { artist, contents };
      })
    );

    const allSongs: any[] = [];

    // שולף שירים מאלבומים במקביל
    await Promise.all(
      artistContents.map(async ({ artist, contents }) => {
        const folders = contents.filter((f: any) => f.mimeType === FOLDER);
        const directSongs = contents.filter(
          (f: any) => f.mimeType !== FOLDER && AUDIO.test(f.name)
        );

        // שירים ישירים בתיקיית הזמר
        for (const s of directSongs) {
          allSongs.push({ id: s.id, name: s.name, artistName: artist.name, albumName: '' });
        }

        // שירים בתוך אלבומים
        await Promise.all(
          folders.map(async (folder: any) => {
            const items = await listFolder(folder.id, drive);
            for (const s of items) {
              if (s.mimeType === FOLDER || !AUDIO.test(s.name)) continue;
              allSongs.push({
                id: s.id,
                name: s.name,
                artistName: artist.name,
                albumName: folder.name,
              });
            }
          })
        );
      })
    );

    return Response.json(allSongs);
  } catch (error) {
    console.error(error);
    return Response.json({ error: 'Failed to fetch' }, { status: 500 });
  }
}
