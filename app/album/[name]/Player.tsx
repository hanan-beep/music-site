// app/album/[name]/Player.tsx
'use client';
import { usePlayer } from '@/app/PlayerContext';

export default function Player({
  songs,
  folderId,
  albumImage,
}: {
  songs: any[];
  folderId?: string;
  albumImage?: { id: string; name: string } | null;
}) {
  const { play, currentIndex, songs: globalSongs } = usePlayer();

  // בדיקה אם השיר הנוכחי שייך לרשימה הזו
  const isThisPlaylist = globalSongs.length > 0 && globalSongs[0]?.id === songs[0]?.id;
  const activeIndex = isThisPlaylist ? currentIndex : -1;

  function playSong(idx: number) {
    play(songs, idx);
  }

  return (
    <div className="pb-4">
      {/* כפתור הורדת תיקייה */}
      {folderId && (
        <div className="mb-4 flex justify-end">
          <a href={`https://drive.google.com/drive/folders/${folderId}`}
            target="_blank" rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-white border-2 border-[#DD2476] text-[#DD2476] font-black px-4 py-2 rounded-2xl hover:bg-[#DD2476] hover:text-white transition-colors shadow text-sm">
            📁 הורד תיקייה שלמה
          </a>
        </div>
      )}

      {/* תמונת אלבום — מתחת לכותרת שירים */}
      {albumImage && (
        <div className="mb-6 flex justify-center">
          <img
            src={`https://drive.google.com/thumbnail?id=${albumImage.id}&sz=w400`}
            alt="תמונת אלבום"
            className="w-48 h-48 object-cover rounded-3xl shadow-xl border-4 border-white"
          />
        </div>
      )}

      {/* רשימת שירים */}
      <div className="flex flex-col gap-3">
        {songs.map((song: any, idx: number) => {
          const isActive = activeIndex === idx;
          return (
            <div key={song.id} onClick={() => playSong(idx)}
              className={`rounded-2xl p-4 flex items-center justify-between shadow-md gap-3 cursor-pointer transition-all duration-200 ${
                isActive
                  ? 'bg-gradient-to-l from-[#FF512F]/20 to-[#DD2476]/20 border-2 border-[#DD2476] scale-[1.01]'
                  : 'bg-[#ffe8cc] hover:bg-[#ffd9aa] border-2 border-transparent'
              }`}>
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 font-black text-sm ${
                  isActive ? 'bg-[#DD2476] text-white' : 'bg-white/60 text-gray-400'
                }`}>
                  {isActive ? '🎵' : idx + 1}
                </div>
                <h3 className={`font-bold truncate ${isActive ? 'text-[#DD2476]' : 'text-gray-800'}`}>
                  {song.name.replace(/\.[^/.]+$/, '')}
                </h3>
              </div>
              <div className="flex gap-2 flex-shrink-0" onClick={e => e.stopPropagation()}>
                <button onClick={() => playSong(idx)}
                  className={`px-4 py-2 rounded-full text-sm font-bold transition-colors ${
                    isActive ? 'bg-[#DD2476] text-white' : 'bg-[#DD2476]/80 text-white hover:bg-[#DD2476]'
                  }`}>
                  {isActive ? '🎵 מנגן' : '▶️ האזן'}
                </button>
                <a href={`https://drive.google.com/uc?export=download&id=${song.id}`}
                  className="bg-[#FF512F] text-white px-4 py-2 rounded-full text-sm font-bold hover:opacity-80">
                  ⬇️
                </a>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
