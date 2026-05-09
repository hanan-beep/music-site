'use client';

export default function BackButton({ label = '→ חזרה' }: { label?: string }) {
  return (
    <button
      onClick={() => window.history.back()}
      className="text-white text-sm mb-2 block mx-auto hover:opacity-70 transition-opacity"
    >
      {label}
    </button>
  );
}
