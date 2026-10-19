'use client';
import { useState } from 'react';

export default function ShareMenuItem({ song, onDone }: { song: { id: string; name: string; artistName?: string }; onDone: () => void }) {
  const [copied, setCopied] = useState(false);
  const click = async () => {
    const title = song.name.replace(/\.[^/.]+$/, '');
    const url = `${location.origin}/s/${song.id}`;
    try {
      if (navigator.share) await navigator.share({ title, text: `${title} | יאללה שירים`, url });
      else { await navigator.clipboard.writeText(url); setCopied(true); setTimeout(onDone, 900); return; }
    } catch {}
    onDone();
  };
  return <button onClick={click} className="block w-full px-4 py-2.5 text-right hover:bg-[#FFF3EA]">{copied ? '✓ הקישור הועתק' : 'שתף שיר'}</button>;
}
