import React from 'react';
import { Radio } from 'lucide-react';

function timeAgo(iso) {
  if (!iso) return '';
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 60) return m <= 1 ? 'just now' : m + 'm ago';
  const h = Math.floor(m / 60);
  if (h < 24) return h + 'h ago';
  const d = Math.floor(h / 24);
  return d + 'd ago';
}

export default function ActivityTicker({ activity }) {
  if (!activity || activity.length === 0) return null;
  const items = [...activity, ...activity]; // duplicate for seamless loop
  return (
    <div className="relative overflow-hidden border-y border-[#1C1010] bg-[#1C1010]/20 py-2 mb-8">
      <div className="flex items-center gap-2 px-4 mb-2 md:mb-0 md:absolute md:left-4 md:top-1/2 md:-translate-y-1/2 z-10">
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#E10000] opacity-60" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-[#E10000]" />
        </span>
        <span className="text-[9px] tracking-[0.3em] text-[#E10000] uppercase whitespace-nowrap">Live</span>
      </div>
      <div className="md:pl-28 flex w-max animate-drift">
        {items.map((it, i) => (
          <div key={i} className="flex items-center gap-2 px-6 whitespace-nowrap text-xs text-[#E2E8F0]/60">
            <Radio className="w-3 h-3 text-[#E10000]/70 shrink-0" />
            <span className="text-[#E2E8F0] font-semibold">{it.author}</span>
            <span className="text-[#E2E8F0]/40">{it.action}</span>
            {it.target && <span className="text-[#E10000]/80 italic truncate max-w-[200px]">"{it.target}"</span>}
            <span className="text-[#E2E8F0]/30">· {timeAgo(it.ts)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}