// app/album/[name]/Player.tsx
'use client';
import { usePlayer } from '@/app/PlayerContext';
import FavButton from '@/app/FavButton';
import { PlayIcon, DownloadIcon, FolderIcon } from '@/app/Icons';

const IMAGE_MIME = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/jpg'];
const PDF_MIME = ['application/pdf'];

function FileCard({ file, onPlay, isActive }: { file: any; onPlay: () => void; isActive: boolean }) {
  const isImage = IMAGE_MIME.includes(file.mimeType);
  const isPdf = PDF_MIME.includes(file.mimeType);
  const isMedia = !isImage && !isPdf;

  return (
    <div className={`rounded-2xl overflow-hidden shadow-md border-2 transition-all duration-200 ${
      isActive ? 'border-[#DD2476] scale-[1.01]' : 'border-transparent'
    }`}>
      {/* תצוגה מקדימה לתמונה */}
      {isImage && (
        <a href={`/api/image/${file.id}?w=1600`} target="_blank" rel="noopener noreferrer">
          <img
            src={`/api/image/${file.id}?w=400`}
            alt={file.name}
            className="w-full h-40 object-cover"
          />
        </a>
      )}

      {/* PDF */}
      {isPdf && (
        <div className="bg-red-50 p-3 flex items-center gap-3">
          <div className="w-10 h-10 bg-red-500 rounded-xl flex items-center justify-center flex-shrink-0">
            <span className="text-white font-black text-xs">PDF</span>
          </div>
          <p className="font-bold text-gray-800 truncate text-sm flex-1">{file.name}</p>
          <a href={`https://drive.google.com/file/d/${file.id}/preview`} target="_blank" rel="noopener noreferrer"
            className="bg-red-500 text-white px-3 py-2 rounded-xl text-sm font-black hover:opacity-80">
            צפה
          </a>
        </div>
      )}

      {/* שיר רגיל */}
      {isMedia && (
        <div className={`p-4 flex items-center gap-3 cursor-pointer ${isActive ? 'bg-gradient-to-l from-[#FF512F]/20 to-[#DD2476]/20' : 'bg-[#ffe8cc] hover:bg-[#ffd9aa]'}`}
          onClick={onPlay}>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 font-black text-sm ${isActive ? 'bg-[#DD2476] text-white' : 'bg-white/60 text-gray-400'}`}>
            {isActive ? <PlayIcon size={14} color="white" /> : '♪'}
          </div>
          <h3 className={`font-bold truncate flex-1 ${isActive ? 'text-[#DD2476]' : 'text-gray-800'}`}>
            {file.name.replace(/\.[^/.]+$/, '')}
          </h3>
          <div className="flex items-center gap-2 flex-shrink-0" onClick={e => e.stopPropagation()}>
            <FavButton song={file} />
            <button onClick={onPlay}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-full text-sm font-bold ${isActive ? 'bg-[#DD2476] text-white' : 'bg-[#DD2476]/80 text-white hover:bg-[#DD2476]'}`}>
              <PlayIcon size={14} color="white" />
              {isActive ? 'מנגן' : 'האזן'}
            </button>
            <a href={`/api/stream/${file.id}?download=1`}
              className="flex items-center gap-1.5 bg-[#FF512F] text-white px-3 py-2 rounded-full text-sm font-bold hover:opacity-80">
              <DownloadIcon size={14} color="white" />
              הורד
            </a>
          </div>
        </div>
      )}
    </div>
  );
}

export default function Player({ songs, folderId, albumImage }: {
  songs: any[];
  folderId?: string;
  albumImage?: { id: string; name: string } | null;
}) {
  const { play, currentIndex, songs: globalSongs } = usePlayer();
  
  // רק קבצי אודיו לניגון
  const audioFiles = songs.filter(s => !IMAGE_MIME.includes(s.mimeType) && !PDF_MIME.includes(s.mimeType));
  const isThisPlaylist = globalSongs.length > 0 && audioFiles.length > 0 && globalSongs[0]?.id === audioFiles[0]?.id;
  const activeAudioIndex = isThisPlaylist ? currentIndex : -1;

  return (
    <div className="pb-4">
      {folderId && (
        <div className="mb-4 flex justify-end">
          <a href={`https://drive.google.com/drive/folders/${folderId}`} target="_blank" rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-white border-2 border-[#DD2476] text-[#DD2476] font-black px-4 py-2 rounded-2xl hover:bg-[#DD2476] hover:text-white transition-colors shadow text-sm">
            <FolderIcon size={16} color="currentColor" />
            הורד תיקייה שלמה
          </a>
        </div>
      )}

      {albumImage && (
        <div className="mb-6 flex justify-center">
          <img src={`/api/image/${albumImage.id}?w=400`}
            alt="תמונת אלבום" className="w-48 h-48 object-cover rounded-3xl shadow-xl border-4 border-white" />
        </div>
      )}

      <div className="flex flex-col gap-3">
        {songs.map((file: any, idx: number) => {
          const isAudio = !IMAGE_MIME.includes(file.mimeType) && !PDF_MIME.includes(file.mimeType);
          const audioIdx = audioFiles.findIndex(a => a.id === file.id);
          const isActive = isAudio && activeAudioIndex === audioIdx;

          return (
            <FileCard
              key={file.id}
              file={file}
              isActive={isActive}
              onPlay={() => isAudio && play(audioFiles, audioIdx)}
            />
          );
        })}
      </div>
    </div>
  );
}
