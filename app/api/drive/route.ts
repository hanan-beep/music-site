// app/api/drive/route.ts — נקודת קצה לדפדפן (למשל דף הפלייליסט). השרת עצמו קורא ישירות מ-lib/drive.ts
import { sameSite } from '@/lib/guard';
import { listFolder, listArtistFolders } from '@/lib/drive';

export async function GET(request: Request) {
  try {
    if (!sameSite(request)) return Response.json({ error: 'forbidden' }, { status: 403 });
    const folderId = new URL(request.url).searchParams.get('folderId');
    if (folderId && !/^[\w-]{10,}$/.test(folderId)) return Response.json({ error: 'bad folderId' }, { status: 400 });
    return Response.json(folderId ? await listFolder(folderId) : await listArtistFolders());
  } catch (error) {
    console.error(error);
    return Response.json({ error: 'Failed to fetch' }, { status: 500 });
  }
}
