// app/api/drive/route.ts
import { google } from 'googleapis';

const auth = new google.auth.GoogleAuth({
  credentials: {
    client_email: process.env.GOOGLE_CLIENT_EMAIL,
    private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  },
  scopes: ['https://www.googleapis.com/auth/drive.readonly'],
});

async function getFolderContents(folderId: string, drive: any) {
  const res = await drive.files.list({
    q: `'${folderId}' in parents and trashed = false`,
    fields: 'files(id, name, mimeType, webViewLink, createdTime, modifiedTime)',
    orderBy: 'name',
    supportsAllDrives: true,
    includeItemsFromAllDrives: true,
    pageSize: 1000,
  });
  return res.data.files || [];
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const folderId = searchParams.get('folderId');
    const drive = google.drive({ version: 'v3', auth });

    if (folderId) {
      const contents = await getFolderContents(folderId, drive);
      return Response.json(contents);
    }

    const folder1 = process.env.GOOGLE_FOLDER_1!;
    const folder2 = process.env.GOOGLE_FOLDER_2!;

    const [files1, files2] = await Promise.all([
      getFolderContents(folder1, drive),
      getFolderContents(folder2, drive),
    ]);

    const seen = new Set<string>();
    const artists: { id: string; name: string }[] = [];

    for (const f of [...files1, ...files2]) {
      if (f.mimeType !== 'application/vnd.google-apps.folder') continue;
      const key = f.name.trim().toLowerCase();
      if (seen.has(key)) continue;
      seen.add(key);
      artists.push({ id: f.id, name: f.name });
    }

    artists.sort((a, b) => a.name.localeCompare(b.name, 'he'));
    return Response.json(artists);
  } catch (error) {
    console.error(error);
    return Response.json({ error: 'Failed to fetch' }, { status: 500 });
  }
}
