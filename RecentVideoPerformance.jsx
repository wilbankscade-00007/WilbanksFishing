import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Eye, Heart, MessageCircle } from 'lucide-react';
import { base44 } from '@/api/base44Client';

function formatNum(n) {
  if (n == null) return '0';
  if (n >= 1000000) return (n / 1000000).toFixed(1) + 'M';
  if (n >= 1000) return (n / 1000).toFixed(1) + 'K';
  return String(n);
}

function timeAgo(iso) {
  if (!iso) return '';
  const diff = Date.now() - new Date(iso).getTime();
  if (diff < 0) return 'just now';
  const days = Math.floor(diff / 86400000);
  if (days > 365) return Math.floor(days / 365) + 'y ago';
  if (days > 30) return Math.floor(days / 30) + 'mo ago';
  if (days > 0) return days + 'd ago';
  const hrs = Math.floor(diff / 3600000);
  if (hrs > 0) return hrs + 'h ago';
  const mins = Math.floor(diff / 60000);
  return (mins < 1 ? 1 : mins) + 'm ago';
}

export default function RecentVideoPerformance() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    base44.entities.YouTubeStats.list()
      .then(data => {
        if (data.length) setStats(data.sort((a, b) => (a.display_order || 0) - (b.display_order || 0))[0]);
      })
      .catch(() => {});
  }, []);

  const videos = stats?.recent_videos;
  if (!videos || videos.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="mt-16"
    >
      <p className="text-[10px] tracking-[0.3em] uppercase text-[#E2E8F0]/50 mb-3 text-center">Recent Video Performance</p>
      <div className="max-w-3xl mx-auto border border-[#1C1010] rounded-sm overflow-hidden">
        {videos.map((v, i) => (
          <a
            key={v.video_id || i}
            href={v.video_id ? `https://www.youtube.com/watch?v=${v.video_id}` : '#'}
            target="_blank"
            rel="noopener noreferrer"
            className={`flex items-center gap-4 p-3 hover:bg-[#1C1010]/30 transition-colors ${i > 0 ? 'border-t border-[#1C1010]' : ''}`}
          >
            {v.video_id && (
              <img
                src={`https://img.youtube.com/vi/${v.video_id}/mqdefault.jpg`}
                alt=""
                className="w-24 h-14 object-cover rounded-sm border border-[#1C1010] shrink-0"
              />
            )}
            <div className="flex-1 min-w-0">
              <p className="font-bold text-sm text-[#E2E8F0] truncate">{v.title}</p>
              <p className="text-[10px] text-[#E2E8F0]/40 mt-0.5">{timeAgo(v.published_date)}</p>
            </div>
            <div className="hidden sm:flex items-center gap-4 shrink-0">
              <span className="inline-flex items-center gap-1 text-xs text-[#E2E8F0]/60">
                <Eye className="w-3.5 h-3.5 text-[#E10000]" /> {formatNum(v.views)}
              </span>
              <span className="inline-flex items-center gap-1 text-xs text-[#E2E8F0]/60">
                <Heart className="w-3.5 h-3.5 text-[#E10000]" /> {formatNum(v.likes)}
              </span>
              <span className="inline-flex items-center gap-1 text-xs text-[#E2E8F0]/60">
                <MessageCircle className="w-3.5 h-3.5 text-[#E10000]" /> {formatNum(v.comments)}
              </span>
            </div>
          </a>
        ))}
      </div>
    </motion.div>
  );
}