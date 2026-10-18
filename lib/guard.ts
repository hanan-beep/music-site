// חוסם בקשות מאתרים אחרים (hotlink). בקשה בלי Referer (פתיחה ישירה) מותרת.
export function sameSite(req: Request) {
  const ref = req.headers.get('origin') || req.headers.get('referer');
  if (!ref) return true;
  try { return new URL(ref).host === new URL(req.url).host; } catch { return true; }
}
