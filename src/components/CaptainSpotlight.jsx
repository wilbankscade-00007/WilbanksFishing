import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Trophy, MapPin, Sparkles } from 'lucide-react';
import { base44 } from '@/api/base44Client';

const TIERS = [
  { min: 35, name: 'Legend of the Lake', color: 'text-[#FFD700]', ring: 'border-[#FFD700]', glow: 'shadow-[0_0_28px_rgba(255,215,0,0.6)]' },
  { min: 18, name: 'Captain', color: 'text-[#E10000]', ring: 'border-[#E10000]', glow: 'bio-glow' },
];

function tier(points) {
  return TIERS.find((t) => points >= t.min);
}

export default function CaptainSpotlight() {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    base44.entities.LeaderboardEntry.list('-points', 50)
      .then((data) => {
        setMembers((data || []).filter((e) => (e.points || 0) >= 18));
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="mb-16">
        <div className="h-6 w-48 bg-[#1C1010]/50 rounded-sm animate-pulse mb-6" />
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {[...Array(3)].map((_, i) => <div key={i} className="h-28 bg-[#1C1010]/40 rounded-sm animate-pulse" />)}
        </div>
      </div>
    );
  }

  if (members.length === 0) {
    return (
      <div className="mb-16">
        <div className="flex items-center gap-3 mb-1">
          <Trophy className="w-5 h-5 text-[#E10000]" />
          <h2 className="font-heading font-bold text-2xl text-[#E2E8F0] uppercase tracking-wide">Captain's Spotlight</h2>
        </div>
        <p className="text-xs text-[#E2E8F0]/50 mb-5">
          Captain and Legend of the Lake tier members earn their <span className="text-[#E10000]">channel name</span> showcased here. Legend of the Lake members also earn a <span className="text-[#FFD700]">video shoutout</span>.
        </p>
        <div className="border-2 border-dashed border-[#1C1010] rounded-sm p-8 text-center bg-[#0A0A0A]/60">
          <Trophy className="w-10 h-10 text-[#1C1010] mx-auto mb-3" />
          <p className="text-sm text-[#E2E8F0]/50">No Captains yet — be the first to reach 18+ points on the <span className="text-[#E10000]">leaderboard</span> to claim your spotlight!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mb-16">
      <div className="flex items-center gap-3 mb-1">
        <Trophy className="w-5 h-5 text-[#E10000]" />
        <h2 className="font-heading font-bold text-2xl text-[#E2E8F0] uppercase tracking-wide">Captain's Spotlight</h2>
      </div>
      <p className="text-xs text-[#E2E8F0]/50 mb-5">
        Captain and Legend of the Lake tier members earn their <span className="text-[#E10000]">channel name</span> showcased here. Legend of the Lake members also earn a <span className="text-[#FFD700]">video shoutout</span>.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {members.map((m, i) => {
          const t = tier(m.points || 0);
          return (
            <motion.div
              key={m.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className={`relative border-2 ${t.ring} ${t.glow} rounded-sm p-4 bg-gradient-to-b from-[#1C1010]/50 to-[#0A0A0A]`}
            >
              <div className="absolute top-3 right-3 inline-flex items-center gap-1 text-[10px] uppercase tracking-[0.2em] text-[#E2E8F0]/30">
                <MapPin className="w-3 h-3" /> Pinned
              </div>
              <div className="flex items-center gap-3">
                {m.avatar_url ? (
                  <img src={m.avatar_url} alt={m.display_name} className="w-14 h-14 rounded-full object-cover border border-[#1C1010]" />
                ) : (
                  <div className="w-14 h-14 rounded-full bg-[#1C1010] flex items-center justify-center font-bold text-xl text-[#E2E8F0]">
                    {(m.display_name || '?')[0].toUpperCase()}
                  </div>
                )}
                <div className="min-w-0">
                  <p className="font-bold text-sm text-[#E2E8F0] truncate">{m.display_name}</p>
                  <p className={`text-[10px] uppercase tracking-[0.2em] ${t.color} mt-0.5`}>{t.name}</p>
                </div>
              </div>
              {m.channel_url ? (
                <a
                  href={m.channel_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block mt-3 text-[11px] text-[#E10000] hover:underline truncate"
                >
                  {m.channel_url.replace('https://www.youtube.com/channel/', '@')}
                </a>
              ) : (
                <p className="mt-3 text-[11px] text-[#E2E8F0]/30">Submit a catch photo to claim your pin</p>
              )}
              {(m.points || 0) >= 35 && (
                <span className="mt-3 inline-flex items-center gap-1 text-[10px] uppercase tracking-[0.2em] text-[#FFD700] bg-[#FFD700]/10 border border-[#FFD700]/40 rounded-full px-2 py-0.5">
                  <Sparkles className="w-3 h-3" /> Video Shoutout
                </span>
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}