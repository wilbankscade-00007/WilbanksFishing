import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Trophy, Link2, LogIn, Loader2, Unlink, Check, Flame, ChevronUp, Megaphone } from 'lucide-react';
import { base44 } from '@/api/base44Client';

const BADGES = {
  first: { icon: '🏁', label: 'First!' },
  early: { icon: '🐦', label: 'Early Bird' },
  owl: { icon: '🦉', label: 'Night Owl' },
  streak3: { icon: '🔥', label: '3-Streak' },
  streak5: { icon: '🔥', label: '5-Streak' },
};

function getTier(points) {
  if (points >= 35) return { name: 'Legend of the Lake', color: 'text-[#FFD700]', ring: 'border-[#FFD700]', glow: 'shadow-[0_0_20px_rgba(255,215,0,0.4)]', shoutout: 'Captains Spotlight feature' };
  if (points >= 18) return { name: 'Captain', color: 'text-[#E10000]', ring: 'border-[#E10000]', glow: 'bio-glow', shoutout: 'Captains Spotlight feature' };
  if (points >= 8) return { name: 'Deckhand', color: 'text-[#E2E8F0]', ring: 'border-[#1C1010]', glow: '', shoutout: 'Mentioned by name in the next video' };
  if (points >= 3) return { name: 'Angler', color: 'text-[#E2E8F0]/70', ring: 'border-[#1C1010]', glow: '', shoutout: '' };
  return { name: 'Rookie', color: 'text-[#E2E8F0]/50', ring: 'border-[#1C1010]', glow: '', shoutout: '' };
}

const NEXT_TIER_MIN = [60, 35, 18, 6, 0];

