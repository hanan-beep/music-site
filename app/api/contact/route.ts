// app/api/contact/route.ts
import { NextRequest } from 'next/server';

export async function POST(req: NextRequest) {
  const { name, email, message } = await req.json();

  // ולידציה בסיסית
  if (!email || !message) {
    return Response.json({ error: 'חסרים שדות חובה' }, { status: 400 });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return Response.json({ error: 'כתובת מייל לא תקינה' }, { status: 400 });
  }

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: 'יאללה שירים <onboarding@resend.dev>',
      to: 'yaele9090@gmail.com',
      reply_to: email,
      subject: `הודעה חדשה מ-${name || 'גולש'} – יאללה שירים`,
      html: `
        <div dir="rtl" style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #DD2476;">📬 הודעה חדשה מהאתר</h2>
          <hr style="border-color: #DD2476;" />
          <p><strong>שם:</strong> ${name || 'לא צוין'}</p>
          <p><strong>מייל:</strong> ${email}</p>
          <hr />
          <p><strong>הודעה:</strong></p>
          <p style="background: #fff8f0; padding: 16px; border-radius: 8px; border-right: 4px solid #DD2476;">
            ${message.replace(/\n/g, '<br/>')}
          </p>
          <hr />
          <p style="color: #999; font-size: 12px;">נשלח מאתר יאללה שירים 💪</p>
        </div>
      `,
    }),
  });

  if (!res.ok) {
    const err = await res.json();
    console.error('Resend error:', err);
    return Response.json({ error: 'שגיאה בשליחה' }, { status: 500 });
  }

  return Response.json({ ok: true });
}
