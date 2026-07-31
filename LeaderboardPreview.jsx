import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Trophy, MessageCircle, Video, ThumbsUp, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';

const MEDALS = ['🥇', '🥈', '🥉'];

function tier(points) {
  if (points >= 35) return { name: 'Legend of the Lake', color: 'text-[#FFD700]' };
  if (points >= 18) return { name: 'Captain', color: 'text-[#E10000]' };
  if (points >= 8) return { name: 'Deckhand', color: 'text-[#E2E8F0]/80' };
  if (points >= 3) return { name: 'Angler', color: 'text-[#E2E8F0]/60' };
  return { name: 'Rookie', color: 'text-[#E2E8F0]/40' };
}

export default function LeaderboardPreview() {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const res = await base44.functions.invoke('sync-leaderboard', {});
      const data = res.data || res;
      setEntries((data.entries || []).slice(0, 5));
    } catch (e) {
      console.error('leaderboard preview error', e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  return (
    <section className="relative py-10 md:py-14 px-6 md:px-12 border-t border-[#1C1010] overflow-hidden">
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <Trophy className="w-[300px] h-[300px] text-[#1C1010]/20" fill="currentColor" />
      </div>

      <div className="relative z-10 max-w-2xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="relative border border-[#E10000]/40 rounded-sm bg-[#1C1010]/30 p-6 md:p-8 bio-glow"
        >
          <div className="text-center mb-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 mb-4 rounded-full border border-[#E10000]/60 bg-[#E10000]/10">
              <Trophy className="w-3 h-3 text-[#E10000]" fill="currentColor" />
              <span className="text-[10px] tracking-[0.4em] text-[#E10000] uppercase">Fan Leaderboard</span>
            </div>
            <h2 className="font-heading font-extrabold text-3xl md:text-4xl text-[#E2E8F0] uppercase leading-[0.9]">Top Anglers</h2>
            <p className="text-xs text-[#E2E8F0]/50 mt-3 max-w-md mx-auto">
              Climb the ranks by commenting on recent videos. <Link to="/Leaderboard" className="text-[#E10000] hover:underline">See full leaderboard →</Link>
            </p>
          </div>

          {loading ? (
            <div className="space-y-2">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-12 bg-[#1C1010]/50 rounded-sm animate-pulse" />
              ))}
            </div>
          ) : entries.length === 0 ? (
            <p className="text-center text-[#E2E8F0]/40 italic py-8">
              The board fills as viewers comment — be the first!
            </p>
          ) : (
            <div className="space-y-1.5">
              {entries.map((e, i) => {
                const t = tier(e.points);
                return (
                  <div
                    key={e.id}
                    className="flex items-center gap-3 border border-[#1C1010] rounded-sm p-2.5 hover:border-[#E10000]/40 transition-colors bg-[#0A0A0A]/50"
                  >
                    <span className="w-6 text-center text-base">
                      {i < 3 ? MEDALS[i] : <span className="text-[#E2E8F0]/40 font-bold text-sm">{i + 1}</span>}
                    </span>
                    {e.avatar_url ? (
                      <img src={e.avatar_url} alt={e.display_name} className="w-8 h-8 rounded-full object-cover border border-[#1C1010]" />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-[#1C1010] flex items-center justify-center font-bold text-sm text-[#E2E8F0]">
                        {(e.display_name || '?')[0].toUpperCase()}
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-sm text-[#E2E8F0] truncate">{e.display_name}</p>
                      <p className={`text-[9px] uppercase tracking-[0.2em] ${t.color}`}>{t.name}</p>
                    </div>
                    <div className="hidden sm:flex items-center gap-3 text-[10px] uppercase tracking-[0.1em] text-[#E2E8F0]/40">
                      <span className="flex items-center gap-1"><MessageCircle className="w-3 h-3" />{e.comment_count}</span>
                      <span className="flex items-center gap-1"><Video className="w-3 h-3" />{e.videos_commented}</span>
                      {e.top_comments > 0 && <span className="flex items-center gap-1"><ThumbsUp className="w-3 h-3" />{e.top_comments}</span>}
                    </div>
                    <div className="text-right">
                      <p className="font-heading font-extrabold text-lg text-[#E10000]">{e.points}</p>
                      <p className="text-[8px] text-[#E2E8F0]/30 tracking-[0.2em] uppercase">pts</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          <div className="text-center mt-6">
            <Link
              to="/Leaderboard"
              className="inline-flex items-center gap-2 px-5 py-2 border border-[#1C1010] hover:border-[#E10000] rounded-sm text-xs uppercase tracking-[0.2em] text-[#E2E8F0] hover:text-[#E10000] transition-colors"
            >
              View Full Leaderboard <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}