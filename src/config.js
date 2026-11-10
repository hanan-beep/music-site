// src/config.js — כל ההגדרות מגיעות ממשתני סביבה (קובץ .env בשרת)
const req = (env, k) => {
  const v = env[k];
  if (!v) throw new Error(`חסר משתנה סביבה: ${k}`);
  return v;
};
const list = s => String(s || '').split(',').map(x => x.trim().toLowerCase()).filter(Boolean);

export function loadConfig(env = process.env) {
  const test = env.TEST_MODE === '1';
  const siteOrigin = env.SITE_ORIGIN || 'https://example.com';
  const admins = list(test ? env.ADMIN_EMAILS || 'admin@x.com' : req(env, 'ADMIN_EMAILS'));
  const allowed = (env.ALLOWED_ORIGINS || siteOrigin).split(',').map(s => s.trim()).filter(Boolean);
  if (env.API_DOMAIN) allowed.push(`https://${env.API_DOMAIN}`);   // דף הניהול נטען מהשרת עצמו

  return {
    TEST_MODE: test,
    PORT: Number(env.PORT || 3000),
    SITE_ORIGIN: siteOrigin,
    ALLOWED_ORIGINS: allowed,
    COOKIE_DOMAIN: env.COOKIE_DOMAIN || '',               // למשל .yallashirim.co.il
    COOKIE_SECURE: env.COOKIE_SECURE !== '0',
    SESSION_SECRET: test ? (env.SESSION_SECRET || 'test-secret-test-secret-test-secret') : req(env, 'SESSION_SECRET'),

    ADMIN_EMAILS: admins,                                  // מי רשאי לאשר משתמשים
    ADMIN_NOTIFY_EMAIL: env.ADMIN_NOTIFY_EMAIL || admins[0] || '',
    RESEND_API_KEY: env.RESEND_API_KEY || '',              // אופציונלי: מייל כשמישהו חדש מבקש גישה
    APPROVAL_CACHE_MS: Number(env.APPROVAL_CACHE_MS ?? 10000),   // ביטול גישה נכנס לתוקף תוך כמה שניות

    SUPABASE_URL: test ? '' : req(env, 'SUPABASE_URL'),
    SUPABASE_SERVICE_ROLE_KEY: test ? '' : req(env, 'SUPABASE_SERVICE_ROLE_KEY'),

    GOOGLE_CLIENT_EMAIL: test ? '' : req(env, 'GOOGLE_CLIENT_EMAIL'),
    GOOGLE_PRIVATE_KEY: test ? '' : req(env, 'GOOGLE_PRIVATE_KEY'),
    DRIVE_API_BASE: env.DRIVE_API_BASE || 'https://www.googleapis.com/drive/v3',

    CACHE_DIR: env.CACHE_DIR || '/cache',
    CACHE_MAX_BYTES: Math.floor(Number(env.CACHE_MAX_GB ?? 15) * 1024 ** 3),
    CACHE_FILL_CONCURRENCY: Number(env.CACHE_FILL_CONCURRENCY || 2),
  };
}
