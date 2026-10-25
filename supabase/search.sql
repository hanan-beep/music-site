-- חיפוש חכם: מדביקים ב-Supabase ← SQL Editor ← Run. אפשר להריץ שוב בלי בעיה.
-- מתעלם מניקוד, גרשיים ופיסוק, מבין כמה מילים (בכל סדר, בשם שיר/זמר/אלבום/חודש), ומסלח על טעויות כתיב קטנות.
set search_path to public, extensions;
create extension if not exists pg_trgm with schema extensions;

-- 1. נרמול טקסט: אותיות קטנות, בלי ניקוד, סופיות כרגילות, יי/וו כאות אחת, כל סימן אחר הופך לרווח
create or replace function public.norm(t text) returns text
language sql immutable parallel safe as $$
  select btrim(regexp_replace(
    regexp_replace(
      regexp_replace(
        translate(lower(coalesce(t, '')), 'ךםןףץ', 'כמנפצ'),
        '[\u0591-\u05c7]', '', 'g'),
      '([יו])\1+', '\1', 'g'),
    '[^a-z0-9\u05d0-\u05ea]+', ' ', 'g'))
$$;

-- 2. עמודת חיפוש מחושבת אוטומטית בכל טבלה
alter table public.artists add column if not exists search text
  generated always as (public.norm(name)) stored;
alter table public.albums add column if not exists search text
  generated always as (public.norm(name || ' ' || artist_name)) stored;
alter table public.songs add column if not exists search text
  generated always as (public.norm(regexp_replace(name, '\.[^./]+$', '') || ' ' || artist_name || ' ' || album_name)) stored;

create index if not exists artists_search_trgm on public.artists using gin (search gin_trgm_ops);
create index if not exists albums_search_trgm  on public.albums  using gin (search gin_trgm_ops);
create index if not exists songs_search_trgm   on public.songs   using gin (search gin_trgm_ops);

-- 3. תצוגה מאוחדת (נעולה מהדפדפן)
create or replace view public.search_items with (security_invoker = true) as
  select 'artist'::text as kind, id, name, ''::text as artist_name, ''::text as album_name,
         search as hay, public.norm(name) as nname from public.artists
  union all
  select 'album'::text, id, name, artist_name, ''::text, search, public.norm(name) from public.albums
  union all
  select case when artist_id = 'monthly-album' then 'album' else 'song' end, id, name, artist_name, album_name,
         search, public.norm(regexp_replace(name, '\.[^./]+$', '')) from public.songs;
revoke all on public.search_items from anon, authenticated;
grant select on public.search_items to service_role;

-- 4. פונקציית החיפוש
create or replace function public.search_catalog(q text, lim int default 30)
returns table (kind text, id text, name text, artist_name text, album_name text, score real)
language plpgsql set search_path = public, extensions as $$
#variable_conflict use_column
declare
  nq text := public.norm(left(coalesce(q, ''), 80));
  toks text[];
begin
  if nq = '' then return; end if;
  toks := string_to_array(nq, ' ');
  perform set_config('pg_trgm.word_similarity_threshold', '0.5', true);

  return query
  with exact as (
    select i.kind, i.id, i.name, i.artist_name, i.album_name,
      (case when i.nname = nq then 10 when i.nname like nq || '%' then 6 when i.nname like '%' || nq || '%' then 4 else 0 end
       + case when i.hay like nq || '%' then 1 else 0 end
       + case i.kind when 'artist' then 2 when 'album' then 1 else 0 end)::real as score
    from public.search_items i
    where i.hay like '%' || toks[1] || '%'
      and not exists (select 1 from unnest(toks) t where i.hay not like '%' || t || '%')
  ),
  fuzzy as (
    select i.kind, i.id, i.name, i.artist_name, i.album_name,
      (word_similarity(nq, i.hay) * 3)::real as score
    from public.search_items i
    where (select count(*) from exact) < 5
      and nq <% i.hay
      and not exists (select 1 from exact e where e.id = i.id)
  ),
  merged as (select * from exact union all select * from fuzzy),
  ranked as (
    select m.*, row_number() over (partition by m.kind order by m.score desc, length(m.name), m.name) as rn from merged m
  )
  select r.kind, r.id, r.name, r.artist_name, r.album_name, r.score
  from ranked r
  where r.rn <= case r.kind when 'artist' then 4 when 'album' then 6 else 20 end
  order by case r.kind when 'artist' then 0 when 'album' then 1 else 2 end, r.score desc, length(r.name);
end $$;
revoke execute on function public.search_catalog(text, int) from public, anon, authenticated;
grant execute on function public.search_catalog(text, int) to service_role;
