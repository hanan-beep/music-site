// src/auth.js — עוגיית סשן חתומה + בדיקת אישור (whitelist) בצד השרת
import { SignJWT, jwtVerify } from 'jose';

export const COOKIE = 'ys_session';

export function parseCookies(header) {
  const out = {};
  for (const part of String(header || '').split(';')) {
    const i = part.indexOf('=');
    if (i > 0) out[part.slice(0, i).trim()] = decodeURIComponent(part.slice(i + 1).trim());
  }
  return out;
}

export function makeAuth(cfg) {
  const key = new TextEncoder().encode(cfg.SESSION_SECRET);
  const cookieOpts = { httpOnly: true, secure: cfg.COOKIE_SECURE, sameSite: 'lax', path: '/', ...(cfg.COOKIE_DOMAIN ? { domain: cfg.COOKIE_DOMAIN } : {}) };

  return {
    async issue(res, user) {
      const jwt = await new SignJWT({ email: user.email })
        .setProtectedHeader({ alg: 'HS256' }).setSubject(user.id).setIssuedAt().setExpirationTime('7d').sign(key);
      res.cookie(COOKIE, jwt, { ...cookieOpts, maxAge: 7 * 86400 * 1000 });
    },
    clear(res) { res.clearCookie(COOKIE, cookieOpts); },
    async requireSession(req, res, next) {
      const token = parseCookies(req.headers.cookie)[COOKIE];
      if (!token) return res.status(401).json({ error: 'login_required' });
      try {
        const { payload } = await jwtVerify(token, key);
        req.user = { id: payload.sub, email: String(payload.email).toLowerCase() };
        next();
      } catch {
        res.status(401).json({ error: 'login_required' });
      }
    },
    requireAdmin(req, res, next) {
      if (!cfg.ADMIN_EMAILS.includes(req.user.email)) return res.status(403).json({ error: 'admin_only' });
      next();
    },
  };
}

// האם המייל מאושר. התוצאה נשמרת בזיכרון כמה שניות כדי לא לפנות למסד בכל חתיכת שיר,
// ובכל שינוי שהמנהל עושה המטמון מתנקה, כך שאישור וביטול נכנסים לתוקף מיד.
export function makeAccess(store, cfg) {
  const cache = new Map();
  return {
    async isApproved(email) {
      const hit = cache.get(email);
      if (hit && Date.now() - hit.at < cfg.APPROVAL_CACHE_MS) return hit.ok;
      const ok = await store.isApproved(email);
      cache.set(email, { ok, at: Date.now() });
      return ok;
    },
    invalidate(email) { cache.delete(email); },
  };
}

export const NOT_APPROVED = { error: 'not_approved', message: 'Waiting for admin approval', message_he: 'ממתין לאישור מנהל' };
