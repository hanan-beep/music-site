// app/api/play/route.ts — סופר האזנה (נקראת מהנגן אחרי 30 שניות של האזנה)
import { catalogDb } from '@/lib/catalog';
import { sameSite } from '@/lib/guard';

const hits = new Map<string, number[]>();

export async function POST(req: Request) {
  if (!sameSite(req)) return new Response('forbidden', { status: 403 });

  const ip = (req.headers.get('x-forwarded-for') || '').split(',')[0].trim() || 'unknown';
  const now = Date.now();
  if (hits.size > 1000) hits.clear();
  const recent = (hits.get(ip) || []).filter(t => now - t < 10 * 60 * 1000);
  if (recent.length >= 60) return new Response('too many', { status: 429 });
  hits.set(ip, [...recent, now]);

  let id = '';
  try { id = String((await req.json()).id ?? ''); } catch {}
  if (!/^[\w-]{10,}$/.test(id)) return new Response('bad id', { status: 400 });

  const db = catalogDb();
  if (db) await db.from('plays').insert({ song_id: id });
  return new Response(null, { status: 204 });
}
