// src/store.js — גישה למסד הנתונים (Supabase). בבדיקות משתמשים בגרסת זיכרון.
import { createClient } from '@supabase/supabase-js';

export function makeStore(cfg) {
  return cfg.TEST_MODE ? memoryStore() : supabaseStore(cfg);
}

function supabaseStore(cfg) {
  const db = createClient(cfg.SUPABASE_URL, cfg.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } });
  const T = 'access_users';
  const now = () => new Date().toISOString();

  return {
    // מאמת את הטוקן של Supabase (ההתחברות עם גוגל) ומחזיר את המשתמש
    async verifyToken(token) {
      const { data, error } = await db.auth.getUser(token);
      if (error || !data.user?.email) return null;
      return { id: data.user.id, email: data.user.email.toLowerCase() };
    },

    // בכל התחברות: אם המייל כבר ברשימה, רק מעדכנים; אם לא, נרשם כ"ממתין לאישור"
    async registerLogin(user) {
      const find = async () => (await db.from(T).select('is_approved').eq('email', user.email).maybeSingle()).data;
      const existing = await find();
      if (existing) {
        await db.from(T).update({ user_id: user.id, last_login_at: now() }).eq('email', user.email);
        return { approved: !!existing.is_approved, isNew: false };
      }
      const { error } = await db.from(T).insert({ email: user.email, user_id: user.id, is_approved: false, last_login_at: now() });
      if (error) {
        if (error.code === '23505') return { approved: !!(await find())?.is_approved, isNew: false };   // נרשם במקביל
        throw new Error('registerLogin: ' + error.message);
      }
      return { approved: false, isNew: true };
    },

    async isApproved(email) {
      const { data } = await db.from(T).select('is_approved').eq('email', email).maybeSingle();
      return !!data?.is_approved;
    },

    async listUsers(status) {
      let q = db.from(T).select('email,is_approved,requested_at,approved_at,approved_by,last_login_at,note')
        .order('requested_at', { ascending: false }).limit(1000);
      if (status === 'pending') q = q.eq('is_approved', false);
      if (status === 'approved') q = q.eq('is_approved', true);
      const { data, error } = await q;
      if (error) throw new Error('listUsers: ' + error.message);
      return data;
    },

    // מאשר או מבטל גישה למייל אחד או יותר (גם למי שעוד לא נכנס לאתר: אישור מראש)
    async setApproved(emails, approved, by) {
      const rows = emails.map(email => ({ email, is_approved: approved, approved_at: approved ? now() : null, approved_by: approved ? by : null }));
      const { error } = await db.from(T).upsert(rows, { onConflict: 'email' });
      if (error) throw new Error('setApproved: ' + error.message);
    },
  };
}

function memoryStore() {
  const users = new Map();
  return {
    async verifyToken(t) {
      const m = /^test:([^:]+):(.+)$/.exec(t || '');
      return m ? { id: m[1], email: m[2].toLowerCase() } : null;
    },
    async registerLogin(u) {
      const ex = users.get(u.email);
      if (ex) { ex.user_id = u.id; ex.last_login_at = new Date().toISOString(); return { approved: ex.is_approved, isNew: false }; }
      users.set(u.email, { email: u.email, user_id: u.id, is_approved: false, requested_at: new Date().toISOString(), approved_at: null, approved_by: null, last_login_at: new Date().toISOString() });
      return { approved: false, isNew: true };
    },
    async isApproved(email) { return !!users.get(email)?.is_approved; },
    async listUsers(status) {
      return [...users.values()].filter(u => status === 'pending' ? !u.is_approved : status === 'approved' ? u.is_approved : true);
    },
    async setApproved(emails, approved, by) {
      for (const email of emails) {
        const u = users.get(email) || { email, user_id: null, requested_at: new Date().toISOString(), last_login_at: null };
        users.set(email, { ...u, is_approved: approved, approved_at: approved ? new Date().toISOString() : null, approved_by: approved ? by : null });
      }
    },
  };
}
