// app/BackButton.tsx
'use client';
import { useRouter } from 'next/navigation';

export default function BackButton({ label = '→ חזרה' }: { label?: string }) {
  const router = useRouter();
  return (
    <button onClick={() => router.back()}
      className="block text-sm text-white/85 transition-opacity hover:opacity-70">
      {label}
    </button>
  );
}
