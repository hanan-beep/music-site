'use client';
import { useState } from 'react';

export default function Player({
  songs,
  folderId,
  albumImage,
}: {
  songs: any[];
  folderId?: string;
  albumImage?: { id: string; name: string } | null;
}) {
  const [currentIndex, setCurrentIndex] = useState<number>(-1);
  const current = currentIndex >= 0 ? songs[currentIndex] : null;

  function play(idx: number) {
    if (idx >= 0 && idx < songs.length) setCurrentIndex(idx);
  }

  return (
    <div className="pb-44">
      {/* תמונת אלבום */}
      {albumImage && (
        <div className="mb-6 flex justify-center">
          <img
            src={`https://drive.google.com/thumbnail?id=${albumImage.id}&sz=w400`}
            alt="תמונת אלבום"
            className="w-48 h-48 object-cover rounded-3xl shadow-xl border-4 border-white"
          />
        </div>
      )}

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

      {/* רשימת שירים */}
      <div className="flex flex-col gap-3">
        {songs.map((song: any, idx: number) => {
          const isActive = currentIndex === idx;
          return (
            <div key={song.id}
              onClick={() => play(idx)}
              className={`rounded-2xl p-4 flex items-center justify-between shadow-md gap-3 cursor-pointer transition-all duration-200 ${
                isActive
                  ? 'bg-gradient-to-l from-[#FF512F]/20 to-[#DD2476]/20 border-2 border-[#DD2476] scale-[1.01]'
                  : 'bg-[#ffe8cc] hover:bg-[#ffd9aa] border-2 border-transparent'
              }`}>
              <div className="flex items-center gap-3 flex-1 min-w-0">
                {/* מספר / אנימציה */}
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
                <button onClick={() => play(idx)}
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

      {/* נגן תחתון */}
      {current && (
        <div className="fixed bottom-0 left-0 right-0 w-full shadow-2xl" style={{ zIndex: 100 }}>
          {/* שורת ניווט */}
          <div className="bg-gradient-to-r from-[#FF512F] to-[#DD2476] px-4 py-3 flex items-center gap-3 w-full">

            {/* ⏮ קודם */}
            <button onClick={() => play(currentIndex - 1)} disabled={currentIndex <= 0}
              className="flex-shrink-0 flex items-center gap-1 bg-white/20 hover:bg-white/30 disabled:opacity-30 text-white font-black px-3 py-2 rounded-xl transition-colors text-sm">
              ⏮ <span className="hidden sm:inline">קודם</span>
            </button>

            {/* שם שיר */}
            <div className="flex-1 text-center min-w-0">
              <p className="font-black text-white truncate text-sm">
                {current.name.replace(/\.[^/.]+$/, '')}
              </p>
              <p className="text-white/60 text-xs">{currentIndex + 1} / {songs.length}</p>
            </div>

            {/* ⏭ הבא */}
            <button onClick={() => play(currentIndex + 1)} disabled={currentIndex >= songs.length - 1}
              className="flex-shrink-0 flex items-center gap-1 bg-white text-[#DD2476] font-black px-3 py-2 rounded-xl hover:bg-pink-50 disabled:opacity-30 transition-colors shadow text-sm">
              <span className="hidden sm:inline">הבא</span> ⏭
            </button>

            {/* ✕ */}
            <button onClick={() => setCurrentIndex(-1)}
              className="flex-shrink-0 text-white hover:opacity-70 text-xl font-bold">
              ✕
            </button>
          </div>

          {/* iframe */}
          <div className="w-full bg-black" style={{ height: 80 }}>
            <iframe
              key={current.id}
              src={`https://drive.google.com/file/d/${current.id}/preview`}
              style={{ width: '100%', height: '80px', display: 'block', border: 'none' }}
              allow="autoplay"
            />
          </div>
        </div>
      )}
    </div>
  );
}
