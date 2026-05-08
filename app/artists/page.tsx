export default function Artists() {
  const artists = [
    { name: "אברהם פריד", emoji: "🎤" },
    { name: "יעקב שוואקי", emoji: "🎵" },
    { name: "מוטי שטיינמץ", emoji: "🎶" },
    { name: "איסי קאהן", emoji: "🎼" },
  ];

  return (
    <main className="min-h-screen bg-gradient-to-br from-[#ffecd2] via-[#fcb69f] to-[#ffd1a9] text-gray-800" dir="rtl">
      
      {/* Header */}
      <header className="bg-gradient-to-r from-[#FF512F] to-[#DD2476] p-6 text-center shadow-2xl">
        <a href="/" className="text-white text-sm mb-2 block">→ חזרה לדף הבית</a>
        <h1 className="text-3xl font-black text-white">🎤 זמרים</h1>
      </header>

      {/* רשימת זמרים */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-6 p-8">
        {artists.map((artist) => (
          <div key={artist.name}
            className="bg-[#ffe8cc] rounded-3xl p-6 text-center hover:scale-105 transition-transform cursor-pointer shadow-md">
            <div className="text-5xl mb-3">{artist.emoji}</div>
            <h3 className="font-bold text-lg text-[#DD2476]">{artist.name}</h3>
          </div>
        ))}
      </section>

      {/* Footer */}
      <footer className="bg-[#ffe8cc] text-center py-6 mt-8">
        <p className="text-[#DD2476] font-bold">✨ ♩ ♪ ♫ ♬ יאללה שירים 💪 ♬ ♫ ♪ ♩ ✨</p>
        <p className="text-gray-500 text-sm mt-2">© כל הזכויות שמורות | By Yael</p>
      </footer>

    </main>
  );
}