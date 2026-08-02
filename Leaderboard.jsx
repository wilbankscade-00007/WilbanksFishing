import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Trophy, MessageCircle, ThumbsUp, Video, Sparkles, RefreshCw, Flame, AlertTriangle } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import ClaimChannel from '@/components/ClaimChannel';
import ActivityTicker from '@/components/ActivityTicker';
import CaptainSpotlight from '@/components/CaptainSpotlight';

const MEDALS = ['🥇', '🥈', '🥉'];

const BADGES = {
  first: { icon: '🏁', label: 'First!' },
  early: { icon: '🐦', label: 'Early Bird' },
  owl: { icon: '🦉', label: 'Night Owl' },
  streak3: { icon: '🔥', label: '3-Streak' },
  streak5: { icon: '🔥', label: '5-Streak' },
};

const TIERS = [
  { min: 35, name: 'Legend of the Lake', color: 'text-[#FFD700]', perk: 'Captains Spotlight + video shoutout' },
  { min: 18, name: 'Captain', color: 'text-[#E10000]', perk: 'Captains Spotlight feature' },
  { min: 8, name: 'Deckhand', color: 'text-[#E2E8F0]', perk: 'Mentioned by name in the next video' },
  { min: 3, name: 'Angler', color: 'text-[#E2E8F0]/70', perk: 'Shoutout eligibility' },
  { min: 0, name: 'Rookie', color: 'text-[#E2E8F0]/50', perk: 'Comment to start earning' },
];

function tier(points) {
  for (const t of TIERS) if (points >= t.min) {
    const extra = t.min >= 35 ? { ring: 'border-[#E10000]', glow: t.min >= 60 ? 'shadow-[0_0_20px_rgba(255,215,0,0.4)]' : 'bio-glow' } : { ring: 'border-[#1C1010]', glow: '' };
    return { ...t, ...extra };
  }
  return TIERS[TIERS.length - 1];
}

function timeAgo(iso) {
  if (!iso) return '—';
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 60) return m <= 1 ? 'just now' : m + 'm ago';
  const h = Math.floor(m / 60);
  if (h < 24) return h + 'h ago';
  const d = Math.floor(h / 24);
  if (d < 30) return d + 'd ago';
  return new Date(iso).toLocaleDateString();
}

