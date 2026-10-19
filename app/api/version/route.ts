// הגרסה שרצה כרגע בשרת — האפליקציה משווה אותה לגרסה שהיא עצמה טעונה ממנה
export const dynamic = 'force-dynamic';

export async function GET() {
  return Response.json({ v: process.env.NEXT_PUBLIC_BUILD_ID ?? '' }, { headers: { 'Cache-Control': 'no-store' } });
}
