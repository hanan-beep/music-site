// app/DetailHero.tsx — כותרת משותפת לדפי זמר ואלבום
import type { ReactNode } from 'react';

export default function DetailHero({ back, visual, title, titleExtra, meta, children }: {
  back: ReactNode; visual: ReactNode; title: string; titleExtra?: ReactNode; meta?: string; children?: ReactNode;
}) {
  return (
    <header className="relative overflow-hidden bg-gradient-to-br from-[#FF512F] via-[#DD2476] to-[#7B2FF7] px-5 pb-10 pt-20 text-white sm:px-12">
      <div className="relative mx-auto max-w-4xl">
        <div className="mb-5 text-sm text-white/80">{back}</div>
        <div className="flex flex-col items-center gap-6 text-center sm:flex-row sm:items-end sm:text-right">
          <div className="flex-none">{visual}</div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-center gap-3 sm:justify-start">
              <h1 className="text-3xl font-extrabold leading-tight sm:text-5xl">{title}</h1>
              {titleExtra}
            </div>
            {meta && <p className="mt-2 text-white/80">{meta}</p>}
            <div className="mt-5 flex flex-wrap items-center justify-center gap-3 sm:justify-start">{children}</div>
          </div>
        </div>
      </div>
      <div className="pointer-events-none absolute -bottom-24 -left-16 h-72 w-72 rounded-full bg-[#FFC93C]/30 blur-3xl" />
    </header>
  );
}
