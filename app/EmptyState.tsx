import Link from 'next/link';
import type { ReactNode } from 'react';

export default function EmptyState({ icon, title, text, href, cta }: { icon: ReactNode; title: string; text: string; href?: string; cta?: string }) {
  return (
    <div className="mx-auto max-w-md px-6 py-16 text-center">
      <div className="mx-auto grid h-20 w-20 place-items-center rounded-full bg-gradient-to-br from-[#FFC93C] via-[#FF512F] to-[#DD2476] shadow-xl">{icon}</div>
      <h2 className="mt-6 font-display text-2xl font-extrabold">{title}</h2>
      <p className="mt-2 text-[#1B1033]/60">{text}</p>
      {href && cta && (
        <Link href={href} className="mt-6 inline-flex rounded-full bg-[#1B1033] px-7 py-3 font-display font-extrabold text-white shadow-lg transition-transform hover:scale-105">{cta}</Link>
      )}
    </div>
  );
}
