// lib/drive.ts — קריאות לדרייב ישירות מהשרת (בלי לעבור דרך כתובת HTTP של האתר עצמו)
import { google } from 'googleapis';

const auth = new google.auth.GoogleAuth({
  credentials: {
    client_email: process.env.GOOGLE_CLIENT_EMAIL,
    private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  },
  scopes: ['https://www.googleapis.com/auth/drive.readonly'],
});

// זיכרון קצר טווח: שרת Node שרץ ברציפות (PM2) לא צריך לשאול את הדרייב שוב על אותה תיקייה בכל כניסה
const TTL = 60_000;
const cache = new Map<string, { t: number; v: any[] }>();

export async function listFolder(folderId: string): Promise<any[]> {
  if (!/^[\w-]{10,}$/.test(folderId)) throw new Error('bad folderId');
  const hit = cache.get(folderId);
  if (hit && Date.now() - hit.t < TTL) return hit.v;
  const drive = google.drive({ version: 'v3', auth });
  const res = await drive.files.list({
    q: `'${folderId}' in parents and trashed = false`,
    fields: 'files(id, name, mimeType, webViewLink, createdTime, modifiedTime)',
    orderBy: 'name',
    supportsAllDrives: true,
    includeItemsFromAllDrives: true,
    pageSize: 1000,
  });
  const v = res.data.files || [];
  cache.set(folderId, { t: Date.now(), v });
  return v;
}

// רשימת הזמרים: תיקיות-על משתי התיקיות הראשיות, בלי כפילויות לפי שם
export async function listArtistFolders(): Promise<{ id: string; name: string }[]> {
  const [a, b] = await Promise.all([listFolder(process.env.GOOGLE_FOLDER_1!), listFolder(process.env.GOOGLE_FOLDER_2!)]);
  const seen = new Set<string>();
  const artists: { id: string; name: string }[] = [];
  for (const f of [...a, ...b]) {
    if (f.mimeType !== 'application/vnd.google-apps.folder') continue;
    const key = String(f.name).trim().toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    artists.push({ id: f.id as string, name: f.name as string });
  }
  return artists.sort((x, y) => x.name.localeCompare(y.name, 'he'));
}
