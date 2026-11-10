// src/server.js — נקודת הכניסה
import express from 'express';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import { loadConfig } from './config.js';
import { makeStore } from './store.js';
import { makeAuth, makeAccess, NOT_APPROVED } from './auth.js';
import { makeStreamer } from './stream.js';

const EMAIL_RE = /[^\s,;<>"'()]+@[^\s,;<>"'()]+\.[^\s,;<>"'()]+/g;
// מקבל {email} או {emails:[...]} או {text:"רשימה מודבקת"} ומחזיר מיילים נקיים, באותיות קטנות וללא כפילויות
export function parseEmails(body) {
  const raw = [body?.email, ...(Array.isArray(body?.emails) ? body.emails : []), body?.text].filter(Boolean).join('\n');
  return [...new Set((String(raw).match(EMAIL_RE) || []).map(e => e.toLowerCase()))].slice(0, 500);
}

async function notifyAdmin(cfg, email) {
  if (cfg.TEST_MODE || !cfg.RESEND_API_KEY || !cfg.ADMIN_NOTIFY_EMAIL) return;
  try {
    const safe = email.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${cfg.RESEND_API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from: 'יאללה שירים <onboarding@resend.dev>', to: cfg.ADMIN_NOTIFY_EMAIL,
        subject: `בקשת גישה חדשה: ${email}`,
        html: `<div dir="rtl" style="font-family:Arial,sans-serif"><p><b>${safe}</b> התחבר/ה לאתר וממתין/ה לאישור שלך.</p><p>לאישור: ${cfg.SITE_ORIGIN.replace(/^(https?:\/\/)/, '$1api.')}/admin</p></div>`,
      }),
    });
  } catch (e) { console.error('notifyAdmin', e.message); }
}

export function buildApp(cfg, store = makeStore(cfg)) {
  const app = express();
  app.set('trust proxy', 1);          // מאחורי Caddy
  app.disable('x-powered-by');

  const auth = makeAuth(cfg);
  const access = makeAccess(store, cfg);

  // CORS + חסימת אתרים זרים (כולל עוגיות בין האתר ל-api באותו דומיין ראשי)
  app.use((req, res, next) => {
    const origin = req.headers.origin;
    const src = origin || (req.headers.referer ? (() => { try { return new URL(req.headers.referer).origin; } catch { return null; } })() : null);
    const allowed = !src || cfg.ALLOWED_ORIGINS.includes(src);
    res.set('Vary', 'Origin');
    if (origin && allowed) {
      res.set({ 'Access-Control-Allow-Origin': origin, 'Access-Control-Allow-Credentials': 'true',
        'Access-Control-Allow-Headers': 'Content-Type, Range', 'Access-Control-Allow-Methods': 'GET, HEAD, POST, OPTIONS',
        'Access-Control-Expose-Headers': 'Content-Length, Content-Range, Accept-Ranges' });
    }
    if (req.method === 'OPTIONS') return res.status(204).end();
    if (!allowed) return res.status(403).json({ error: 'forbidden_origin' });
    res.set({ 'X-Content-Type-Options': 'nosniff', 'Referrer-Policy': 'no-referrer' });
    next();
  });
  app.use(express.json({ limit: '50kb' }));

  app.get('/health', (_req, res) => res.json({ ok: true }));

  // התחברות: האתר שולח את הטוקן של Supabase (גוגל), והשרת מוציא עוגיית סשן מאובטחת.
  // מי שלא ברשימה נרשם כ"ממתין לאישור" ומקבל הודעה מתאימה (בלי גישה לשמע).
  const attempts = new Map();
  app.post('/auth/session', async (req, res) => {
    const ip = req.ip, now = Date.now();
    if (attempts.size > 2000) attempts.clear();
    const recent = (attempts.get(ip) || []).filter(t => now - t < 600000);
    if (recent.length >= 30) return res.status(429).json({ error: 'too_many' });
    attempts.set(ip, [...recent, now]);

    const user = await store.verifyToken(String(req.body?.access_token || ''));
    if (!user) return res.status(401).json({ error: 'invalid_token' });
    const { approved, isNew } = await store.registerLogin(user);
    access.invalidate(user.email);
    if (isNew && !approved) notifyAdmin(cfg, user.email);     // בלי await: לא מעכב את ההתחברות
    await auth.issue(res, user);
    res.json({ email: user.email, approved, isAdmin: cfg.ADMIN_EMAILS.includes(user.email), ...(approved ? {} : { message: NOT_APPROVED.message, message_he: NOT_APPROVED.message_he }) });
  });
  app.post('/auth/logout', (_req, res) => { auth.clear(res); res.json({ ok: true }); });
  app.get('/me', auth.requireSession, async (req, res) =>
    res.json({ email: req.user.email, approved: await access.isApproved(req.user.email), isAdmin: cfg.ADMIN_EMAILS.includes(req.user.email) }));

  const stream = makeStreamer(cfg, access);
  app.get('/stream/:id', auth.requireSession, (req, res, next) => stream(req, res).catch(next));
  app.head('/stream/:id', auth.requireSession, (req, res, next) => stream(req, res).catch(next));

  // ---------- ניהול (רק מיילים ב-ADMIN_EMAILS) ----------
  const adminPage = fs.readFileSync(new URL('../public/admin.html', import.meta.url));
  app.get('/admin', (_req, res) => {
    res.set({ 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store',
      'Content-Security-Policy': "default-src 'none'; style-src 'unsafe-inline'; script-src 'unsafe-inline'; connect-src 'self'; base-uri 'none'; frame-ancestors 'none'; form-action 'none'" });
    res.send(adminPage);
  });

  const admin = express.Router();
  admin.use(auth.requireSession, auth.requireAdmin);
  const needJson = (req, res, next) => (req.is('application/json') ? next() : res.status(415).json({ error: 'json_only' }));   // הגנה מ-CSRF

  admin.get('/users', async (req, res) => res.json({ users: await store.listUsers(String(req.query.status || 'all')) }));
  admin.post('/approve', needJson, async (req, res) => {
    const emails = parseEmails(req.body);
    if (!emails.length) return res.status(400).json({ error: 'no_valid_emails' });
    await store.setApproved(emails, true, req.user.email);
    emails.forEach(e => access.invalidate(e));
    res.json({ ok: true, count: emails.length, emails });
  });
  admin.post('/revoke', needJson, async (req, res) => {
    const emails = parseEmails(req.body).filter(e => !cfg.ADMIN_EMAILS.includes(e));   // לא מבטלים בטעות את המנהל עצמו
    if (!emails.length) return res.status(400).json({ error: 'no_valid_emails' });
    await store.setApproved(emails, false, req.user.email);
    emails.forEach(e => access.invalidate(e));
    res.json({ ok: true, count: emails.length, emails });
  });
  app.use('/admin/api', admin);

  app.use((err, _req, res, _next) => { console.error(err); if (!res.headersSent) res.status(500).json({ error: 'server_error' }); });
  return { app, store, access };
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const cfg = loadConfig();
  const { app } = buildApp(cfg);
  app.listen(cfg.PORT, () => console.log(`yalla-shirim backend listening on :${cfg.PORT}`));
}
