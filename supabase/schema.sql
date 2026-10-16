-- קטלוג יאללה שירים: מדביקים ב-Supabase ← SQL Editor ← Run
create table if not exists artists (
  id text primary key, name text not null, image_id text, synced_at timestamptz default now());
create table if not exists albums (
  id text primary key, name text not null, artist_id text, artist_name text not null,
  cover_id text, synced_at timestamptz default now());
create table if not exists songs (
  id text primary key, name text not null, artist_id text, album_id text,
  artist_name text not null, album_name text not null default '',
  created_at timestamptz, synced_at timestamptz default now());
create index if not exists songs_artist_idx on songs (artist_id);
create index if not exists songs_album_idx on songs (album_id);
-- נעול לגמרי מהדפדפן; רק השרת (service role) קורא וכותב
alter table artists enable row level security;
alter table albums enable row level security;
alter table songs enable row level security;
