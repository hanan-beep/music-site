'use client';
import { useState, useEffect, useRef } from 'react';

const IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

export default function Player({
  songs,
  folderId,
  albumImage,
}: {
  songs: any[];
  folderId?: string;
  albumImage?: { id: string; name: string } | null;
}) {
  const [current, setCurrent] = useState<any>(null);
  const [currentIndex, setCurrentIndex] = useState<number>(-1);
  const [autoPlay, setAutoPlay] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // כשמשתנה השיר הנוכחי — עדכן index
  useEffect(() => {
    if (current) {
      const idx = songs.findIndex(s => s.id === current.id);
      setCurrentIndex(idx);
    }
  }, [current, songs]);

  function playSong(song: any) {
    setCurrent(song);
  }

  function playNext() {
    if (currentIndex < songs.length - 1) {
      setCurrent(songs[currentIndex + 1]);
    } else {
      // סיים את כל השירים
      setAutoPlay(false);
    }
  }

  function playPrev() {
    if (currentIndex > 0) {
      setCurrent(songs[currentIndex - 1]);
    }
  }

  function playAll() {
    setAutoPlay(true);
    setCurrent(songs[0]);
  }

  // המתנה לסיום האייפריים — Google Drive preview לא תומך ב-onEnded
  // אז אנחנו מאזינים ל-message מהאייפריים או משתמשים בטיימר אוטומטי
  useEffect(() => {
    if (!autoPlay || !current) return;
    // כל שיר Google Drive preview הוא בערך 3-5 דקות
    // נאזין ל-postMessage מהאייפריים
    function handleMessage(e: MessageEvent) {
      if (e.data === 'ended' || (typeof e.data === 'string' && e.data.includes('ended'))) {
        playNext();
      }
    }
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [autoPlay, current, currentIndex]);

  return (
    <div>
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

      {/* כפתורי שליטה */}
      <div className="mb-4 flex items-center justify-between gap-3 flex-wrap">
        {folderId && (
          <a href={`https://drive.google.com/drive/folders/${folderId}`}
            target="_blank" rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-white border-2 border-[#DD2476] text-[#DD2476] font-black px-4 py-2 rounded-2xl hover:bg-[#DD2476] hover:text-white transition-colors shadow text-sm">
            📁 הורד תיקייה שלמה
          </a>
        )}
        <button
          onClick={playAll}
          className="inline-flex items-center gap-2 bg-[#DD2476] text-white font-black px-4 py-2 rounded-2xl hover:opacity-80 transition-opacity shadow text-sm">
          ▶️ נגן הכל ברצף
        </button>
      </div>

      {/* רשימת שירים */}
      <div className="flex flex-col gap-3">
        {songs.map((song: any, idx: number) => (
          <div key={song.id}
            className={`rounded-2xl p-4 flex items-center justify-between shadow-md gap-3 transition-colors ${
              current?.id === song.id ? 'bg-[#DD2476]/10 border-2 border-[#DD2476]' : 'bg-[#ffe8cc]'
            }`}>
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <span className="text-gray-400 text-sm font-bold w-6 text-center flex-shrink-0">
                {current?.id === song.id ? '🎵' : idx + 1}
              </span>
              <h3 className="font-bold text-gray-800 truncate">
                {song.name.replace(/\.[^/.]+$/, '')}
              </h3>
            </div>
            <div className="flex gap-2 flex-shrink-0">
              <button onClick={() => playSong(song)}
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

      {/* נגן תחתון */}
      {current && (
        <div className="fixed bottom-0 left-0 right-0 w-full shadow-2xl" style={{ zIndex: 100 }}>
          {/* שורת שליטה */}
          <div className="bg-gradient-to-r from-[#FF512F] to-[#DD2476] px-4 py-2 flex items-center justify-between w-full gap-2">
            <button onClick={playPrev} disabled={currentIndex <= 0}
              className="text-white font-bold text-lg hover:opacity-70 disabled:opacity-30 flex-shrink-0">
              ⏮
            </button>
            <p className="font-black text-white truncate flex-1 text-center text-sm">
              🎵 {current.name.replace(/\.[^/.]+$/, '')}
            </p>
            <button onClick={playNext} disabled={currentIndex >= songs.length - 1}
              className="text-white font-bold text-lg hover:opacity-70 disabled:opacity-30 flex-shrink-0">
              ⏭
            </button>
            <button onClick={() => { setCurrent(null); setAutoPlay(false); }}
              className="text-white hover:opacity-70 text-xl font-bold flex-shrink-0 mr-2">
              ✕
            </button>
          </div>

          {/* iframe */}
          <div className="w-full bg-black" style={{ height: 80 }}>
            <iframe
              ref={iframeRef}
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
