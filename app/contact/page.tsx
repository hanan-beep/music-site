// app/contact/page.tsx
'use client';
import { useState } from 'react';
import BackButton from '@/app/BackButton';

export default function Contact() {
  const [name, setName] = useState('');
  const [message, setMessage] = useState('');

  function handleSend() {
    const subject = encodeURIComponent(`בקשה / הערה מ-${name || 'גולש'} – יאללה שירים`);
    const body = encodeURIComponent(`שם: ${name}\n\n${message}`);
    // פותח Gmail ישירות בדפדפן — עובד לכולם
    window.open(
      `https://mail.google.com/mail/?view=cm&to=yaele9090@gmail.com&su=${subject}&body=${body}`,
      '_blank'
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-[#ffecd2] via-[#fcb69f] to-[#ffd1a9]" dir="rtl">
      <header className="bg-gradient-to-r from-[#FF512F] to-[#DD2476] p-6 text-center shadow-2xl">
        <BackButton />
        <h1 className="text-3xl font-black text-white">✉️ צור קשר</h1>
      </header>

      <div className="max-w-2xl mx-auto px-6 py-12 flex flex-col gap-6">

        <div className="bg-white/70 rounded-3xl p-8 shadow-lg text-gray-700 leading-relaxed text-center">
          <p className="text-3xl mb-4">🎵</p>
          <h2 className="text-2xl font-black text-[#DD2476] mb-6">חסר לכם איזה ביט?</h2>
          <p className="text-lg mb-4">חרשנו את כל המאגרים כדי שלא יחסר לכם כלום, אבל תמיד יש את השיר הזה שמתחבא...</p>
          <p className="text-lg mb-4">אז אם חסר פה איזה זמר שאתם אוהבים, שיר שנתקע לכם בראש, או שמצאתם איזו טעות – אל תשמרו בבטן!</p>
          <p className="text-lg mb-4">יש לכם הערה, הארה או שסתם בא לכם להגיד ״וואלה, אחלה אתר״? דברו אלינו!</p>
          <p className="text-gray-500 mb-4">בכל זאת, יש פה המון שירים להקשיב להם... 😉</p>
          <p className="text-xl font-black text-[#DD2476]">מחכים לשמוע מכם! 💪</p>
        </div>

        <div className="bg-white/70 rounded-3xl p-8 shadow-lg flex flex-col gap-4">
          <h3 className="text-xl font-black text-[#DD2476] text-center">📬 שלחו הודעה</h3>

          <input
            type="text"
            placeholder="השם שלך (אופציונלי)"
            value={name}
            onChange={e => setName(e.target.value)}
            className="rounded-2xl px-4 py-3 border-2 border-[#DD2476]/30 bg-white text-gray-800 font-bold placeholder-gray-400 focus:outline-none focus:border-[#DD2476]"
          />

          <textarea
            placeholder="מה תרצו לכתוב? חסר שיר? יש הערה?"
            value={message}
            onChange={e => setMessage(e.target.value)}
            rows={4}
            className="rounded-2xl px-4 py-3 border-2 border-[#DD2476]/30 bg-white text-gray-800 font-bold placeholder-gray-400 focus:outline-none focus:border-[#DD2476] resize-none"
          />

          <button
            onClick={handleSend}
            className="bg-gradient-to-r from-[#FF512F] to-[#DD2476] text-white font-black text-lg px-8 py-4 rounded-2xl text-center hover:scale-105 transition-transform shadow-lg"
          >
            📩 שלחו הודעה דרך Gmail
          </button>
        </div>

      </div>

      <footer className="bg-[#ffe8cc] text-center py-6 mt-8">
        <p className="text-[#DD2476] font-bold">✨ ♩ ♪ ♫ ♬ יאללה שירים 💪 ♬ ♫ ♪ ♩ ✨</p>
        <p className="text-gray-500 text-sm mt-2">© כל הזכויות שמורות | By Yael</p>
      </footer>
    </main>
  );
}
