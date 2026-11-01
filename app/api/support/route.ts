// app/api/support/route.ts — תשובות לשאלת התמיכה (פעם אחת לכל משתמש מחובר) + מייל התראה
import { catalogDb } from '@/lib/catalog';
import { sameSite } from '@/lib/guard';

export const dynamic = 'force-dynamic';

const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

// מזהה את המשתמש לפי הטוקן של Supabase (לא סומכים על מייל שהדפדפן שולח)
async function whoami(req: Request) {
  const token = (req.headers.get('authorization') || '').replace(/^Bearer\s+/i, '');
  const db = catalogDb();
  if (!token || !db) return null;
  const { data } = await db.auth.getUser(token);
  const email = data.user?.email?.toLowerCase();
  return email ? { db, email } : null;
}

export async function GET(req: Request) {
  if (!sameSite(req)) return Response.json({ error: 'forbidden' }, { status: 403 });
  const me = await whoami(req);
  if (!me) return Response.json({ error: 'unauthorized' }, { status: 401 });
  const { data } = await me.db.from('support_votes').select('answer').eq('user_email', me.email).maybeSingle();
  return Response.json({ answered: !!data });
}

export async function POST(req: Request) {
  if (!sameSite(req)) return Response.json({ error: 'forbidden' }, { status: 403 });
  const me = await whoami(req);
  if (!me) return Response.json({ error: 'unauthorized' }, { status: 401 });

  let answer = '';
  try { answer = String((await req.json()).answer ?? ''); } catch {}
  if (answer !== 'yes' && answer !== 'no') return Response.json({ error: 'bad answer' }, { status: 400 });

  const { error } = await me.db.from('support_votes').insert({ user_email: me.email, answer });
  if (error) {
    if (error.code === '23505') return Response.json({ ok: true, already: true }); // כבר ענה
    console.error('support vote error', error.message);
    return Response.json({ error: 'failed' }, { status: 500 });
  }

  // סיכום כולל + מייל אלייך
  const [yes, no] = await Promise.all([
    me.db.from('support_votes').select('user_email', { count: 'exact', head: true }).eq('answer', 'yes'),
    me.db.from('support_votes').select('user_email', { count: 'exact', head: true }).eq('answer', 'no'),
  ]);
  const isYes = answer === 'yes';
  try {
    await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from: 'יאללה שירים <onboarding@resend.dev>',
        to: 'yaele9090@gmail.com',
        subject: `${isYes ? 'כן' : 'לא'} | ${me.email} ענה/תה על שאלת התמיכה`,
        html: `<div dir="rtl" style="font-family:Arial,sans-serif;max-width:520px;margin:0 auto">
          <h2 style="color:#DD2476">תשובה חדשה לשאלת התמיכה</h2>
          <p style="font-size:20px"><b style="color:${isYes ? '#16a34a' : '#6b7280'}">${isYes ? 'כן, מוכן/ה לתמוך ב-3 ₪ לחודש' : 'לא כרגע'}</b></p>
          <p><b>מייל:</b> ${esc(me.email)}</p>
          <hr/>
          <p><b>סיכום עד עכשיו:</b> כן: ${yes.count ?? '?'} | לא: ${no.count ?? '?'}</p>
        </div>`,
      }),
    });
  } catch (e) { console.error('support mail error', e); }

  return Response.json({ ok: true });
}