function Badges({ badges }) {
  if (!badges || badges.length === 0) return null;
  return (
    <div className="flex flex-wrap gap-1">
      {badges.map((b) => (
        <span key={b} title={BADGES[b]?.label} className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-[#1C1010] border border-[#1C1010] text-[10px] text-[#E2E8F0]/60">
          <span>{BADGES[b]?.icon}</span>
        </span>
      ))}
    </div>
  );
}

function Spotlight({ entry }) {
  if (!entry?.best_comment_text) return null;
  return (
    <div className="mt-2 border-l-2 border-[#E10000]/40 pl-3">
      <p className="text-[11px] text-[#E2E8F0]/50 italic line-clamp-2">&ldquo;{entry.best_comment_text}&rdquo;</p>
      <p className="text-[10px] text-[#E10000]/50 tracking-wider uppercase mt-0.5">
        best comment{entry.best_comment_likes > 0 ? ` · ${entry.best_comment_likes} likes` : ''}
      </p>
    </div>
  );
}

export default function Leaderboard() {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [lastSync, setLastSync] = useState(null);
  const [scanned, setScanned] = useState(null);
  const [activity, setActivity] = useState([]);
  const [tab, setTab] = useState('all');

  const load = useCallback(async (force = false) => {
    if (force) setSyncing(true); else if (loading) setLoading(true);
    try {
      const res = await base44.functions.invoke('sync-leaderboard', { force });
      const data = res.data || res;
      setEntries(data.entries || []);
      setActivity(data.recent_activity || []);
      if (data.synced || data.cached) {
        const top = (data.entries || [])[0];
        setLastSync(top?.updated_date || null);
      }
      if (data.scanned_videos != null) setScanned(data.scanned_videos);
    } catch (e) {
      console.error('leaderboard load error', e);
    } finally {
      setLoading(false);
      setSyncing(false);
    }
  }, []);

  useEffect(() => { load(false); }, [load]);

  const ranked = tab === 'monthly'
    ? [...entries].filter((e) => (e.monthly_comment_count || 0) > 0).sort((a, b) => (b.monthly_points || 0) - (a.monthly_points || 0))
    : [...entries];

  const top3 = ranked.slice(0, 3);
  const rest = ranked.slice(3);

  return (
    <div className="min-h-screen bg-[#0A0A0A] pt-24">
      <div className="max-w-5xl mx-auto px-6 md:px-12 py-12">
        <Link to="/" className="inline-flex items-center gap-2 text-xs tracking-[0.3em] uppercase text-[#E2E8F0]/50 hover:text-[#E10000] transition-colors mb-8">
          <ArrowLeft className="w-4 h-4" /> Back to Home
        </Link>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-10 text-center">
          <span className="text-[10px] tracking-[0.4em] text-[#E10000] uppercase">WilbanksFishing</span>
          <h1 className="font-heading font-extrabold text-3xl sm:text-5xl md:text-7xl text-[#E2E8F0] uppercase leading-[0.9] mt-2 flex items-center justify-center gap-2 md:gap-3 flex-wrap">
            <Trophy className="w-8 h-8 sm:w-10 sm:h-10 md:w-14 md:h-14 text-[#E10000]" /> Leaderboard
          </h1>
          <p className="text-sm text-[#E2E8F0]/60 leading-relaxed mt-4 max-w-xl mx-auto">
            Climb the ranks by engaging with the channel. Comment on recent videos, be first on a fresh upload, and rack up likes to earn points, badges, and tier rewards.
          </p>
        </motion.div>

        {/* How points work */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
          {[
            { icon: MessageCircle, label: 'Each comment', pts: '+1' },
            { icon: Sparkles, label: 'Early bird (first 6h)', pts: '+1' },
            { icon: Video, label: 'Per unique video', pts: '+2' },
            { icon: ThumbsUp, label: 'Top comment (5+ likes)', pts: '+3' },
          ].map((r) => (
            <div key={r.label} className="border border-[#1C1010] rounded-sm p-4 text-center bg-[#0A0A0A]/60">
              <r.icon className="w-5 h-5 text-[#E10000] mx-auto mb-2" />
              <p className="text-[10px] uppercase tracking-[0.2em] text-[#E2E8F0]/50 leading-tight">{r.label}</p>
              <p className="font-heading font-bold text-xl text-[#E2E8F0] mt-1">{r.pts}</p>
            </div>
          ))}
        </div>

        <div className="flex items-start gap-2 mb-8 text-xs text-[#E2E8F0]/45">
          <AlertTriangle className="w-3.5 h-3.5 text-[#E10000] mt-0.5 shrink-0" />
          <p>Spam is filtered — low-effort, duplicate, or copy-pasted comments won't earn points, but genuine comments and conversations always count!</p>
        </div>

        {/* Claim / your rank */}
        <ClaimChannel entries={entries} />

        {/* Tier rewards */}
        <div className="mb-8 border border-[#1C1010] rounded-sm p-4 bg-[#0A0A0A]/60">
          <p className="text-[10px] tracking-[0.3em] text-[#E10000] uppercase mb-3">Tier Rewards</p>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
            {TIERS.map((t) => (
              <div key={t.name} className="border border-[#1C1010] rounded-sm p-2.5 text-center">
                <p className={`text-[10px] uppercase tracking-[0.15em] font-bold ${t.color}`}>{t.name}</p>
                <p className="text-[10px] text-[#E2E8F0]/55 mt-1 font-heading font-bold">{t.min}+ pts</p>
                <p className="text-[10px] text-[#E2E8F0]/40 mt-1 leading-tight">{t.perk}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Captains Spotlight */}
        <CaptainSpotlight />

        {/* Activity ticker */}
        {!loading && <ActivityTicker activity={activity} />}

        {/* Sync controls */}
        <div className="flex items-center justify-between mb-4">
          <p className="text-[10px] text-[#E2E8F0]/40 tracking-[0.2em] uppercase">
            {scanned != null ? `Scanned ${scanned} recent videos` : 'Syncing…'}{lastSync ? ` · updated ${timeAgo(lastSync)}` : ''}
          </p>
          <button
            onClick={() => load(true)}
            disabled={syncing}
            className="inline-flex items-center gap-2 text-xs tracking-[0.2em] uppercase text-[#E10000] hover:underline disabled:opacity-40"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${syncing ? 'animate-spin' : ''}`} /> {syncing ? 'Syncing' : 'Sync now'}
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          {[
            { id: 'all', label: 'All-Time' },
            { id: 'monthly', label: 'This Month' },
          ].map((tb) => (
            <button
              key={tb.id}
              onClick={() => setTab(tb.id)}
              className={`px-4 py-2 text-xs uppercase tracking-[0.2em] rounded-sm border transition-colors ${tab === tb.id ? 'border-[#E10000] text-[#E10000] bg-[#E10000]/10' : 'border-[#1C1010] text-[#E2E8F0]/50 hover:text-[#E2E8F0]'}`}
            >
              {tb.label}
            </button>
          ))}
        </div>

        {tab === 'monthly' && (
          <div className="mb-6 flex items-center gap-3 border border-[#FFD700]/40 bg-[#FFD700]/5 rounded-sm p-4">
            <Trophy className="w-5 h-5 text-[#FFD700] shrink-0" />
            <p className="text-sm text-[#E2E8F0]/70">This month's top commenter wins a <span className="text-[#FFD700] font-bold">featured Captain's Spotlight + special shoutout</span> — the board resets on the 1st of each month!</p>
          </div>
        )}

        {loading ? (
          <div className="space-y-3">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="h-20 bg-[#1C1010]/40 rounded-sm animate-pulse" />
            ))}
          </div>
        ) : ranked.length === 0 ? (
          <div className="text-center py-24">
            <Trophy className="w-12 h-12 text-[#1C1010] mx-auto mb-4" />
            <p className="text-[#E2E8F0]/40">
              {tab === 'monthly' ? 'No comments this month yet — be the first to comment on a recent video!' : 'No commenters found on recent videos yet. The board fills as viewers comment!'}
            </p>
          </div>
        ) : (
          <>
            {/* Podium */}
            {top3.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                {top3.map((e, i) => {
                  const t = tier(tab === 'monthly' ? e.monthly_points : e.points);
                  const place = i === 0 ? 1 : i === 1 ? 2 : 3;
                  const pts = tab === 'monthly' ? e.monthly_points : e.points;
                  return (
                    <motion.div
                      key={e.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.1 }}
                      className={`relative border-2 ${t.ring} ${t.glow} rounded-sm p-4 sm:p-6 bg-gradient-to-b from-[#1C1010]/40 to-[#0A0A0A] text-center ${place === 1 ? 'md:-translate-y-4' : ''}`}
                    >
                      <div className="text-3xl mb-2">{MEDALS[i]}</div>
                      {e.avatar_url ? (
                        <img src={e.avatar_url} alt={e.display_name} className="w-14 h-14 sm:w-16 sm:h-16 rounded-full mx-auto mb-3 object-cover border border-[#1C1010]" />
                      ) : (
                        <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full mx-auto mb-3 bg-[#1C1010] flex items-center justify-center font-bold text-xl text-[#E2E8F0]">
                          {(e.display_name || '?')[0].toUpperCase()}
                        </div>
                      )}
                      <p className="font-bold text-[#E2E8F0] truncate">{e.display_name}</p>
                      <p className={`text-[10px] uppercase tracking-[0.2em] ${t.color} mt-1`}>{t.name}</p>
                      <p className="font-heading font-extrabold text-3xl text-[#E10000] mt-2">{pts}</p>
                      <p className="text-[10px] text-[#E2E8F0]/40 tracking-[0.2em] uppercase">{tab === 'monthly' ? 'monthly pts' : 'points'}</p>
                      <div className="flex justify-center mt-2"><Badges badges={e.badges} /></div>
                      <div className="text-left mt-3"><Spotlight entry={e} /></div>
                    </motion.div>
                  );
                })}
              </div>
            )}

            {/* Ranked list */}
            {rest.length > 0 && (
              <div className="space-y-2">
                {rest.map((e, i) => {
                  const t = tier(tab === 'monthly' ? e.monthly_points : e.points);
                  const rank = i + 4;
                  const pts = tab === 'monthly' ? e.monthly_points : e.points;
                  return (
                    <motion.div
                      key={e.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.03 }}
                      className="flex items-start gap-2 sm:gap-4 border border-[#1C1010] rounded-sm p-2.5 sm:p-3 md:p-4 hover:border-[#E10000]/50 transition-colors bg-[#0A0A0A]/60"
                    >
                      <span className="font-heading font-bold text-base sm:text-lg text-[#E2E8F0]/30 w-6 sm:w-8 text-center pt-1">{rank}</span>
                      {e.avatar_url ? (
                        <img src={e.avatar_url} alt={e.display_name} className="w-9 h-9 sm:w-10 sm:h-10 rounded-full object-cover border border-[#1C1010] mt-0.5" />
                      ) : (
                        <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-[#1C1010] flex items-center justify-center font-bold text-[#E2E8F0] mt-0.5">
                          {(e.display_name || '?')[0].toUpperCase()}
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="font-bold text-sm text-[#E2E8F0] truncate">{e.display_name}</p>
                          {e.streak > 0 && <span className="inline-flex items-center gap-0.5 text-[10px] text-[#E10000]"><Flame className="w-3 h-3" />{e.streak}</span>}
                        </div>
                        <p className={`text-[10px] uppercase tracking-[0.2em] ${t.color}`}>{t.name}</p>
                        <Badges badges={e.badges} />
                        <Spotlight entry={e} />
                      </div>
                      <div className="hidden sm:flex flex-col items-end gap-1 text-[10px] uppercase tracking-[0.15em] text-[#E2E8F0]/40 pt-1">
                        <span className="flex items-center gap-1"><MessageCircle className="w-3 h-3" />{tab === 'monthly' ? e.monthly_comment_count : e.comment_count}</span>
                        <span className="flex items-center gap-1"><Video className="w-3 h-3" />{e.videos_commented}</span>
                        {e.top_comments > 0 && <span className="flex items-center gap-1"><ThumbsUp className="w-3 h-3" />{e.top_comments}</span>}
                      </div>
                      <div className="text-right pt-0.5">
                        <p className="font-heading font-extrabold text-xl text-[#E10000]">{pts}</p>
                        <p className="text-[10px] text-[#E2E8F0]/30 tracking-[0.2em] uppercase">pts</p>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}

            <p className="text-center text-[10px] text-[#E2E8F0]/30 tracking-[0.2em] uppercase mt-10">
              {tab === 'all' ? 'Points reset as older videos roll out of the recent window — keep commenting to stay on top' : 'Monthly points reset on the 1st — everyone gets a fresh shot each month'}
            </p>
          </>
        )}
      </div>
    </div>
  );
}