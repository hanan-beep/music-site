// app/contact/page.tsx
import BackButton from '@/app/BackButton';

export default function Contact() {
  const subject = encodeURIComponent('בקשה / הערה – יאללה שירים');
  const body = encodeURIComponent('שלום,\n\nאני פונה בנוגע לאתר יאללה שירים.\n\n');
  const mailtoLink = `mailto:yaele9090@gmail.com?subject=${subject}&body=${body}`;

  return (
    <main className="min-h-screen bg-gradient-to-br from-[#ffecd2] via-[#fcb69f] to-[#ffd1a9]" dir="rtl">

      <header className="bg-gradient-to-r from-[#FF512F] to-[#DD2476] p-6 text-center shadow-2xl">
        <BackButton />
        <h1 className="text-3xl font-black text-white">✉️ צור קשר</h1>
      </header>

      <div className="max-w-2xl mx-auto px-6 py-12 flex flex-col gap-8">

        {/* כרטיס טקסט */}
        <div className="bg-white/70 rounded-3xl p-8 shadow-lg text-gray-700 leading-relaxed text-center">
          <p className="text-3xl mb-4">🎵</p>
          <h2 className="text-2xl font-black text-[#DD2476] mb-6">חסר לכם איזה ביט?</h2>
          <p className="text-lg mb-4">
            חרשנו את כל המאגרים כדי שלא יחסר לכם כלום, אבל תמיד יש את השיר הזה שמתחבא...
          </p>
          <p className="text-lg mb-4">
            אז אם חסר פה איזה זמר שאתם אוהבים, שיר שנתקע לכם בראש, או שמצאתם איזו טעות – אל תשמרו בבטן!
          </p>
          <p className="text-lg mb-4">
            יש לכם הערה, הארה או שסתם בא לכם להגיד ״וואלה, אחלה אתר״? דברו אלינו! שלחו מייל וננסה לסדר את זה כמה שיותר מהר.
          </p>
          <p className="text-lg mb-4 text-gray-500">
            בכל זאת, יש פה המון שירים להקשיב להם... 😉
          </p>
          <p className="text-xl font-black text-[#DD2476]">מחכים לשמוע מכם! 💪</p>
        </div>

        {/* כרטיס יצירת קשר */}
        <a
          href={mailtoLink}
          className="bg-gradient-to-r from-[#FF512F] to-[#DD2476] rounded-3xl p-8 shadow-xl text-center hover:scale-105 transition-transform block"
        >
          <div className="text-6xl mb-4">📬</div>
          <h3 className="text-2xl font-black text-white mb-2">לחצו כאן לשליחת הודעה</h3>
          <p className="text-white/80 text-sm mb-4">
            יפתח חלון מייל עם הכתובת שלנו ממולאת אוטומטית
          </p>
          <div className="inline-block bg-white text-[#DD2476] font-black text-lg px-8 py-3 rounded-2xl shadow">
            ✉️ שלחו הודעה
          </div>
          <p className="text-white/50 text-xs mt-4">yaele9090@gmail.com</p>
        </a>

      </div>

      <footer className="bg-[#ffe8cc] text-center py-6 mt-8">
        <p className="text-[#DD2476] font-bold">✨ ♩ ♪ ♫ ♬ יאללה שירים 💪 ♬ ♫ ♪ ♩ ✨</p>
        <p className="text-gray-500 text-sm mt-2">© כל הזכויות שמורות | By Yael</p>
      </footer>
    </main>
  );
}
