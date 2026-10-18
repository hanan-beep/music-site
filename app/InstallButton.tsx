'use client';
import { useEffect, useState } from 'react';

let deferred: any = null;

export default function InstallButton() {
  const [can, setCan] = useState(false);
  const [ios, setIos] = useState(false);
  const [hint, setHint] = useState(false);
  const [installed, setInstalled] = useState(true);

  useEffect(() => {
    setInstalled(matchMedia('(display-mode: standalone)').matches || (navigator as any).standalone === true);
    setIos(/iphone|ipad|ipod/i.test(navigator.userAgent));
    const onPrompt = (e: Event) => { e.preventDefault(); deferred = e; setCan(true); };
    const onInstalled = () => setInstalled(true);
    if (deferred) setCan(true);
    window.addEventListener('beforeinstallprompt', onPrompt);
    window.addEventListener('appinstalled', onInstalled);
    return () => { window.removeEventListener('beforeinstallprompt', onPrompt); window.removeEventListener('appinstalled', onInstalled); };
  }, []);

  if (installed || (!can && !ios)) return null;

  const click = async () => {
    if (deferred) { deferred.prompt(); await deferred.userChoice; deferred = null; setCan(false); }
    else setHint(h => !h);
  };

  return (
    <div className="mb-3">
      <button onClick={click} className="flex w-full items-center gap-3 rounded-2xl bg-white/10 p-3 text-right font-semibold hover:bg-white/15">
        <span className="grid h-10 w-10 place-items-center rounded-xl bg-[#5FF5A0]/20">
          <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="#5FF5A0" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3v12m0 0-4-4m4 4 4-4M5 21h14" /></svg>
        </span>
        <span className="flex-1">התקנת האפליקציה</span>
      </button>
      {hint && <p className="mt-2 rounded-xl bg-white/10 p-3 text-xs leading-relaxed text-white/75">בספארי: לחצו על כפתור השיתוף (הריבוע עם החץ), ואז על “הוסף למסך הבית”.</p>}
    </div>
  );
}
