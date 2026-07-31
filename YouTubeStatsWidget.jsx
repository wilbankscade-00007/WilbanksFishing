import React, { useState, useEffect } from 'react';
import { Users, Eye, Video } from 'lucide-react';
import { base44 } from '@/api/base44Client';

function formatNum(n) {
  if (n >= 1000000) return (n / 1000000).toFixed(1) + 'M';
  if (n >= 1000) return (n / 1000).toFixed(1) + 'K';
  return String(n);
}

export default function YouTubeStatsWidget() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    base44.entities.YouTubeStats.list().then(data => {
      if (data.length) {
        setStats(data.sort((a, b) => (a.display_order || 0) - (b.display_order || 0))[0]);
      }
    }).catch(() => {});
  }, []);

  if (!stats) return null;

  const items = [
    { icon: Users, label: 'Subscribers', value: formatNum(stats.subscribers || 0) },
    { icon: Eye, label: 'Total Views', value: formatNum(stats.total_views || 0) },
    { icon: Video, label: 'Videos', value: formatNum(stats.video_count || 0) },
  ];

  return (
    <div className="flex flex-wrap items-center justify-center gap-3 md:gap-4 mb-12">
      {items.map((it, i) => {
        const Icon = it.icon;
        return (
          <div key={i} className="flex items-center gap-2 px-3 md:px-4 py-2 border border-[#1C1010] rounded-sm bg-[#1C1010]/20">
            <Icon className="w-4 h-4 text-[#E10000]" />
            <span className="font-heading font-bold text-base md:text-lg text-[#E2E8F0]">{it.value}</span>
            <span className="text-[9px] md:text-[10px] uppercase tracking-wider text-[#E2E8F0]/50">{it.label}</span>
          </div>
        );
      })}
    </div>
  );
}