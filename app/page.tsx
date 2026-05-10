// app/page.tsx
export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-[#ffecd2] via-[#fcb69f] to-[#ffd1a9] text-white" dir="rtl">

      <header className="bg-gradient-to-r from-[#FF512F] to-[#DD2476] p-6 text-center shadow-2xl">
        <div className="flex items-center justify-center gap-4">
          <img src="/logo.png" alt="לוגו" className="w-16 h-16 rounded-full" />
          <h1 className="text-4xl font-black tracking-wide">יאללה שירים 💪</h1>
        </div>
        <p className="text-pink-100 mt-2 text-lg">הארכיון המוזיקלי החרדי הגדול ביותר</p>
      </header>

      <section className="text-center py-16 px-4">
        <p className="text-[#00cec9] text-xl font-bold mb-2">ברוכים הבאים 🎶</p>
        <h2 className="text-3xl font-black mb-4 text-gray-800">כל השירים במקום אחד</h2>
        <p className="text-gray-500 text-lg max-w-xl mx-auto">
          מאגר ענק של מוזיקה חרדית / דתית — לפי זמרים, אלבומים ואוספים
        </p>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-3 gap-6 px-8 pb-16">
        <a href="/artists"
          className="bg-[#ffe8cc] rounded-3xl p-8 text-center hover:scale-105 transition-transform cursor-pointer block">
          <div className="text-5xl mb-4">🎤</div>
          <h3 className="text-xl font-bold text-[#a29bfe]">זמרים</h3>
          <p className="text-gray-500 mt-2">דפדף לפי שם הזמר</p>
        </a>
        <a href="/albums"
          className="bg-[#ffe8cc] rounded-3xl p-8 text-center hover:scale-105 transition-transform cursor-pointer block">
          <div className="text-5xl mb-4">💿</div>
          <h3 className="text-xl font-bold text-[#00cec9]">אלבומים</h3>
          <p className="text-gray-500 mt-2">כל האלבומים המלאים</p>
        </a>
        <a href="/songs"
          className="bg-[#ffe8cc] rounded-3xl p-8 text-center hover:scale-105 transition-transform cursor-pointer block">
          <div className="text-5xl mb-4">🎵</div>
          <h3 className="text-xl font-bold text-[#DD2476]">שירים</h3>
          <p className="text-gray-500 mt-2">כל השירים לחיפוש</p>
        </a>
      </section>

      <footer className="bg-[#ffe8cc] text-center py-6">
        <p className="text-[#00cec9] font-bold tracking-widest">✨ ♩ ♪ ♫ ♬ יאללה שירים 💪 ♬ ♫ ♪ ♩ ✨</p>
        <p className="text-gray-400 text-sm mt-2">© כל הזכויות שמורות | By Yael</p>
      </footer>
    </main>
  );
}
