// app/SupportPrompt.tsx — שאלת תמיכה, פעם אחת לכל משתמש מחובר
'use client';
import { useEffect, useRef, useState } from 'react';
import { useAuth } from './AuthContext';
import { createClient } from '@/lib/supabase';

type Phase = 'hidden' | 'ask' | 'sending' | 'thanks-yes' | 'thanks-no' | 'error';
const SNOOZE_KEY = 'yallah-support-snooze';

export default function SupportPrompt() {
  const { user, loading } = useAuth();
  const [phase, setPhase] = useState<Phase>('hidden');
  const timer = useRef<any>(null);
  const email = user?.email?.toLowerCase();
  const doneKey = `yallah-support-${email}`;

  const token = async () => (await createClient().auth.getSession()).data.session?.access_token;

  useEffect(() => {
    clearTimeout(timer.current);
    if (loading || !email) { setPhase('hidden'); return; }
    try {
      if (localStorage.getItem(doneKey)) return;
      if (Date.now() < Number(localStorage.getItem(SNOOZE_KEY) || 0)) return;
    } catch {}
    let cancelled = false;
    (async () => {
      try {
        const t = await token();
        if (!t) return;
        const res = await fetch('/api/support', { headers: { Authorization: `Bearer ${t}` } });
        if (!res.ok) return;
        const { answered } = await res.json();
        if (answered) { try { localStorage.setItem(doneKey, '1'); } catch {} return; }
        if (!cancelled) timer.current = setTimeout(() => setPhase('ask'), 800);
      } catch {}
    })();
    return () => { cancelled = true; clearTimeout(timer.current); };
  }, [email, loading]);

  // סגירה בלי תשובה: לא שואלים שוב במשך 3 ימים
  const snooze = () => {
    try { localStorage.setItem(SNOOZE_KEY, String(Date.now() + 3 * 86400000)); } catch {}
    setPhase('hidden');
  };

  useEffect(() => {
    if (phase !== 'ask') return;
    const esc = (e: KeyboardEvent) => e.key === 'Escape' && snooze();
    window.addEventListener('keydown', esc);
    return () => window.removeEventListener('keydown', esc);
  }, [phase]);

  const answer = async (a: 'yes' | 'no') => {
    setPhase('sending');
    try {
      const t = await token();
      const res = await fetch('/api/support', {
        method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${t}` }, body: JSON.stringify({ answer: a }),
      });
      if (!res.ok) throw new Error('failed');
      try { localStorage.setItem(doneKey, '1'); } catch {}
      setPhase(a === 'yes' ? 'thanks-yes' : 'thanks-no');
    } catch { setPhase('error'); }
  };

  if (phase === 'hidden') return null;
  const closed = phase.startsWith('thanks');

  return (
    <div className="fixed inset-0 z-[400] flex items-end justify-center p-4 sm:items-center" dir="rtl" role="dialog" aria-modal="true" aria-label="שאלה קטנה">
      <div className="absolute inset-0 bg-[#1B1033]/60 backdrop-blur-sm" onClick={closed ? () => setPhase('hidden') : snooze} />
      <div className="relative w-full max-w-sm overflow-hidden rounded-[32px] bg-white text-center shadow-2xl">
        <div className="bg-gradient-to-br from-[#FF512F] via-[#DD2476] to-[#7B2FF7] px-6 pb-10 pt-8">
          <div className="mx-auto grid h-20 w-20 place-items-center rounded-full bg-white/20 ring-4 ring-white/30">
            <svg width="38" height="38" viewBox="0 0 24 24" fill="white"><path d="M12 21s-7.5-4.6-9.6-9.2C.9 8.4 2.6 5 6 5c2 0 3.4 1 4.4 2.4L12 9.5l1.6-2.1C14.6 6 16 5 18 5c3.4 0 5.1 3.4 3.6 6.8C19.5 16.4 12 21 12 21z" /></svg>
          </div>
        </div>
        {!closed && (
          <button onClick={snooze} aria-label="סגור" className="absolute left-4 top-4 rounded-full bg-white/20 p-2 text-white hover:bg-white/30">
            <svg width="16" height="16" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3" strokeLinecap="round" fill="none"><path d="M6 6l12 12M18 6 6 18" /></svg>
          </button>
        )}

        <div className="-mt-5 rounded-t-[28px] bg-white px-6 pb-7 pt-6">
          {closed ? (
            <>
              <h2 className="font-display text-2xl font-extrabold text-[#1B1033]">{phase === 'thanks-yes' ? 'תודה רבה!' : 'תודה על התשובה'}</h2>
              <p className="mt-2 text-[#1B1033]/65">{phase === 'thanks-yes' ? 'זה ממש מחמם את הלב, והתשובה עוזרת להחליט איך להמשיך.' : 'התשובה עוזרת להחליט איך להמשיך. נמשיך לעשות כמיטב יכולתנו.'}</p>
              <button onClick={() => setPhase('hidden')} className="mt-6 w-full rounded-full bg-[#1B1033] py-3 font-display font-extrabold text-white">סגירה</button>
            </>
          ) : (
            <>
              <h2 className="font-display text-2xl font-extrabold text-[#1B1033]">רגע, שאלה קטנה</h2>
              <p className="mt-3 leading-relaxed text-[#1B1033]/70">
                האתר גדל מעבר למכסה החינמית של התשתית, והשרתים והאחסון עולים כסף.
                כדי שימשיך לפעול, נשמח לדעת: <b className="text-[#1B1033]">האם תרצו לתמוך בו ב-3 ₪ לחודש?</b>
              </p>
              <div className="mt-6 flex flex-col gap-2.5">
                <button onClick={() => answer('yes')} disabled={phase === 'sending'}
                  className="rounded-full bg-gradient-to-br from-[#FFC93C] via-[#FF512F] to-[#DD2476] py-3.5 font-display text-lg font-extrabold text-white shadow-lg transition-transform active:scale-95 disabled:opacity-60">
                  {phase === 'sending' ? 'שולחים...' : 'כן, אשמח לתמוך'}
                </button>
                <button onClick={() => answer('no')} disabled={phase === 'sending'}
                  className="rounded-full bg-[#FFF3EA] py-3 font-bold text-[#1B1033]/70 transition-transform active:scale-95 disabled:opacity-60">לא כרגע</button>
              </div>
              {phase === 'error' && <p className="mt-3 text-sm font-bold text-[#DD2476]">משהו השתבש, נסו שוב בעוד רגע.</p>}
              <p className="mt-4 text-xs text-[#1B1033]/45">זו רק שאלה לבדיקת הכדאיות, בלי התחייבות ובלי תשלום עכשיו.</p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
