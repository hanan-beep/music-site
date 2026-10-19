-- אבטחת נתוני המשתמשים (מועדפים והיסטוריה): כל משתמש רואה ומשנה רק את השורות של עצמו.
-- מדביקים ב-Supabase ← SQL Editor ← Run. אפשר להריץ שוב בלי בעיה.

-- 1. מוחקים כללי גישה ישנים על שלוש הטבלאות (כדי שלא יישאר כלל רחב מדי)
do $$
declare r record;
begin
  for r in select policyname, tablename from pg_policies
           where schemaname = 'public' and tablename in ('history', 'favorites', 'favorite_albums')
  loop
    execute format('drop policy %I on public.%I', r.policyname, r.tablename);
  end loop;
end $$;

-- 2. מדליקים הגנה ברמת שורה
alter table public.history          enable row level security;
alter table public.favorites        enable row level security;
alter table public.favorite_albums  enable row level security;

-- 3. כל משתמש מחובר ניגש רק לשורות שה-user_id שלהן הוא המייל שלו
create policy "own history" on public.history for all to authenticated
  using (user_id = (auth.jwt() ->> 'email')) with check (user_id = (auth.jwt() ->> 'email'));
create policy "own favorites" on public.favorites for all to authenticated
  using (user_id = (auth.jwt() ->> 'email')) with check (user_id = (auth.jwt() ->> 'email'));
create policy "own favorite albums" on public.favorite_albums for all to authenticated
  using (user_id = (auth.jwt() ->> 'email')) with check (user_id = (auth.jwt() ->> 'email'));

-- 4. מי שלא מחובר לא ניגש לשום דבר
revoke all on public.history, public.favorites, public.favorite_albums from anon;
