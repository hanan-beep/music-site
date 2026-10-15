'use client';
import { SearchIcon } from './Icons';

type Props = {
  title: string; count: number; unit: string; placeholder: string;
  search: string; setSearch: (v: string) => void;
  sort: string; setSort: (v: any) => void;
};

export default function PageHeader({ title, count, unit, placeholder, search, setSearch, sort, setSort }: Props) {
  return (
    <header className="bg-gradient-to-br from-[#FF512F] via-[#DD2476] to-[#7B2FF7] px-5 pb-8 pt-20 text-white sm:px-12">
      <div className="mx-auto max-w-6xl">
        <h1 className="text-4xl font-extrabold sm:text-5xl">{title}</h1>
        <p className="mt-1 text-white/80">{count.toLocaleString('he-IL')} {unit}</p>
        <div className="mt-6 flex gap-3">
          <label className="relative flex-1">
            <span className="sr-only">{placeholder}</span>
            <input type="search" value={search} onChange={e => setSearch(e.target.value)} placeholder={placeholder}
              className="w-full rounded-full bg-white py-3.5 pl-5 pr-12 font-semibold text-[#1B1033] shadow-lg placeholder:text-[#1B1033]/40" />
            <span className="absolute right-4 top-1/2 -translate-y-1/2"><SearchIcon size={20} color="#DD2476" /></span>
          </label>
          <select value={sort} onChange={e => setSort(e.target.value)} aria-label="מיון"
            className="rounded-full bg-white/20 px-4 font-bold text-white ring-1 ring-white/40 backdrop-blur [&>option]:text-[#1B1033]">
            <option value="alpha-asc">א ← ת</option>
            <option value="alpha-desc">ת ← א</option>
          </select>
        </div>
      </div>
    </header>
  );
}
