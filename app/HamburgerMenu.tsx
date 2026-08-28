// app/HamburgerMenu.tsx
'use client';
import { useState } from 'react';
import Link from 'next/link';
import { HomeIcon, MicIcon, AlbumIcon, MusicNoteIcon, HeartIcon, HistoryIcon, MailIcon, MenuIcon, CloseIcon } from './Icons';

export default function HamburgerMenu() {
  const [open, setOpen] = useState(false);

  const links = [
    { href: '/',          icon: <HomeIcon size={24} color="#FFD700" />,         label: 'דף הבית' },
    { href: '/artists',   icon: <MicIcon size={24} color="#FF9FF3" />,          label: 'זמרים' },
    { href: '/albums',    icon: <AlbumIcon size={24} color="#54A0FF" />,        label: 'אלבומים' },
    { href: '/songs',     icon: <MusicNoteIcon size={24} color="#5FF5A0" />,    label: 'שירים' },
    { href: '/favorites', icon: <HeartIcon size={24} filled color="#FF6B9D" />, label: 'מועדפים' },
    { href: '/history',   icon: <HistoryIcon size={24} color="#FFA502" />,      label: 'היסטוריית האזנה' },
  ];

  return (
    <>
      <button onClick={() => setOpen(true)} aria-label="פתח תפריט"
        className="fixed top-4 left-4 z-50 bg-white/20 backdrop-blur-sm border border-white/30 rounded-xl p-2.5 shadow-lg hover:bg-white/30 transition-all">
        <MenuIcon size={22} color="white" />
      </button>

      {open && <div className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm" onClick={() => setOpen(false)} />}

      <aside className={`fixed top-0 left-0 h-full w-72 z-50 bg-gradient-to-b from-[#FF512F] to-[#DD2476] shadow-2xl transition-transform duration-300 ease-in-out flex flex-col ${open ? 'translate-x-0' : '-translate-x-full'}`} dir="rtl">
        <div className="flex items-center justify-between px-6 py-5 border-b border-white/20">
          <h2 className="text-white font-black text-xl">יאללה שירים 💪</h2>
          <button onClick={() => setOpen(false)}><CloseIcon size={24} color="white" /></button>
        </div>

        <nav className="flex flex-col p-6 gap-1 flex-1 overflow-y-auto">
          {links.map((item) => (
            <Link key={item.href} href={item.href} onClick={() => setOpen(false)}
              className="flex items-center gap-4 px-4 py-3 rounded-2xl text-white font-bold text-lg hover:bg-white/20 transition-colors">
              <span className="w-8 flex justify-center">{item.icon}</span>
              {item.label}
            </Link>
          ))}

          <div className="border-t border-white/20 my-2" />

          <Link href="/contact" onClick={() => setOpen(false)}
            className="flex items-center gap-4 px-4 py-3 rounded-2xl text-white font-bold text-lg hover:bg-white/20 transition-colors">
            <span className="w-8 flex justify-center"><MailIcon size={24} color="#74B9FF" /></span>
            <div>
              <div>צור קשר</div>
              <div className="text-white/60 text-sm font-normal">חסר שיר? יש הערה?</div>
            </div>
          </Link>
        </nav>

        <div className="px-6 py-5 border-t border-white/20 text-center">
          <p className="text-white/70 text-xs">✨ ♩ ♪ ♫ ♬ יאללה שירים ♬ ♫ ♪ ♩ ✨</p>
          <p className="text-white/40 text-xs mt-1">© כל הזכויות שמורות | By Yael</p>
        </div>
      </aside>
    </>
  );
}
