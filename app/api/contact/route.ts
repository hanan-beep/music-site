// app/api/contact/route.ts
import { NextRequest } from 'next/server';
import { sameSite } from '@/lib/guard';

const hits = new Map<string, number[]>(); // הגבלת קצב פשוטה לפי כתובת IP
const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

export async function POST(req: NextRequest) {
  if (!sameSite(req)) return Response.json({ error: 'forbidden' }, { status: 403 });

  const ip = (req.headers.get('x-forwarded-for') || '').split(',')[0].trim() || 'unknown';
  const now = Date.now();
  if (hits.size > 500) hits.clear();
  const recent = (hits.get(ip) || []).filter(t => now - t < 10 * 60 * 1000);
  if (recent.length >= 3) return Response.json({ error: 'נשלחו יותר מדי הודעות, נסו שוב בעוד כמה דקות' }, { status: 429 });
  hits.set(ip, [...recent, now]);

  let body: any;
  try { body = await req.json(); } catch { return Response.json({ error: 'בקשה לא תקינה' }, { status: 400 }); }

  if (body.website) return Response.json({ ok: true }); // שדה מלכודת לרובוטים
  const name = String(body.name ?? '').replace(/[\r\n]+/g, ' ').trim().slice(0, 80);
  const email = String(body.email ?? '').trim().slice(0, 120);
  const message = String(body.message ?? '').trim();

  if (!email || !message) return Response.json({ error: 'חסרים שדות חובה' }, { status: 400 });
  if (message.length > 2000) return Response.json({ error: 'ההודעה ארוכה מדי' }, { status: 400 });
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return Response.json({ error: 'כתובת מייל לא תקינה' }, { status: 400 });

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${process.env.RESEND_API_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from: 'יאללה שירים <onboarding@resend.dev>',
      to: 'yaele9090@gmail.com',
      reply_to: email,
      subject: `הודעה חדשה מ-${name || 'גולש'} – יאללה שירים`,
      html: `
        <div dir="rtl" style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #DD2476;">📬 הודעה חדשה מהאתר</h2>
          <hr style="border-color: #DD2476;" />
          <p><strong>שם:</strong> ${esc(name) || 'לא צוין'}</p>
          <p><strong>מייל:</strong> ${esc(email)}</p>
          <hr />
          <p><strong>הודעה:</strong></p>
          <p style="background: #fff8f0; padding: 16px; border-radius: 8px; border-right: 4px solid #DD2476;">
            ${esc(message).replace(/\n/g, '<br/>')}
          </p>
          <hr />
          <p style="color: #999; font-size: 12px;">נשלח מאתר יאללה שירים 💪</p>
        </div>
      `,
    }),
  });

  if (!res.ok) {
    console.error('Resend error:', await res.json().catch(() => ({})));
    return Response.json({ error: 'שגיאה בשליחה' }, { status: 500 });
  }
  return Response.json({ ok: true });
}
