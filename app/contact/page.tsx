'use client';
import { useState } from 'react';
import BackButton from '@/app/BackButton';

type Status = 'idle' | 'loading' | 'success' | 'error';

export default function Contact() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState<Status>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  function resetForm() {
    setName(''); setEmail(''); setMessage('');
    setStatus('idle'); setErrorMsg('');
  }

  async function handleSend() {
    setErrorMsg('');
    if (!email || !message) { setErrorMsg('נא למלא מייל והודעה'); return; }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) { setErrorMsg('כתובת המייל אינה תקינה'); return; }
    setStatus('loading');
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, message }),
      });
      if (res.ok) { setStatus('success'); }
      else {
        const data = await res.json();
        setErrorMsg(data.error || 'שגיאה בשליחה');
        setStatus('error');
      }
    } catch {
      setErrorMsg('שגיאת תקשורת, נסו שוב');
      setStatus('error');
    }
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
          {status === 'success' ? (
            <div className="text-center py-6 flex flex-col gap-4">
              <p className="text-5xl">🎉</p>
              <p className="text-2xl font-black text-[#DD2476]">תודה על הפנייה!</p>
              <p className="text-gray-600">נחזור אליכם בהקדם 💪</p>
              <button onClick={resetForm}
                className="mt-2 bg-gradient-to-r from-[#FF512F] to-[#DD2476] text-white font-black px-6 py-3 rounded-2xl hover:scale-105 transition-transform shadow">
                📩 לפנייה נוספת — לחצו כאן
              </button>
            </div>
          ) : (
            <>
              <input type="text" placeholder="השם שלך (אופציונלי)" value={name}
                onChange={e => setName(e.target.value)} disabled={status === 'loading'}
                className="rounded-2xl px-4 py-3 border-2 border-[#DD2476]/30 bg-white text-gray-800 font-bold placeholder-gray-400 focus:outline-none focus:border-[#DD2476] disabled:opacity-50" />
              <input type="email" placeholder="המייל שלך *" value={email}
                onChange={e => setEmail(e.target.value)} disabled={status === 'loading'}
                className="rounded-2xl px-4 py-3 border-2 border-[#DD2476]/30 bg-white text-gray-800 font-bold placeholder-gray-400 focus:outline-none focus:border-[#DD2476] disabled:opacity-50" />
              <textarea placeholder="מה תרצו לכתוב? *" value={message}
                onChange={e => setMessage(e.target.value)} disabled={status === 'loading'} rows={4}
                className="rounded-2xl px-4 py-3 border-2 border-[#DD2476]/30 bg-white text-gray-800 font-bold placeholder-gray-400 focus:outline-none focus:border-[#DD2476] resize-none disabled:opacity-50" />
              {errorMsg && <p className="text-red-500 font-bold text-center">⚠️ {errorMsg}</p>}
              <button onClick={handleSend} disabled={status === 'loading'}
                className="bg-gradient-to-r from-[#FF512F] to-[#DD2476] text-white font-black text-lg px-8 py-4 rounded-2xl hover:scale-105 transition-transform shadow-lg disabled:opacity-60 disabled:scale-100">
                {status === 'loading' ? '⏳ שולח...' : '📩 שלחו הודעה'}
              </button>
            </>
          )}
        </div>
      </div>

      <footer className="bg-[#ffe8cc] text-center py-6 mt-8">
        <p className="text-[#DD2476] font-bold">✨ ♩ ♪ ♫ ♬ יאללה שירים 💪 ♬ ♫ ♪ ♩ ✨</p>
        <p className="text-gray-500 text-sm mt-2">© כל הזכויות שמורות | By Yael</p>
      </footer>
    </main>
  );
}
