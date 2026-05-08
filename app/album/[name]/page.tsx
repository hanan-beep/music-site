async function getSongs(album: string) {
  const res = await fetch(
    `https://music-site-flame.vercel.app/api/songs?album=${encodeURIComponent(album)}`,
    { cache: 'no-store' }
  );
  return res.json();
}

export default async function AlbumPage({ params }: any) {
  const albumName = decodeURIComponent((await params).name);
  const songs = await getSongs(albumName);

  return (
    <main className="min-h-screen bg-gradient-to-br from-[#ffecd2] via-[#fcb69f] to-[#ffd1a9]" dir="rtl">
      
      <header className="bg-gradient-to-r from-[#FF512F] to-[#DD2476] p-6 text-center shadow-2xl">
        <a href="javascript:history.back()" className="text-white text-sm mb-2 block">→ חזרה</a>
        <h1 className="text-3xl font-black text-white">💿 {albumName}</h1>
      </header>

      <div className="p-8">
        <h2 className="text-2xl font-black text-[#DD2476] mb-4">🎵 שירים</h2>
        <div className="flex flex-col gap-3">
          {songs.map((song: any) => (
            <div key={song.id}
              className="bg-[#ffe8cc] rounded-2xl p-4 flex items-center justify-between shadow-md">
              <h3 className="font-bold text-gray-800">{song.fields['שם השיר']}</h3>
              <div className="flex gap-2">
                <a href={song.fields['קישור MP3']}
                  className="bg-[#DD2476] text-white px-4 py-2 rounded-full text-sm font-bold hover:opacity-80">
                  ▶️ האזן
                </a>
                <a href={song.fields['קישור MP3']}
                  download
                  className="bg-[#FF512F] text-white px-4 py-2 rounded-full text-sm font-bold hover:opacity-80">
                  ⬇️ הורד
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>

      <footer className="bg-[#ffe8cc] text-center py-6 mt-8">
        <p className="text-[#DD2476] font-bold">✨ ♩ ♪ ♫ ♬ יאללה שירים 💪 ♬ ♫ ♪ ♩ ✨</p>
        <p className="text-gray-500 text-sm mt-2">© כל הזכויות שמורות | By Yael</p>
      </footer>
    </main>
  );
}