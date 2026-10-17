// app/favorites/page.tsx
'use client';
import { useFavorites } from '@/app/FavoritesContext';
import { usePlayer } from '@/app/PlayerContext';
import { useAuth } from '@/app/AuthContext';
import PageHero from '@/app/PageHero';
import SignInPrompt from '@/app/SignInPrompt';
import EmptyState from '@/app/EmptyState';
import SongRow from '@/app/SongRow';
import AlbumTile from '@/app/AlbumTile';
import PlayAllButton from '@/app/PlayAllButton';
import { HeartIcon } from '@/app/Icons';

export default function FavoritesPage() {
  const { favorites, favoriteAlbums } = useFavorites();
  const { play, currentIndex, songs: queue } = usePlayer();
  const { user } = useAuth();
  const nowId = currentIndex >= 0 ? queue[currentIndex]?.id : null;

  if (!user) return (
    <main className="min-h-screen" dir="rtl">
      <PageHero title="מועדפים" />
      <SignInPrompt title="צריך להתחבר" text="התחברו עם Google כדי לראות ולשמור את המועדפים שלכם" />
    </main>
  );

  const empty = favorites.length === 0 && favoriteAlbums.length === 0;
  return (
    <main className="min-h-screen" dir="rtl">
      <PageHero title="מועדפים" meta={empty ? undefined : `${favorites.length} שירים • ${favoriteAlbums.length} אלבומים וזמרים`}>
        <PlayAllButton songs={favorites} />
      </PageHero>

      <div className="mx-auto max-w-4xl px-4 py-6 sm:px-6">
        {favorites.length > 0 && (
          <section className="mb-10">
            <h2 className="mb-3 font-display text-2xl font-extrabold">שירים</h2>
            <ul className="space-y-2">
              {favorites.map((song, idx) => (
                <SongRow key={song.id} song={song} sub={[song.artistName, song.albumName].filter(Boolean).join(' • ')}
                  active={nowId === song.id} onPlay={() => play(favorites, idx)} />
              ))}
            </ul>
          </section>
        )}

        {favoriteAlbums.length > 0 && (
          <section className="mb-10">
            <h2 className="mb-4 font-display text-2xl font-extrabold">אלבומים וזמרים</h2>
            <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4">
              {favoriteAlbums.map(a => <AlbumTile key={a.id} id={a.id} name={a.name} artistName={a.artistName} />)}
            </div>
          </section>
        )}

        {empty && (
          <EmptyState icon={<HeartIcon size={36} color="white" />} title="אין מועדפים עדיין"
            text="לחצו על הלב ליד שיר או אלבום ותמצאו אותם כאן" href="/songs" cta="לדף השירים" />
        )}
      </div>
      <footer className="px-6 pb-10 pt-6 text-center text-sm text-[#1B1033]/50">© כל הזכויות שמורות | By Yael</footer>
    </main>
  );
}
