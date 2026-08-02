import React from 'react';
import { Fish, Trophy, Target } from 'lucide-react';

export default function CatchTracker({ catches }) {
  const speciesCounts = {};
  catches.forEach((c) => {
    const s = (c.species || '').trim();
    if (!s) return;
    speciesCounts[s] = (speciesCounts[s] || 0) + 1;
  });
  const distinctSpecies = Object.keys(speciesCounts).length;

  const anglerCounts = {};
  catches.forEach((c) => {
    const name = c.author_name || 'Angler';
    anglerCounts[name] = (anglerCounts[name] || 0) + 1;
  });
  const topAngler = Object.entries(anglerCounts).sort((a, b) => b[1] - a[1])[0];
  const speciesList = Object.entries(speciesCounts).sort((a, b) => b[1] - a[1]).slice(0, 8);

  const cards = [
    { icon: Target, label: 'Species Tagged', value: distinctSpecies, sub: distinctSpecies === 1 ? 'species' : 'distinct species' },
    { icon: Fish, label: 'Total Catches', value: catches.length, sub: catches.length === 1 ? 'catch' : 'catches' },
    { icon: Trophy, label: 'Top Angler', value: topAngler ? topAngler[0] : '—', sub: topAngler ? `${topAngler[1]} catches` : 'no catches yet' },
  ];

  return (
    <div className="mb-10">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {cards.map((c) => {
          const Icon = c.icon;
          return (
            <div key={c.label} className="border border-[#1C1010] rounded-sm bg-[#0A0A0A]/60 p-3 flex items-center gap-3">
              <div className="w-9 h-9 rounded-full border border-[#1C1010] bg-gradient-to-b from-[#2A1410] to-[#0E0808] flex items-center justify-center shrink-0">
                <Icon className="w-4 h-4 text-[#E10000]" />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] uppercase tracking-wider text-[#E2E8F0]/40">{c.label}</p>
                <p className="font-heading font-bold text-lg text-[#E2E8F0] leading-tight truncate">{c.value}</p>
                <p className="text-[10px] text-[#E2E8F0]/40">{c.sub}</p>
              </div>
            </div>
          );
        })}
      </div>
      {speciesList.length > 0 && (
        <div className="mt-3 border border-[#1C1010] rounded-sm bg-[#0A0A0A]/60 p-3">
          <p className="text-[10px] uppercase tracking-wider text-[#E2E8F0]/40 mb-2">Species Breakdown</p>
          <div className="flex flex-wrap gap-2">
            {speciesList.map(([sp, n]) => (
              <span key={sp} className="text-xs px-2.5 py-1 rounded-full border border-[#E10000]/40 bg-[#E10000]/5 text-[#E2E8F0]/80">
                {sp} <span className="text-[#E10000] font-bold">{n}</span>
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}