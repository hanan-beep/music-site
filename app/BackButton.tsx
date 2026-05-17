// app/BackButton.tsx
'use client';
import { useRouter } from 'next/navigation';

export default function BackButton({ label = '→ חזרה' }: { label?: string }) {
  const router = useRouter();
  return (
    <button onClick={() => router.back()}
      className="text-white text-sm mb-2 block mx-auto hover:opacity-70 transition-opacity">
      {label}
    </button>
  );
}
