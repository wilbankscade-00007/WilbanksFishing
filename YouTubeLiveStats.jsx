import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  Users, Eye, Video, Calendar, Globe,
  RefreshCw
} from 'lucide-react';
import { base44 } from '@/api/base44Client';

function formatNum(n) {
  if (n == null) return '0';
  if (n >= 1000000) return (n / 1000000).toFixed(1) + 'M';
  if (n >= 1000) return (n / 1000).toFixed(1) + 'K';
  return String(n);
}

function formatDate(iso) {
  if (!iso) return '—';
  const d = new Date(iso);
  if (isNaN(d.getTime())) return '—';
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
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

export default function YouTubeLiveStats() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    try {
      setRefreshing(true);
      const res = await base44.functions.invoke('sync-youtube-stats', {});
      const s = res?.data?.stats || res?.stats;
      if (s) setStats(s);
    } catch (e) {
      try {
        const data = await base44.entities.YouTubeStats.list();
        if (data.length) setStats(data.sort((a, b) => (a.display_order || 0) - (b.display_order || 0))[0]);
      } catch (_) {}
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    const id = setInterval(load, 30000);
    return () => clearInterval(id);
  }, [load]);

  const channelCards = [
    { icon: Users, label: 'Subscribers', value: formatNum(stats?.subscribers) },
    { icon: Eye, label: 'Total Views', value: formatNum(stats?.total_views) },
    { icon: Video, label: 'Total Videos', value: formatNum(stats?.video_count) },
    { icon: Calendar, label: 'Channel Created', value: formatDate(stats?.channel_created_date) },
    { icon: Globe, label: 'Country', value: stats?.country || '—' },
  ];

  return (
    <div className="mb-16">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#E10000] opacity-60" />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#E10000]" />
          </span>
          <span className="text-[10px] tracking-[0.4em] text-[#E10000] uppercase">Live Channel Stats</span>
        </div>
        <button
          onClick={load}
          disabled={refreshing}
          className="inline-flex items-center gap-2 text-[10px] tracking-wider uppercase text-[#E2E8F0]/50 hover:text-[#E10000] transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`w-3 h-3 ${refreshing ? 'animate-spin' : ''}`} />
          {refreshing ? 'Syncing' : 'Refresh'}
        </button>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-24 bg-[#1C1010]/40 animate-pulse rounded-sm" />
          ))}
        </div>
      ) : !stats ? (
        <p className="text-center text-[#E2E8F0]/40 py-8">Stats are loading. Try refreshing in a moment.</p>
      ) : (
        <>
          {/* Channel overview */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-8">
            {channelCards.map((it, i) => {
              const Icon = it.icon;
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="px-4 py-5 border border-[#1C1010] rounded-sm bg-[#1C1010]/20 hover:border-[#E10000]/40 transition-colors"
                >
                  <Icon className="w-5 h-5 text-[#E10000] mb-3" />
                  <p className="font-heading font-extrabold text-xl md:text-2xl text-[#E2E8F0] leading-tight">{it.value}</p>
                  <p className="text-[10px] uppercase tracking-wider text-[#E2E8F0]/50 mt-1">{it.label}</p>
                </motion.div>
              );
            })}
          </div>

          <p className="text-[10px] text-[#E2E8F0]/30 text-center mt-4">
            Synced {stats.updated_date ? timeAgo(stats.updated_date) : 'recently'} · auto-refreshes every 30s
          </p>
        </>
      )}
    </div>
  );
}