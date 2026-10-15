// app/HamburgerMenu.tsx
'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { HomeIcon, MicIcon, AlbumIcon, MusicNoteIcon, HeartIcon, HistoryIcon, MailIcon, MenuIcon, CloseIcon, PlaylistIcon } from './Icons';

const links = [
  { href: '/', icon: HomeIcon, label: 'דף הבית', c: '#FFC93C' },
  { href: '/artists', icon: MicIcon, label: 'זמרים', c: '#FF9FF3' },
  { href: '/albums', icon: AlbumIcon, label: 'אלבומים', c: '#54A0FF' },
  { href: '/songs', icon: MusicNoteIcon, label: 'שירים', c: '#5FF5A0' },
  { href: '/favorites', icon: HeartIcon, label: 'מועדפים', c: '#FF6B9D' },
  { href: '/playlist', icon: PlaylistIcon, label: 'הפלייליסט שלי', c: '#FFA502' },
  { href: '/history', icon: HistoryIcon, label: 'היסטוריית האזנה', c: '#A29BFE' },
];

export default function HamburgerMenu() {
  const [open, setOpen] = useState(false);
  const path = usePathname();

  useEffect(() => { setOpen(false); }, [path]);
  useEffect(() => {
    const esc = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    window.addEventListener('keydown', esc);
    return () => window.removeEventListener('keydown', esc);
  }, []);

  const active = (h: string) => (h === '/' ? path === '/' : path.startsWith(h));

  return (
    <>
      <button onClick={() => setOpen(true)} aria-label="פתח תפריט"
        className="fixed left-4 top-4 z-50 rounded-xl border border-white/20 bg-[#1B1033]/85 p-2.5 shadow-lg backdrop-blur-md transition-all hover:bg-[#1B1033]">
        <MenuIcon size={22} color="white" />
      </button>

      <div onClick={() => setOpen(false)} aria-hidden
        className={`fixed inset-0 z-40 bg-[#1B1033]/60 backdrop-blur-sm transition-opacity duration-300 ${open ? 'opacity-100' : 'pointer-events-none opacity-0'}`} />

      <aside dir="rtl" aria-hidden={!open}
        className={`fixed left-0 top-0 z-50 flex h-full w-[84%] max-w-80 flex-col bg-[#1B1033] text-white shadow-2xl transition-transform duration-300 ease-out ${open ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex items-center gap-3 bg-gradient-to-br from-[#FF512F] via-[#DD2476] to-[#7B2FF7] px-5 py-5">
          <img src="/logo.png" alt="" className="h-11 w-11 rounded-full ring-2 ring-white/40" />
          <h2 className="flex-1 font-display text-xl font-extrabold">יאללה שירים</h2>
          <button onClick={() => setOpen(false)} aria-label="סגור תפריט" className="rounded-full p-1.5 hover:bg-white/20"><CloseIcon size={22} color="white" /></button>
        </div>

        <nav className="flex flex-1 flex-col gap-1 overflow-y-auto p-4">
          {links.map(({ href, icon: Icon, label, c }) => (
            <Link key={href} href={href}
              className={`flex items-center gap-3 rounded-2xl px-3 py-2.5 font-semibold transition-colors ${active(href) ? 'bg-white/15' : 'hover:bg-white/10'}`}>
              <span className="grid h-10 w-10 place-items-center rounded-xl" style={{ background: `${c}26` }}>
                <Icon size={21} color={c} {...(href === '/favorites' ? { filled: true } : {})} />
              </span>
              <span className="flex-1">{label}</span>
              {active(href) && <span className="h-2 w-2 rounded-full bg-[#FFC93C]" />}
            </Link>
          ))}
        </nav>

        <div className="p-4">
          <Link href="/contact" className="flex items-center gap-3 rounded-2xl bg-gradient-to-br from-[#FFC93C] to-[#FF512F] p-4 text-[#1B1033] shadow-lg">
            <MailIcon size={24} color="#1B1033" />
            <div>
              <div className="font-display font-extrabold">חסר שיר?</div>
              <div className="text-sm opacity-80">כתבו לנו ונוסיף</div>
            </div>
          </Link>
          <p className="mt-4 text-center text-xs text-white/40">© כל הזכויות שמורות | By Yael</p>
        </div>
      </aside>
    </>
  );
}
