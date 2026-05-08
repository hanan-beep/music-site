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

      {/* נגן קבוע בתחתית */}
      {current && (
        <div className="fixed bottom-0 left-0 right-0 bg-[#2d3436] text-white p-4 shadow-2xl" dir="rtl">
          <p className="text-center font-bold text-[#DD2476] mb-2">
            🎵 {current.name.replace(/\.[^/.]+$/, '')}
          </p>
          <audio
            key={current.id}
            controls
            autoPlay
            className="w-full"
            src={`https://drive.google.com/uc?export=view&id=${current.id}`}>
          </audio>
          <button
            onClick={() => setCurrent(null)}
            className="absolute top-2 left-2 text-gray-400 hover:text-white text-xl">
            ✕
          </button>
        </div>
      )}
    </div>
  );
}