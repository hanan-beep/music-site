// app/album/[name]/Player.tsx
'use client';
import { useState } from 'react';

export default function Player({
  songs,
  folderId,
}: {
  songs: any[];
  folderId?: string;
}) {
  const [current, setCurrent] = useState<any>(null);

  return (
    <div>
      {/* כפתור הורדת תיקייה שלמה */}
      {folderId && (
        <div className="mb-4 flex justify-end">
          <a
            href={`https://drive.google.com/drive/folders/${folderId}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-white border-2 border-[#DD2476] text-[#DD2476] font-black px-5 py-2.5 rounded-2xl hover:bg-[#DD2476] hover:text-white transition-colors shadow"
          >
            📁 הורד תיקייה שלמה מדרייב
          </a>
        </div>
      )}

      <div className="flex flex-col gap-3">
        {songs.map((song: any) => (
          <div key={song.id}
            className="bg-[#ffe8cc] rounded-2xl p-4 flex items-center justify-between shadow-md gap-3">
            <h3 className="font-bold text-gray-800 flex-1 truncate">
              {song.name.replace(/\.[^/.]+$/, '')}
            </h3>
            <div className="flex gap-2 flex-shrink-0">
              <button
                onClick={() => setCurrent(song)}
                className="bg-[#DD2476] text-white px-4 py-2 rounded-full text-sm font-bold hover:opacity-80">
                ▶️ האזן
              </button>
              <a
                href={`https://drive.google.com/uc?export=download&id=${song.id}`}
                className="bg-[#FF512F] text-white px-4 py-2 rounded-full text-sm font-bold hover:opacity-80">
                ⬇️ הורד
              </a>
            </div>
          </div>
        ))}
      </div>

      {current && (
        <div className="fixed bottom-0 left-0 right-0 w-full shadow-2xl" style={{ zIndex: 100 }}>
          <div className="bg-gradient-to-r from-[#FF512F] to-[#DD2476] px-6 py-2 flex items-center justify-between w-full">
            <p className="font-black text-white text-lg truncate">
              🎵 {current.name.replace(/\.[^/.]+$/, '')}
            </p>
            <button onClick={() => setCurrent(null)}
              className="text-white hover:opacity-70 text-2xl font-bold ml-4 flex-shrink-0">
              ✕
            </button>
          </div>
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
