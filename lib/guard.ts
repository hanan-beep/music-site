// חוסם בקשות מאתרים אחרים (hotlink). בקשה בלי Origin/Referer (פתיחה ישירה) מותרת.
// משווים לכתובת שהדפדפן ביקש (Host / X-Forwarded-Host), ולא ל-request.url: מאחורי Caddy או PM2
// ה-url הפנימי יכול להיות 127.0.0.1:3000 והבדיקה הייתה חוסמת את האתר עצמו.
export function sameSite(req: Request) {
  const ref = req.headers.get('origin') || req.headers.get('referer');
  if (!ref) return true;
  const host = (req.headers.get('x-forwarded-host') || req.headers.get('host') || new URL(req.url).host).split(',')[0].trim();
  try { return new URL(ref).host === host; } catch { return true; }
}