export default function ClaimChannel({ entries }) {
  const [authed, setAuthed] = useState(null); // null=checking, false, true
  const [me, setMe] = useState(null);
  const [input, setInput] = useState('');
  const [resolving, setResolving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    base44.auth.isAuthenticated().then(async (ok) => {
      setAuthed(ok);
      if (ok) {
        try { setMe(await base44.auth.me()); } catch (_) {}
      }
    }).catch(() => setAuthed(false));
  }, []);

  async function handleClaim() {
    setError('');
    setResolving(true);
    try {
      const res = await base44.functions.invoke('resolve-youtube-channel', { url: input });
      const d = res.data || res;
      if (!d.channel_id) throw new Error(d.error || 'Channel not found');
      await base44.auth.updateMe({
        claimed_channel_id: d.channel_id,
        claimed_display_name: d.display_name,
        claimed_avatar_url: d.avatar_url,
        claimed_channel_url: d.channel_url,
      });
      setMe(await base44.auth.me());
      setInput('');
    } catch (e) {
      setError(e.message || 'Could not resolve that channel');
    } finally {
      setResolving(false);
    }
  }

  async function handleUnlink() {
    await base44.auth.updateMe({
      claimed_channel_id: '', claimed_display_name: '', claimed_avatar_url: '', claimed_channel_url: '',
    });
    setMe(await base44.auth.me());
  }

  function login() {
    base44.auth.redirectToLogin('/Leaderboard');
  }

  // --- Checking auth state ---
  if (authed === null) {
    return (
      <div className="h-28 bg-[#1C1010]/40 rounded-sm animate-pulse mb-8" />
    );
  }

  // --- Not logged in ---
  if (!authed) {
    return (
      <div className="mb-8 border border-dashed border-[#1C1010] rounded-sm p-6 text-center bg-[#0A0A0A]/60">
        <Link2 className="w-6 h-6 text-[#E10000] mx-auto mb-3" />
        <p className="text-sm text-[#E2E8F0]/70 mb-1">Want to track your own rank?</p>
        <p className="text-xs text-[#E2E8F0]/40 mb-4">Log in and claim your YouTube channel to see where you stand.</p>
        <button onClick={login} className="inline-flex items-center gap-2 px-5 py-2 bg-[#E10000] text-white text-xs uppercase tracking-[0.2em] rounded-sm hover:bg-[#C00000] transition-colors">
          <LogIn className="w-4 h-4" /> Log in to claim
        </button>
      </div>
    );
  }

  // --- Logged in, no claim yet ---
  if (!me?.claimed_channel_id) {
    return (
      <div className="mb-8 border border-[#1C1010] rounded-sm p-6 bg-[#0A0A0A]/60">
        <div className="flex items-center gap-2 mb-3">
          <Trophy className="w-4 h-4 text-[#E10000]" />
          <span className="text-[10px] tracking-[0.3em] text-[#E10000] uppercase">Claim your channel</span>
        </div>
        <p className="text-sm text-[#E2E8F0]/60 mb-3">Paste your YouTube channel URL or @handle to pin your rank here.</p>
        <div className="flex flex-col sm:flex-row gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="@yourhandle or youtube.com/@yourhandle"
            onKeyDown={(e) => e.key === 'Enter' && input && handleClaim()}
            className="flex-1 bg-[#1C1010]/40 border border-[#1C1010] focus:border-[#E10000] rounded-sm px-4 py-2.5 text-sm text-[#E2E8F0] placeholder:text-[#E2E8F0]/30 outline-none"
          />
          <button
            onClick={handleClaim}
            disabled={!input || resolving}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-[#E10000] text-white text-xs uppercase tracking-[0.2em] rounded-sm hover:bg-[#C00000] transition-colors disabled:opacity-40"
          >
            {resolving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Link2 className="w-4 h-4" />}
            {resolving ? 'Resolving' : 'Claim'}
          </button>
        </div>
        {error && <p className="text-xs text-[#E10000] mt-2">{error}</p>}
      </div>
    );
  }

  // --- Claimed: show personal rank card ---
  const idx = entries.findIndex((e) => e.youtube_channel_id === me.claimed_channel_id);
  const entry = idx >= 0 ? entries[idx] : null;
  const t = entry ? getTier(entry.points) : getTier(0);
  const above = idx > 0 ? entries[idx - 1] : null;
  const gapAbove = above ? Math.max(0, above.points - entry.points) : null;
  // next tier up
  const tierIdx = NEXT_TIER_MIN.findIndex((m) => entry?.points >= m);
  const nextMin = tierIdx > 0 ? NEXT_TIER_MIN[tierIdx - 1] : null;
  const gapTier = nextMin != null ? nextMin - (entry?.points || 0) : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className={`mb-8 border-2 ${t.ring} ${t.glow} rounded-sm p-5 bg-gradient-to-b from-[#1C1010]/50 to-[#0A0A0A]`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="text-[10px] tracking-[0.3em] text-[#E10000] uppercase">Your Rank</span>
          <span className="inline-flex items-center gap-1 text-[9px] text-[#E2E8F0]/40">
            <Check className="w-3 h-3 text-[#E10000]" /> claimed
          </span>
        </div>
        <button onClick={handleUnlink} className="text-[#E2E8F0]/30 hover:text-[#E10000] transition-colors" title="Re-claim a different channel">
          <Unlink className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="flex items-center gap-4 mt-3">
        {me.claimed_avatar_url ? (
          <img src={me.claimed_avatar_url} alt={me.claimed_display_name} className="w-12 h-12 rounded-full object-cover border border-[#1C1010]" />
        ) : (
          <div className="w-12 h-12 rounded-full bg-[#1C1010] flex items-center justify-center font-bold text-[#E2E8F0]">
            {(me.claimed_display_name || '?')[0].toUpperCase()}
          </div>
        )}
        <div className="flex-1 min-w-0">
          <p className="font-bold text-[#E2E8F0] truncate">{me.claimed_display_name || 'You'}</p>
          <p className={`text-[10px] uppercase tracking-[0.2em] ${t.color}`}>{t.name}</p>
        </div>
        <div className="text-right">
          <p className="font-heading font-extrabold text-3xl text-[#E10000] leading-none">{entry ? entry.points : 0}</p>
          <p className="text-[9px] text-[#E2E8F0]/30 tracking-[0.2em] uppercase">pts</p>
        </div>
      </div>

      {entry ? (
        <div className="mt-4 space-y-2">
          <div className="flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-[#E2E8F0]/50">
            <span className="inline-flex items-center gap-1"><Trophy className="w-3 h-3 text-[#E10000]" /> Rank #{idx + 1} of {entries.length}</span>
            {entry.streak > 0 && <span className="inline-flex items-center gap-1 text-[#E10000]"><Flame className="w-3 h-3" /> {entry.streak}-video streak</span>}
            {gapAbove > 0 && <span className="inline-flex items-center gap-1"><ChevronUp className="w-3 h-3" /> {gapAbove} pts to #{idx}</span>}
          </div>
          {entry.badges && entry.badges.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {entry.badges.map((b) => (
                <span key={b} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#1C1010] border border-[#1C1010] text-[10px] text-[#E2E8F0]/70">
                  <span>{BADGES[b]?.icon}</span> {BADGES[b]?.label}
                </span>
              ))}
            </div>
          )}
          {gapTier != null && gapTier > 0 && (
            <p className="text-[11px] text-[#E2E8F0]/40">Need {gapTier} more pts to reach the next tier.</p>
          )}
          {t.shoutout && (
            <div className="flex items-center gap-2 mt-2 px-3 py-2 rounded-sm border border-[#FFD700]/40 bg-[#FFD700]/10">
              <Megaphone className="w-4 h-4 text-[#FFD700] shrink-0" />
              <div>
                <span className="text-[10px] uppercase tracking-[0.2em] text-[#FFD700] block leading-none">Shoutout unlocked</span>
                <span className="text-[11px] text-[#E2E8F0]/70">{t.shoutout}</span>
              </div>
            </div>
          )}
        </div>
      ) : (
        <p className="text-xs text-[#E2E8F0]/40 mt-3">
          You haven't commented on a recent video yet — comment on the latest uploads to appear on the board and start earning points.
        </p>
      )}
    </motion.div>
  );
}