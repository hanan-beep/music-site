// כתובת ההזרמה: Cloudflare Worker אם הוגדר NEXT_PUBLIC_STREAM_BASE, אחרת השרת של האתר עצמו
export const STREAM_BASE = process.env.NEXT_PUBLIC_STREAM_BASE || '';
export const streamUrl = (id: string, download = false) => `${STREAM_BASE}/api/stream/${id}${download ? '?download=1' : ''}`;
