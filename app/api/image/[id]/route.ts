import { google } from 'googleapis';
export const dynamic = 'force-dynamic';
export const preferredRegion = 'fra1';

const auth = new google.auth.GoogleAuth({
  credentials: {
    client_email: process.env.GOOGLE_CLIENT_EMAIL,
    private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  },
  scopes: ['https://www.googleapis.com/auth/drive.readonly'],
});

// תמונות (זמרים/אלבומים) דרך השרת — עובד גם כשהקבצים בדרייב פרטיים, וגם כשהדפדפן חוסם עוגיות של צד שלישי.
export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!/^[\w-]{10,}$/.test(id)) return new Response('bad id', { status: 400 });
  const w = Math.min(1600, Math.max(100, Number(new URL(req.url).searchParams.get('w')) || 400));

  const Authorization = `Bearer ${await auth.getAccessToken()}`;
  const meta = await fetch(
    `https://www.googleapis.com/drive/v3/files/${id}?fields=thumbnailLink&supportsAllDrives=true`,
    { headers: { Authorization } }
  ).then(r => (r.ok ? r.json() : null)).catch(() => null);

  let up: Response | null = null;
  if (meta?.thumbnailLink) {
    up = await fetch(meta.thumbnailLink.replace(/=s\d+$/, `=w${w}`), { headers: { Authorization } }).catch(() => null);
    if (up && !up.ok) up = null;
  }
  if (!up) up = await fetch(`https://www.googleapis.com/drive/v3/files/${id}?alt=media&supportsAllDrives=true`, { headers: { Authorization } });
  if (!up.ok) return new Response('not found', { status: 404 });

  return new Response(up.body, {
    headers: {
      'Content-Type': up.headers.get('content-type') || 'image/jpeg',
      'Cache-Control': 'public, max-age=86400, s-maxage=604800, stale-while-revalidate=86400',
    },
  });
}
