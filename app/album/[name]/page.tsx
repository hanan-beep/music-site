// app/album/[name]/page.tsx
import Player from './Player';
import BackButton from '@/app/BackButton';
import AlbumFavButton from '@/app/AlbumFavButton';
import AlbumTile from '@/app/AlbumTile';
import DetailHero from '@/app/DetailHero';
import PlayAllButton from '@/app/PlayAllButton';
import { AlbumIcon } from '@/app/Icons';
import { listFolder } from '@/lib/drive';

const IMAGE_MIME = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/jpg'];

const getFolderContents = (folderId: string) => listFolder(folderId);

export default async function AlbumPage({ params, searchParams }: any) {
  const folderId = decodeURIComponent((await params).name);
  const albumName = (await searchParams).name || folderId;
  const contents = await getFolderContents(folderId);

  const folders = contents.filter((f: any) => f.mimeType === 'application/vnd.google-apps.folder');
  const files = contents.filter((f: any) => f.mimeType !== 'application/vnd.google-apps.folder');
  const albumImage = files.find((f: any) => IMAGE_MIME.includes(f.mimeType)) || null;
  const audio = files
    .filter((f: any) => !IMAGE_MIME.includes(f.mimeType) && f.mimeType !== 'application/pdf')
    .map((f: any) => ({ id: f.id, name: f.name, albumName, coverId: albumImage?.id }));

  return (
    <main className="min-h-screen" dir="rtl">
      <DetailHero
        back={<BackButton />}
        title={albumName}
        meta={`${audio.length} שירים`}
        titleExtra={<div className="relative h-11 w-11 flex-none rounded-full bg-white/20"><AlbumFavButton album={{ id: folderId, name: albumName }} /></div>}
        visual={albumImage
          ? <img src={`/api/image/${albumImage.id}?w=500`} alt="" className="h-44 w-44 rounded-[28px] object-cover shadow-2xl ring-4 ring-white/30" />
          : <div className="grid h-44 w-44 place-items-center rounded-[28px] bg-white/15 ring-4 ring-white/20"><AlbumIcon size={72} color="white" /></div>}>
        <PlayAllButton songs={audio} />
      </DetailHero>

      <div className="mx-auto max-w-4xl px-4 py-6 sm:px-6">
        {folders.length > 0 && (
          <section className="mb-10">
            <h2 className="mb-4 font-display text-2xl font-extrabold">תיקיות</h2>
            <div className="grid grid-cols-2 gap-5 sm:grid-cols-3">
              {folders.map((f: any) => <AlbumTile key={f.id} id={f.id} name={f.name} />)}
            </div>
          </section>
        )}
        {files.length > 0 && <Player songs={files} albumImage={albumImage} albumName={albumName} />}
      </div>
      <footer className="px-6 pb-10 pt-6 text-center text-sm text-[#1B1033]/50">© כל הזכויות שמורות | By Yael</footer>
    </main>
  );
}
