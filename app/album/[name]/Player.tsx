'use client';
import { useState } from 'react';

export default function Player({ songs }: { songs: any[] }) {
  const [current, setCurrent] = useState<any>(null);

  return (
    <div>
      <div className="flex flex-col gap-3">
        {songs.map((song: any) => (
          <div key={song.id}
            className="bg-[#ffe8cc] rounded-2xl p-4 flex items-center justify-between shadow-md">
            <h3 className="font-bold text-gray-800">{song.name.replace(/\.[^/.]+$/, '')}</h3>
            <div className="flex gap-2">
              <button
                onClick={() => setCurrent(song)}
                className="bg-[#DD2476] text-white px-4 py-2 rounded-full text-sm font-bold hover:opacity-80">
                ▶️ האזן
              </button>
              <a href={`https://drive.google.com/uc?export=download&id=${song.id}`}
                className="bg-[#FF512F] text-white px-4 py-2 rounded-full text-sm font-bold hover:opacity-80">
                ⬇️ הורד
              </a>
            </div>
          </div>
        ))}
      </div>

      {current && (
        <div className="fixed bottom-0 left-0 right-0 shadow-2xl" dir="rtl">
          <div className="bg-gradient-to-r from-[#FF512F] to-[#DD2476] px-6 py-2 flex items-center justify-between">
            <p className="font-black text-white text-lg truncate">
              🎵 {current.name.replace(/\.[^/.]+$/, '')}
            </p>
            <button
              onClick={() => setCurrent(null)}
              className="text-white hover:opacity-70 text-2xl font-bold ml-4">
              ✕
            </button>
          </div>
          <iframe
            key={current.id}
            src={`https://drive.google.com/file/d/${current.id}/preview`}
            className="w-full"
            height="80"
            allow="autoplay">
          </iframe>
        </div>
      )}
    </div>
  );
}