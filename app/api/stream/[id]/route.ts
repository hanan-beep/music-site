import { google } from 'googleapis';
export const dynamic = 'force-dynamic';
export const preferredRegion = 'fra1'; // פרנקפורט — הכי קרוב לישראל

const auth = new google.auth.GoogleAuth({
  credentials: {
    client_email: process.env.GOOGLE_CLIENT_EMAIL,
    private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  },
  scopes: ['https://www.googleapis.com/auth/drive.readonly'],
});

// הזרמת שיר מהדרייב עם תמיכה בגלילה (Range). בשלב 3 נחליף ל-Worker ונוסיף בדיקת הרשאה.
export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!/^[\w-]{10,}$/.test(id)) return new Response('bad id', { status: 400 });

  const token = await auth.getAccessToken();
  const headers: Record<string, string> = { Authorization: `Bearer ${token}` };
  const range = req.headers.get('range');
  if (range) headers.Range = range;

  const up = await fetch(
    `https://www.googleapis.com/drive/v3/files/${id}?alt=media&supportsAllDrives=true`,
    { headers }
  );
  if (!up.ok) return new Response('not found', { status: up.status });

  const out = new Headers({ 'Accept-Ranges': 'bytes', 'Cache-Control': 'private, max-age=3600' });
  for (const k of ['content-length', 'content-range']) {
    const v = up.headers.get(k);
    if (v) out.set(k, v);
  }
  const type = up.headers.get('content-type') || '';
  out.set('Content-Type', type.startsWith('audio/') ? type : 'audio/mpeg');
  return new Response(up.body, { status: up.status, headers: out });
}
