-- רשימת מורשים (whitelist): מדביקים ב-Supabase ← SQL Editor ← Run. אפשר להריץ שוב בלי בעיה.
create table if not exists public.access_users (
  email text primary key check (email = lower(email)),   -- המייל של גוגל, באותיות קטנות
  user_id uuid,                                           -- מתמלא בהתחברות הראשונה
  is_approved boolean not null default false,             -- הדגל: true = גישה מלאה
  requested_at timestamptz not null default now(),        -- מתי ביקש גישה (נכנס לראשונה)
  approved_at timestamptz,
  approved_by text,
  last_login_at timestamptz,
  note text                                               -- הערה חופשית שלך (למשל "חבר של דוד")
);
create index if not exists access_users_approved_idx on public.access_users (is_approved);

alter table public.access_users enable row level security;   -- נעול מהדפדפן; רק השרת (service role) ניגש
revoke all on public.access_users from anon, authenticated;

-- ===== דוגמאות לשימוש ידני (אפשר גם דרך Table Editor או דף הניהול) =====
-- לאשר מישהו שכבר ביקש גישה:
--   update public.access_users set is_approved = true, approved_at = now(), approved_by = 'me' where email = 'someone@gmail.com';
-- לאשר מראש מישהו שעוד לא נכנס לאתר:
--   insert into public.access_users (email, is_approved, approved_at, approved_by)
--   values ('someone@gmail.com', true, now(), 'me') on conflict (email) do update set is_approved = true, approved_at = now(), approved_by = 'me';
-- לבטל גישה:
--   update public.access_users set is_approved = false, approved_at = null where email = 'someone@gmail.com';

-- ===== ניקוי של מה שהיה למודל התשלום (רק אם הרצת אותו קודם; מוחק את הנתונים!) =====
-- drop table if exists public.payments, public.subscriptions;
-- drop function if exists public.apply_payment(uuid, text, text, text, text, int, int);
