// app/LoginBanner.tsx
'use client';
import { useState, useEffect, useRef } from 'react';
import { useAuth } from './AuthContext';

export default function LoginBanner() {
  const { user, signInWithGoogle, signOut } = useAuth();
  const [showBanner, setShowBanner] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // באנר מופיע אחרי שנייה אחת
  useEffect(() => {
    if (user) return;
    try {
      if (localStorage.getItem('login_dismissed')) return;
    } catch {}
    const t = setTimeout(() => setShowBanner(true), 1000);
    return () => clearTimeout(t);
  }, [user]);

  // סגירת תפריט בלחיצה מחוץ
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowMenu(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  function dismiss() {
    setShowBanner(false);
    try { localStorage.setItem('login_dismissed', '1'); } catch {}
  }

  // מחובר — אייקון פרופיל עם תפריט
  if (user) {
    return (
      <div className="fixed top-3 right-4 z-50" ref={menuRef}>
        <button
          onClick={() => setShowMenu(!showMenu)}
          className="w-10 h-10 rounded-full overflow-hidden border-2 border-white shadow-lg hover:scale-105 transition-transform"
        >
          {user.user_metadata?.avatar_url ? (
            <img src={user.user_metadata.avatar_url} alt="פרופיל" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-[#DD2476] flex items-center justify-center text-white font-black text-sm">
              {(user.user_metadata?.full_name || user.email || '?')[0].toUpperCase()}
            </div>
          )}
        </button>

        {showMenu && (
          <div className="absolute left-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden" dir="rtl">
            <div className="px-4 py-3 border-b border-gray-100">
              <p className="font-black text-gray-800 text-sm truncate">{user.user_metadata?.full_name}</p>
              <p className="text-gray-400 text-xs truncate">{user.email}</p>
            </div>
            <button
              onClick={() => { signOut(); setShowMenu(false); }}
              className="w-full text-right px-4 py-3 text-red-500 font-bold text-sm hover:bg-red-50 transition-colors"
            >
              🚪 התנתק
            </button>
          </div>
        )}
      </div>
    );
  }

  // באנר התחברות
  if (!showBanner) return null;

  return (
    <div className="fixed bottom-24 right-4 z-50 w-72 bg-white rounded-3xl shadow-2xl border border-gray-100 p-5" dir="rtl">
      <button onClick={dismiss} className="absolute top-3 left-3 text-gray-400 hover:text-gray-600 text-lg">✕</button>

      <div className="text-center mb-4">
        <p className="text-3xl mb-2">🎵</p>
        <h3 className="font-black text-gray-800 text-lg">שמור את המוזיקה שלך!</h3>
        <p className="text-gray-500 text-sm mt-1">התחבר כדי לשמור מועדפים והיסטוריה בכל המכשירים</p>
      </div>

      <button onClick={signInWithGoogle}
        className="w-full flex items-center justify-center gap-3 bg-white border-2 border-gray-200 rounded-2xl px-4 py-3 font-bold text-gray-700 hover:border-[#DD2476] hover:text-[#DD2476] transition-all shadow-sm">
        <svg width="20" height="20" viewBox="0 0 24 24">
          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
        </svg>
        התחבר עם Google
      </button>

      <p className="text-center text-gray-400 text-xs mt-3 cursor-pointer hover:text-gray-600" onClick={dismiss}>
        המשך בלי התחברות
      </p>
    </div>
  );
}
