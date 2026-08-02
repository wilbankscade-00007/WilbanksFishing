import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Trophy, Users, Eye, Film, Lock, CheckCircle2 } from 'lucide-react';
import { base44 } from '@/api/base44Client';

const SUB_MILESTONES = [10, 50, 100, 500, 1000, 5000, 10000, 50000, 100000, 500000, 1000000];
const VIEW_MILESTONES = [1000, 10000, 100000, 500000, 1000000, 5000000, 10000000, 50000000, 100000000];
const VIDEO_MILESTONES = [1, 10, 25, 50, 100, 250, 500, 1000];

function fmt(n) {
  if (n >= 1e6) return (n / 1e6).toFixed(n % 1e6 === 0 ? 0 : 1) + 'M';
  if (n >= 1e3) return (n / 1e3).toFixed(n % 1e3 === 0 ? 0 : 1) + 'K';
  return (n || 0).toLocaleString();
}

function milestoneProgress(value, milestones) {
  const v = value || 0;
  let prev = 0;
  let next = milestones[0];
  for (let i = 0; i < milestones.length; i++) {
    if (v >= milestones[i]) { prev = milestones[i]; next = milestones[i + 1] || null; }
    else { next = milestones[i]; break; }
  }
  const allDone = next === null;
  const span = allDone ? 1 : (next - prev) || 1;
  const pct = allDone ? 100 : Math.min(100, Math.round(((v - prev) / span) * 100));
  return { prev, next, pct, allDone };
}

function MilestoneCard({ icon: Icon, label, value, milestones, accent }) {
  const { prev, next, pct, allDone } = milestoneProgress(value, milestones);
  return (
    <div className="border border-[#1C1010] rounded-sm p-5 bg-gradient-to-b from-[#1C1010]/30 to-[#0A0A0A]/60">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Icon className={`w-5 h-5 ${accent}`} />
          <span className="text-[10px] uppercase tracking-[0.25em] text-[#E2E8F0]/60">{label}</span>
        </div>
        <span className="font-heading font-extrabold text-2xl text-[#E2E8F0]">{fmt(value)}</span>
      </div>
      <div className="w-full h-1.5 bg-[#1C1010] rounded-full overflow-hidden mb-2">
        <motion.div
          initial={{ width: 0 }}
          whileInView={{ width: `${pct}%` }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className={`h-full ${allDone ? 'bg-[#FFD700]' : 'bg-[#E10000]'} rounded-full`}
        />
      </div>
      <div className="flex items-center justify-between text-[10px] uppercase tracking-[0.15em]">
        <span className="text-[#E2E8F0]/40">{fmt(prev)} hit</span>
        <span className={allDone ? 'text-[#FFD700]' : 'text-[#E10000]/80'}>
          {allDone ? 'Max tier!' : `${fmt(next)} next`}
        </span>
      </div>
      <div className="flex flex-wrap gap-1.5 mt-3">
        {milestones.map((m) => {
          const unlocked = (value || 0) >= m;
          return (
            <span
              key={m}
              title={`${fmt(m)} ${label}`}
              className={`inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full border text-[10px] tracking-[0.1em] ${
                unlocked
                  ? 'border-[#E10000]/60 bg-[#E10000]/10 text-[#E10000]'
                  : 'border-[#1C1010] bg-[#0A0A0A] text-[#E2E8F0]/30'
              }`}
            >
              {unlocked ? <CheckCircle2 className="w-2.5 h-2.5" /> : <Lock className="w-2.5 h-2.5" />}
              {fmt(m)}
            </span>
          );
        })}
      </div>
    </div>
  );
}

export default function AchievementsSection() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    base44.entities.YouTubeStats.list('-created_date', 1)
      .then((data) => setStats(data[0] || null))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="mb-16">
        <div className="h-6 w-48 bg-[#1C1010]/50 rounded animate-pulse mb-6" />
        <div className="grid md:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => <div key={i} className="h-44 bg-[#1C1010]/40 rounded-sm animate-pulse" />)}
        </div>
      </div>
    );
  }

  if (!stats) return null;

  const subs = stats.subscribers || 0;
  const views = stats.total_views || 0;
  const vids = stats.video_count || 0;
  const totalUnlocked =
    SUB_MILESTONES.filter((m) => subs >= m).length +
    VIEW_MILESTONES.filter((m) => views >= m).length +
    VIDEO_MILESTONES.filter((m) => vids >= m).length;

  return (
    <div className="mb-16">
      <div className="flex items-center gap-3 mb-6">
        <Trophy className="w-6 h-6 text-[#E10000]" />
        <div>
          <h2 className="font-heading font-extrabold text-2xl md:text-3xl text-[#E2E8F0] uppercase">Channel Achievements</h2>
          <p className="text-xs text-[#E2E8F0]/50 tracking-[0.15em] uppercase">
            {totalUnlocked > 0 ? `${totalUnlocked} milestones unlocked · auto-tracked from live stats` : 'Milestones auto-tracked from live channel stats'}
          </p>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        <MilestoneCard icon={Users} label="Subscribers" value={subs} milestones={SUB_MILESTONES} accent="text-[#E10000]" />
        <MilestoneCard icon={Eye} label="Total Views" value={views} milestones={VIEW_MILESTONES} accent="text-[#E10000]" />
        <MilestoneCard icon={Film} label="Videos" value={vids} milestones={VIDEO_MILESTONES} accent="text-[#E10000]" />
      </div>
    </div>
  );
}