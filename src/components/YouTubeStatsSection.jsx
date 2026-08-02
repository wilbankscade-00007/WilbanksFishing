import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Users, Eye, Video } from 'lucide-react';
import { base44 } from '@/api/base44Client';

function formatNum(n) {
  if (n >= 1000000) return (n / 1000000).toFixed(1) + 'M';
  if (n >= 1000) return (n / 1000).toFixed(1) + 'K';
  return String(n);
}

export default function YouTubeStatsSection() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    let mounted = true;
    base44.functions.invoke('sync-youtube-stats', {})
      .then((res) => { if (mounted && res?.data?.stats) setStats(res.data.stats); })
      .catch(async () => {
        try {
          const data = await base44.entities.YouTubeStats.list();
          if (mounted && data.length) setStats(data.sort((a, b) => (a.display_order || 0) - (b.display_order || 0))[0]);
        } catch (_) {}
      });
    return () => { mounted = false; };
  }, []);

  if (!stats) return null;

  const items = [
    { icon: Users, label: 'Subscribers', value: formatNum(stats.subscribers || 0) },
    { icon: Eye, label: 'Total Views', value: formatNum(stats.total_views || 0) },
    { icon: Video, label: 'Videos', value: formatNum(stats.video_count || 0) },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="grid grid-cols-3 gap-3 md:gap-6 max-w-3xl mx-auto mb-16"
    >
      {items.map((it, i) => {
        const Icon = it.icon;
        return (
          <div key={i} className="text-center px-2 md:px-6 py-6 md:py-8 border border-[#1C1010] rounded-sm bg-[#1C1010]/20">
            <Icon className="w-6 h-6 md:w-8 md:h-8 text-[#E10000] mx-auto mb-3" />
            <p className="font-heading font-extrabold text-2xl md:text-4xl text-[#E2E8F0]">{it.value}</p>
            <p className="text-[10px] md:text-xs uppercase tracking-wider text-[#E2E8F0]/50 mt-2">{it.label}</p>
          </div>
        );
      })}
    </motion.div>
  );
}