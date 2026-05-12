// app/album/[name]/page.tsx
import Player from './Player';
import BackButton from '@/app/BackButton';

const IMAGE_MIME = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/jpg'];

async function getFolderContents(folderId: string) {
  const res = await fetch(
    `https://music-site-flame.vercel.app/api/drive?folderId=${folderId}`,
    { cache: 'no-store' }
  );
  return res.json();
}

export default async function AlbumPage({ params, searchParams }: any) {
  const folderId = decodeURIComponent((await params).name);
  const albumName = (await searchParams).name || folderId;
  const contents = await getFolderContents(folderId);

  const folders = contents.filter(
    (f: any) => f.mimeType === 'application/vnd.google-apps.folder'
  );
  const songs = contents.filter(
    (f: any) => f.mimeType !== 'application/vnd.google-apps.folder'
      && !IMAGE_MIME.includes(f.mimeType)
  );
  // תמונת אלבום — הקובץ הראשון שהוא תמונה
  const albumImage = contents.find((f: any) => IMAGE_MIME.includes(f.mimeType)) || null;

  return (
    <main className="min-h-screen bg-gradient-to-br from-[#ffecd2] via-[#fcb69f] to-[#ffd1a9] pb-32" dir="rtl">
      <header className="bg-gradient-to-r from-[#FF512F] to-[#DD2476] p-6 text-center shadow-2xl">
        <BackButton />
        {/* תמונת אלבום קטנה בכותרת */}
        {albumImage && (
          <div className="flex justify-center mb-3">
            <img
              src={`https://drive.google.com/thumbnail?id=${albumImage.id}&sz=w120`}
              alt={albumName}
              className="w-20 h-20 object-cover rounded-2xl shadow-lg border-2 border-white/50"
            />
          </div>
        )}
        <h1 className="text-3xl font-black text-white">💿 {albumName}</h1>
      </header>

      <div className="p-8">
        {folders.length > 0 && (
          <section className="mb-10">
            <h2 className="text-2xl font-black text-[#DD2476] mb-4">📁 תיקיות</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {folders.map((folder: any) => (
                <a key={folder.id}
                  href={`/album/${folder.id}?name=${encodeURIComponent(folder.name)}`}
                  className="bg-[#ffe8cc] rounded-2xl p-4 text-center hover:scale-105 transition-transform shadow-md block">
                  <div className="text-4xl mb-2">📁</div>
                  <h3 className="font-bold text-[#DD2476]">{folder.name}</h3>
                </a>
              ))}
            </div>
          </section>
        )}

        {songs.length > 0 && (
          <section>
            <h2 className="text-2xl font-black text-[#DD2476] mb-4">🎵 שירים</h2>
            <Player songs={songs} folderId={folderId} albumImage={albumImage} />
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
