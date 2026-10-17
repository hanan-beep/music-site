// app/PageHero.tsx — כותרת משותפת לדפים פשוטים (מועדפים, היסטוריה, פלייליסט, צור קשר)
import type { ReactNode } from 'react';
import BackButton from './BackButton';

export default function PageHero({ title, meta, backLabel, children }: { title: string; meta?: string; backLabel?: string; children?: ReactNode }) {
  return (
    <header className="relative overflow-hidden bg-gradient-to-br from-[#FF512F] via-[#DD2476] to-[#7B2FF7] px-5 pb-8 pt-20 text-white sm:px-12">
      <div className="relative mx-auto max-w-4xl">
        <div className="mb-4"><BackButton label={backLabel} /></div>
        <h1 className="text-4xl font-extrabold sm:text-5xl">{title}</h1>
        {meta && <p className="mt-1 text-white/80">{meta}</p>}
        {children && <div className="mt-5 flex flex-wrap items-center gap-3">{children}</div>}
      </div>
      <div className="pointer-events-none absolute -bottom-24 -left-16 h-72 w-72 rounded-full bg-[#FFC93C]/30 blur-3xl" />
    </header>
  );
}
