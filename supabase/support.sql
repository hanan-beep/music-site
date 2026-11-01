-- שאלת התמיכה באתר: מדביקים ב-Supabase ← SQL Editor ← Run. אפשר להריץ שוב בלי בעיה.
create table if not exists public.support_votes (
  user_email text primary key,
  answer text not null check (answer in ('yes', 'no')),
  created_at timestamptz not null default now()
);
alter table public.support_votes enable row level security;   -- נעול מהדפדפן
revoke all on public.support_votes from anon, authenticated;
