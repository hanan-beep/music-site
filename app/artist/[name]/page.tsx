// app/artist/[name]/page.tsx
import Player from '@/app/album/[name]/Player';
import BackButton from '@/app/BackButton';
import ArtistFavButton from '@/app/ArtistFavButton';
import AlbumTile from '@/app/AlbumTile';
import DetailHero from '@/app/DetailHero';
import PlayAllButton from '@/app/PlayAllButton';
import { getArtistCatalog } from '@/lib/catalog';
import { MicIcon, FolderIcon } from '@/app/Icons';

const IMAGE_MIME = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/jpg'];

async function getArtistData(artistName: string) {
  const res = await fetch('https://music-site-flame.vercel.app/api/drive', { next: { revalidate: 3600 } });
  const artists = await res.json();
  return artists.find((a: any) => a.name === artistName);
}

async function getFolderContents(folderId: string) {
  const res = await fetch(`https://music-site-flame.vercel.app/api/drive?folderId=${folderId}`, { cache: 'no-store' });
  return res.json();
}

export default async function ArtistPage({ params }: any) {
  const artistName = decodeURIComponent((await params).name);
  const artist = await getArtistData(artistName);
  if (!artist) return <div dir="rtl" className="p-8 pt-24 text-center">זמר לא נמצא</div>;

  const [contents, cat] = await Promise.all([getFolderContents(artist.id), getArtistCatalog(artist.id)]);
  const folders = contents.filter((f: any) => f.mimeType === 'application/vnd.google-apps.folder');
  const songs = contents.filter((f: any) => f.mimeType !== 'application/vnd.google-apps.folder' && !IMAGE_MIME.includes(f.mimeType));
  const artistImage = contents.find((f: any) => IMAGE_MIME.includes(f.mimeType));
  const covers = new Map<string, string | undefined>(cat.albums.map(a => [a.id, a.coverId] as [string, string | undefined]));

  // "נגן הכל": כל שירי הזמר מהקטלוג (כולל אלבומים); אם הקטלוג ריק — רק השירים שבתיקייה הראשית
  const all = cat.songs.length
    ? cat.songs
    : songs.filter((f: any) => f.mimeType !== 'application/pdf').map((f: any) => ({ id: f.id, name: f.name, artistName }));

  return (
    <main className="min-h-screen" dir="rtl">
      <DetailHero
        back={<BackButton label="→ חזרה לזמרים" />}
        title={artistName}
        meta={`${folders.length} אלבומים • ${all.length} שירים`}
        titleExtra={<ArtistFavButton artist={{ id: artist.id, name: artistName }} />}
        visual={artistImage
          ? <img src={`/api/image/${artistImage.id}?w=400`} alt={artistName} className="h-36 w-36 rounded-full object-cover object-center shadow-2xl ring-4 ring-white/40" />
          : <div className="grid h-36 w-36 place-items-center rounded-full bg-white/15 ring-4 ring-white/30"><MicIcon size={56} color="white" /></div>}>
        <PlayAllButton songs={all} />
        <a href={`https://drive.google.com/drive/folders/${artist.id}`} target="_blank" rel="noopener noreferrer"
          className="inline-flex items-center gap-2 rounded-full px-5 py-3 text-sm font-bold text-white/90 ring-1 ring-white/30 hover:bg-white/10">
          <FolderIcon size={16} color="currentColor" /> הורד הכל מדרייב
        </a>
      </DetailHero>

      <div className="mx-auto max-w-4xl px-4 py-6 sm:px-6">
        {folders.length > 0 && (
          <section className="mb-10">
            <h2 className="mb-4 font-display text-2xl font-extrabold">אלבומים</h2>
            <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4">
              {folders.map((f: any) => <AlbumTile key={f.id} id={f.id} name={f.name} artistName={artistName} coverId={covers.get(f.id)} />)}
            </div>
          </section>
        )}
        {songs.length > 0 && (
          <section>
            <h2 className="mb-4 font-display text-2xl font-extrabold">שירים</h2>
            <Player songs={songs} artistName={artistName} />
          </section>
        )}
      </div>
      <footer className="px-6 pb-10 pt-6 text-center text-sm text-[#1B1033]/50">© כל הזכויות שמורות | By Yael</footer>
    </main>
  );
}
