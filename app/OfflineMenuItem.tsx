'use client';
import { useEffect, useState } from 'react';
import { isSaved, saveSong, removeSong, type OfflineMeta } from '@/lib/offline';

export default function OfflineMenuItem({ song, onDone }: { song: OfflineMeta; onDone: () => void }) {
  const [saved, setSaved] = useState(false);
  const [state, setState] = useState<'idle' | 'busy' | 'error'>('idle');
  useEffect(() => { setSaved(isSaved(song.id)); }, [song.id]);

  const click = async () => {
    if (state === 'busy') return;
    setState('busy');
    try {
      if (saved) { await removeSong(song.id); setSaved(false); } else { await saveSong(song); setSaved(true); }
      setState('idle');
      setTimeout(onDone, 600);
    } catch { setState('error'); }
  };

  return (
    <button onClick={click} className="block w-full px-4 py-2.5 text-right hover:bg-[#FFF3EA]">
      {state === 'busy' ? 'שומרים...' : state === 'error' ? 'השמירה נכשלה, נסו שוב' : saved ? '✓ שמור במכשיר · הסרה' : 'שמור להאזנה ללא אינטרנט'}
    </button>
  );
}
