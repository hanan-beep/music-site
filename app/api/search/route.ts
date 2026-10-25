// app/api/search/route.ts — חיפוש בקטלוג (זמרים, אלבומים, שירים) דרך פונקציית החיפוש ב-Supabase
import { catalogDb } from '@/lib/catalog';
import { sameSite } from '@/lib/guard';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  if (!sameSite(req)) return Response.json([], { status: 403 });
  const q = (new URL(req.url).searchParams.get('q') || '').trim().slice(0, 80);
  if (!q) return Response.json([]);
  const db = catalogDb();
  if (!db) return Response.json([], { status: 503 });

  const { data, error } = await db.rpc('search_catalog', { q, lim: 30 });
  if (error) { console.error('search error', error.message); return Response.json([], { status: 500 }); }
  return Response.json(data ?? [], { headers: { 'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300' } });
}
