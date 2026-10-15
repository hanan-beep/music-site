// app/page.tsx
import Link from 'next/link';
import { MicIcon, AlbumIcon, MusicNoteIcon } from './Icons';

const tiles = [
  { href: '/artists', title: 'זמרים', sub: 'דפדוף לפי שם הזמר', bg: 'bg-[#DD2476] text-white', icon: <MicIcon size={44} color="#FFC93C" />, wide: true },
  { href: '/albums', title: 'אלבומים', sub: 'כל האלבומים המלאים', bg: 'bg-[#FFC93C] text-[#1B1033]', icon: <AlbumIcon size={44} color="#1B1033" /> },
  { href: '/songs', title: 'שירים', sub: 'חיפוש בכל המאגר', bg: 'bg-[#1B1033] text-white', icon: <MusicNoteIcon size={44} color="#FF512F" />, full: true },
];

export default function Home() {
  return (
    <main className="min-h-screen" dir="rtl">
      <header className="relative overflow-hidden bg-gradient-to-br from-[#FF512F] via-[#DD2476] to-[#7B2FF7] px-6 pb-24 pt-24 text-white sm:px-12">
        <img src="/logo.png" alt="יאללה שירים" className="mb-8 h-16 w-16 rounded-full ring-4 ring-white/30" />
        <h1 className="max-w-3xl text-5xl font-extrabold leading-[1.05] sm:text-7xl">כל השירים שאהבת, במקום אחד.</h1>
        <p className="mt-5 max-w-xl text-lg text-white/85">הארכיון המוזיקלי החרדי הגדול ביותר. בוחרים זמר או אלבום, לוחצים, והמוזיקה ממשיכה לנגן גם כשעוברים בין דפים.</p>
        <Link href="/songs" className="mt-8 inline-flex items-center gap-2 rounded-full bg-white px-7 py-3.5 font-display text-lg font-extrabold text-[#DD2476] shadow-xl transition-transform hover:scale-105">
          חיפוש שיר
        </Link>
        <div className="pointer-events-none absolute -bottom-24 -left-16 h-72 w-72 rounded-full bg-[#FFC93C]/40 blur-3xl" />
      </header>

      <section className="relative z-10 -mt-12 grid gap-4 px-4 sm:grid-cols-3 sm:px-12">
        {tiles.map(t => (
          <Link key={t.href} href={t.href}
            className={`${t.bg} ${t.wide ? 'sm:col-span-2' : ''} ${(t as any).full ? 'sm:col-span-3 sm:min-h-32 sm:flex-row sm:items-end' : ''} group flex min-h-44 flex-col justify-between rounded-[32px] p-7 shadow-xl transition-transform hover:-translate-y-1`}>
            <div className="transition-transform group-hover:rotate-6">{t.icon}</div>
            <div>
              <h2 className="text-3xl font-extrabold">{t.title}</h2>
              <p className="mt-1 opacity-75">{t.sub}</p>
            </div>
          </Link>
        ))}
      </section>

      <footer className="px-6 pb-10 pt-14 text-center text-sm text-[#1B1033]/60">© כל הזכויות שמורות | By Yael</footer>
    </main>
  );
}
