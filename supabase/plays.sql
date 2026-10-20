-- "הכי מושמעים": מדביקים ב-Supabase ← SQL Editor ← Run. אפשר להריץ שוב בלי בעיה.
-- נשמר רק מזהה השיר ושעת ההאזנה, בלי שום פרט על המאזין.
create table if not exists public.plays (
  id bigint generated always as identity primary key,
  song_id text not null,
  played_at timestamptz not null default now()
);
create index if not exists plays_time_idx on public.plays (played_at desc);
create index if not exists plays_song_idx on public.plays (song_id, played_at desc);
alter table public.plays enable row level security;  -- נעול מהדפדפן; רק השרת כותב וקורא

create or replace function public.top_songs(days int default 30, lim int default 12)
returns table (id text, name text, artist_name text, album_name text, plays bigint)
language sql stable as $$
  select s.id, s.name, s.artist_name, s.album_name, count(*) as plays
  from public.plays p join public.songs s on s.id = p.song_id
  where p.played_at > now() - make_interval(days => days)
  group by s.id, s.name, s.artist_name, s.album_name
  order by plays desc, s.name
  limit lim;
$$;
revoke execute on function public.top_songs(int, int) from public, anon, authenticated;
grant execute on function public.top_songs(int, int) to service_role;
