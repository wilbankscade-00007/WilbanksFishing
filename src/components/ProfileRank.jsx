import React from 'react';
import { motion } from 'framer-motion';
import { Trophy, Link2, Flame } from 'lucide-react';
import { Link } from 'react-router-dom';

const TIERS = [
  { min: 35, name: 'Legend of the Lake', color: 'text-[#FFD700]', ring: 'border-[#FFD700]' },
  { min: 18, name: 'Captain', color: 'text-[#E10000]', ring: 'border-[#E10000]' },
  { min: 8, name: 'Deckhand', color: 'text-[#E2E8F0]', ring: 'border-[#1C1010]' },
  { min: 3, name: 'Angler', color: 'text-[#E2E8F0]/70', ring: 'border-[#1C1010]' },
  { min: 0, name: 'Rookie', color: 'text-[#E2E8F0]/50', ring: 'border-[#1C1010]' },
];
function getTier(p) { for (const t of TIERS) if ((p || 0) >= t.min) return t; return TIERS[TIERS.length - 1]; }

export default function ProfileRank({ leaderboard, claimed }) {
  const { entry, rank, total } = leaderboard || {};
  const t = getTier(entry?.points);

  return (
    <section className="mb-8">
      <h2 className="font-heading font-bold text-xl text-[#E2E8F0] uppercase flex items-center gap-2 mb-4">
        <Trophy className="w-4 h-4 text-[#E10000]" /> Leaderboard Rank
      </h2>
      {!claimed ? (
        <Link to="/Leaderboard" className="block border border-dashed border-[#1C1010] rounded-sm p-6 text-center hover:border-[#E10000]/50 transition-colors">
          <Link2 className="w-5 h-5 text-[#E10000] mx-auto mb-2" />
          <p className="text-sm text-[#E2E8F0]/70">Claim your YouTube channel to track your rank, tier, and badges here.</p>
        </Link>
      ) : !entry ? (
        <div className="border border-[#1C1010] rounded-sm p-6 text-center text-sm text-[#E2E8F0]/40">
          You haven't appeared on the board yet — comment on a recent video to start earning points.
        </div>
      ) : (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
          className={`border-2 ${t.ring} rounded-sm p-5 bg-gradient-to-b from-[#1C1010]/50 to-[#0A0A0A]`}>
          <div className="flex items-center justify-between gap-3">
            <div className="flex-1 min-w-0">
              <p className="font-bold text-[#E2E8F0] truncate">{entry.display_name}</p>
              <p className={`text-[10px] uppercase tracking-[0.2em] ${t.color}`}>{t.name}</p>
            </div>
            <div className="text-right shrink-0">
              <p className="font-heading font-extrabold text-3xl text-[#E10000] leading-none">{entry.points}</p>
              <p className="text-[9px] text-[#E2E8F0]/30 tracking-[0.2em] uppercase">pts</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-[#E2E8F0]/50 mt-3">
            <span className="inline-flex items-center gap-1"><Trophy className="w-3 h-3 text-[#E10000]" /> Rank #{rank} of {total}</span>
            {entry.streak > 0 && <span className="inline-flex items-center gap-1 text-[#E10000]"><Flame className="w-3 h-3" /> {entry.streak}-video streak</span>}
            {entry.comment_count > 0 && <span>{entry.comment_count} comments</span>}
          </div>
          {entry.badges && entry.badges.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-2">
              {entry.badges.map((b) => (
                <span key={b} className="px-2 py-0.5 rounded-full bg-[#1C1010] border border-[#1C1010] text-[10px] text-[#E2E8F0]/70">{b}</span>
              ))}
            </div>
          )}
        </motion.div>
      )}
    </section>
  );
}