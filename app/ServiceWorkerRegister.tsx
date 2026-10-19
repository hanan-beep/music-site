// app/ServiceWorkerRegister.tsx — רישום ה-Service Worker + עדכון אוטומטי של האפליקציה
'use client';
import { useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';

const MINE = process.env.NEXT_PUBLIC_BUILD_ID || '';
const isPlaying = () => Array.from(document.querySelectorAll('audio')).some(a => !a.paused && !a.ended);

export default function ServiceWorkerRegister() {
  const [available, setAvailable] = useState(false);
  const availableRef = useRef(false);
  const pathname = usePathname();
  const prevPath = useRef(pathname);
  const startedAt = useRef(Date.now());

  useEffect(() => {
    let reg: ServiceWorkerRegistration | undefined;
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js', { updateViaCache: 'none' }).then(r => { reg = r; }).catch(console.error);
    }

    const check = async () => {
      try { await reg?.update(); } catch {}
      if (!MINE) return;
      try {
        const { v } = await (await fetch('/api/version', { cache: 'no-store' })).json();
        if (!v || v === MINE) return;
        availableRef.current = true;
        setAvailable(true);
        // בפתיחת האפליקציה (ולא באמצע שימוש או נגינה): מתעדכנים בשקט, פעם אחת לכל גרסה
        const justOpened = Date.now() - startedAt.current < 15000;
        if (justOpened && !isPlaying() && sessionStorage.getItem('yallah-updated') !== v) {
          sessionStorage.setItem('yallah-updated', v);
          location.reload();
        }
      } catch {}
    };

    const first = setTimeout(check, 3000);
    const every = setInterval(check, 10 * 60 * 1000);
    const onVisible = () => { if (document.visibilityState === 'visible') check(); };
    document.addEventListener('visibilitychange', onVisible);
    window.addEventListener('online', check);
    return () => { clearTimeout(first); clearInterval(every); document.removeEventListener('visibilitychange', onVisible); window.removeEventListener('online', check); };
  }, []);

  // מעבר בין דפים כשיש גרסה חדשה ואין נגינה: טוענים את הגרסה החדשה בלי שהמשתמש ירגיש
  useEffect(() => {
    if (prevPath.current === pathname) return;
    prevPath.current = pathname;
    if (availableRef.current && !isPlaying()) location.reload();
  }, [pathname]);

  if (!available) return null;
  return (
    <div className="fixed left-1/2 top-[72px] z-[250] -translate-x-1/2" dir="rtl">
      <button onClick={() => location.reload()}
        className="flex items-center gap-3 rounded-full bg-[#1B1033] px-5 py-3 text-sm font-bold text-white shadow-2xl ring-1 ring-white/20">
        <span className="h-2 w-2 animate-pulse rounded-full bg-[#5FF5A0]" />
        גרסה חדשה זמינה
        <span className="rounded-full bg-gradient-to-l from-[#FF512F] to-[#DD2476] px-3 py-1">עדכן</span>
      </button>
    </div>
  );
}
