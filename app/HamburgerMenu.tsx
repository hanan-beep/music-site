'use client';
import { useState } from 'react';

export default function HamburgerMenu() {
  const [open, setOpen] = useState(false);

  const links = [
    { href: '/',        icon: '🏠', label: 'דף הבית' },
    { href: '/artists', icon: '🎤', label: 'זמרים' },
    { href: '/albums',  icon: '💿', label: 'אלבומים' },
    { href: '/songs',   icon: '🎵', label: 'שירים' },
  ];

  const subject = encodeURIComponent('בקשה / הערה – יאללה שירים');
  const body = encodeURIComponent('שלום,\n\nאני פונה בנוגע לאתר יאללה שירים.\n\n');
  const mailtoLink = `mailto:yaele9090@gmail.com?subject=${subject}&body=${body}`;

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        aria-label="פתח תפריט"
        className="fixed top-4 left-4 z-50 bg-white/20 backdrop-blur-sm border border-white/30 rounded-xl p-2.5 shadow-lg hover:bg-white/30 transition-all"
      >
        <div className="flex flex-col gap-1.5 w-6">
          <span className="block h-0.5 bg-white rounded-full" />
          <span className="block h-0.5 bg-white rounded-full" />
          <span className="block h-0.5 bg-white rounded-full" />
        </div>
      </button>

      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
          onClick={() => setOpen(false)}
        />
      )}

      <aside
        className={`fixed top-0 left-0 h-full w-72 z-50 bg-gradient-to-b from-[#FF512F] to-[#DD2476] shadow-2xl transition-transform duration-300 ease-in-out ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
        dir="rtl"
      >
        <div className="flex items-center justify-between px-6 py-5 border-b border-white/20">
          <h2 className="text-white font-black text-xl">יאללה שירים 💪</h2>
          <button
            onClick={() => setOpen(false)}
            className="text-white text-2xl hover:opacity-70 transition-opacity"
            aria-label="סגור תפריט"
          >
            ✕
          </button>
        </div>

        <nav className="flex flex-col p-6 gap-2">
          {links.map((item) => (
            <a
              key={item.href}
              href={item.href}
              onClick={() => setOpen(false)}
              className="flex items-center gap-4 px-4 py-3 rounded-2xl text-white font-bold text-lg hover:bg-white/20 transition-colors"
            >
              <span className="text-2xl">{item.icon}</span>
              {item.label}
            </a>
          ))}

          {/* קו הפרדה */}
          <div className="border-t border-white/20 my-2" />

          {/* צור קשר */}
          <a
            href={mailtoLink}
            onClick={() => setOpen(false)}
            className="flex items-center gap-4 px-4 py-3 rounded-2xl text-white font-bold text-lg hover:bg-white/20 transition-colors"
          >
            <span className="text-2xl">✉️</span>
            <div>
              <div>צור קשר</div>
              <div className="text-white/60 text-sm font-normal">חסר שיר? יש הערה?</div>
            </div>
          </a>
        </nav>

        <div className="absolute bottom-6 right-6 left-6 text-center text-white/60 text-sm">
          ✨ ♩ ♪ ♫ ♬ ♫ ♪ ♩ ✨
        </div>
      </aside>
    </>
  );
}
