// app/artist/[name]/page.tsx
import Link from 'next/link';
import Player from '@/app/album/[name]/Player';
import BackButton from '@/app/BackButton';
import AlbumFavButton from '@/app/AlbumFavButton';
import ArtistFavButton from '@/app/ArtistFavButton';
import { MicIcon, AlbumIcon, FolderIcon } from '@/app/Icons';

async function getArtistData(artistName: string) {
  const res = await fetch('https://music-site-flame.vercel.app/api/drive', {
    next: { revalidate: 3600 },
  });
  const artists = await res.json();
  return artists.find((a: any) => a.name === artistName);
}

async function getFolderContents(folderId: string) {
  const res = await fetch(
    `https://music-site-flame.vercel.app/api/drive?folderId=${folderId}`,
    { cache: 'no-store' }
  );
  return res.json();
}

export default async function ArtistPage({ params }: any) {
  const artistName = decodeURIComponent((await params).name);
  const artist = await getArtistData(artistName);

  if (!artist) {
    return <div dir="rtl" className="p-8 text-center">זמר לא נמצא</div>;
  }

  const contents = await getFolderContents(artist.id);
  const folders = contents.filter((f: any) => f.mimeType === 'application/vnd.google-apps.folder');
  const songs = contents.filter((f: any) => f.mimeType !== 'application/vnd.google-apps.folder');

  return (
    <main className="min-h-screen bg-gradient-to-br from-[#ffecd2] via-[#fcb69f] to-[#ffd1a9]" dir="rtl">
      <header className="bg-gradient-to-r from-[#FF512F] to-[#DD2476] p-6 text-center shadow-2xl">
        <BackButton label="→ חזרה לזמרים" />
        <div className="flex items-center justify-center gap-3">
          <MicIcon size={32} color="white" />
          <h1 className="text-3xl font-black text-white">{artistName}</h1>
          {/* כפתור מועדפים לזמר */}
          <ArtistFavButton artist={{ id: artist.id, name: artistName }} />
        </div>
      </header>

      <div className="p-8 pb-48">
        {folders.length > 0 && (
          <section className="mb-10">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-black text-[#DD2476] flex items-center gap-2">
                <AlbumIcon size={24} color="#DD2476" /> אלבומים
              </h2>
              <a href={`https://drive.google.com/drive/folders/${artist.id}`}
                target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-white border-2 border-[#DD2476] text-[#DD2476] font-bold text-sm px-4 py-2 rounded-2xl hover:bg-[#DD2476] hover:text-white transition-colors shadow">
                <FolderIcon size={16} color="currentColor" />
                הורד הכל מדרייב
              </a>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {folders.map((folder: any) => (
                <Link key={folder.id}
                  href={`/album/${folder.id}?name=${encodeURIComponent(folder.name)}`}
                  className="bg-[#ffe8cc] rounded-2xl p-4 text-center hover:scale-105 transition-transform shadow-md block group relative">
                  <div className="flex justify-center mb-2 group-hover:scale-110 transition-transform">
                    <AlbumIcon size={40} color="#54A0FF" />
                  </div>
                  <h3 className="font-bold text-[#DD2476]">{folder.name}</h3>
                  <AlbumFavButton album={{ id: folder.id, name: folder.name, artistName }} />
                </Link>
              ))}
            </div>
          </section>
        )}

        {songs.length > 0 && (
          <section>
            <h2 className="text-2xl font-black text-[#DD2476] mb-4">🎵 שירים</h2>
            <Player songs={songs} folderId={artist.id} />
          </section>
        )}
      </div>

      <footer className="bg-[#ffe8cc] text-center py-6 mt-8">
        <p className="text-[#DD2476] font-bold">✨ ♩ ♪ ♫ ♬ יאללה שירים 💪 ♬ ♫ ♪ ♩ ✨</p>
        <p className="text-gray-500 text-sm mt-2">© כל הזכויות שמורות | By Yael</p>
      </footer>
    </main>
  );
}
