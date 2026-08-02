import React, { useState, useEffect } from 'react';
import { Loader2, LogIn, Flame, Check } from 'lucide-react';
import { Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { useReactions } from '@/hooks/useReactions';

function todayKey() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

const STREAK_TIERS = [
  { min: 1, label: 'First Cast', emoji: '🎣' },
  { min: 3, label: 'On a Roll', emoji: '🔥' },
  { min: 7, label: 'Week Warrior', emoji: '💪' },
  { min: 14, label: 'Half-Month Hammer', emoji: '⚡' },
  { min: 30, label: 'Legendary Streak', emoji: '🏆' },
];
function tierFor(n) {
  let t = STREAK_TIERS[0];
  STREAK_TIERS.forEach((s) => { if (n >= s.min) t = s; });
  return t;
}

export default function DailyCheckIn() {
  const { myReaction, loading, user, submit } = useReactions('checkin', todayKey(), { unique: true });
  const [streak, setStreak] = useState(0);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!user) return;
    base44.entities.Reaction.filter({ target_type: 'checkin', user_id: user.id }, '-created_date', 400)
      .then((rows) => {
        const dates = new Set(rows.map((r) => r.target_id));
        let n = 0;
        const d = new Date();
        while (true) {
          const k = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
          if (dates.has(k)) { n++; d.setDate(d.getDate() - 1); } else break;
        }
        setStreak(n);
      })
      .catch(() => {});
  }, [user, myReaction]);

  const checkedIn = !!myReaction;
  const tier = tierFor(streak);

  const checkIn = async () => {
    if (!user || checkedIn || busy) return;
    setBusy(true);
    try { await submit('1'); } catch (e) { /* ignore */ }
    finally { setBusy(false); }
  };

  if (!user) {
    return (
      <div className="flex flex-col items-center text-center py-10 px-6 border border-[#1C1010] rounded-sm bg-[#0A0A0A]/60">
        <div className="w-12 h-12 rounded-full border border-[#E10000]/40 bg-[#E10000]/10 flex items-center justify-center mb-3"><LogIn className="w-5 h-5 text-[#E10000]" /></div>
        <h3 className="font-heading font-bold text-base text-[#E2E8F0] uppercase mb-1">Log in to check in</h3>
        <p className="text-xs text-[#E2E8F0]/50 max-w-xs mb-4">Check in daily to build your streak and earn tier badges.</p>
        <Link to="/login" className="px-5 py-2 bg-[#E10000] text-white text-[11px] uppercase tracking-[0.2em] rounded-sm hover:bg-transparent hover:border hover:border-[#E10000] transition-all lift-3d">Log In</Link>
      </div>
    );
  }

  return (
    <div className="border border-[#1C1010] rounded-sm bg-[#0A0A0A]/60 p-5 h-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="text-3xl">{tier.emoji}</span>
          <div>
            <p className="font-heading font-bold text-2xl text-[#E2E8F0] leading-none">{streak}</p>
            <p className="text-[10px] uppercase tracking-wider text-[#E2E8F0]/40">day streak</p>
          </div>
        </div>
        <span className="text-[10px] uppercase tracking-[0.2em] text-[#E10000] font-bold">{tier.label}</span>
      </div>

      <div className="flex flex-wrap gap-1 mb-5">
        {STREAK_TIERS.map((s) => (
          <span key={s.min} className={`text-[9px] uppercase tracking-wider px-1.5 py-0.5 rounded-sm border ${streak >= s.min ? 'border-[#E10000] text-[#E10000] bg-[#E10000]/10' : 'border-[#1C1010] text-[#E2E8F0]/30'}`}>
            {s.min}d
          </span>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-4"><Loader2 className="w-5 h-5 animate-spin text-[#E10000]" /></div>
      ) : checkedIn ? (
        <div className="flex items-center justify-center gap-2 py-3 border border-[#E10000]/40 bg-[#E10000]/10 rounded-sm">
          <Check className="w-4 h-4 text-[#E10000]" />
          <span className="text-xs uppercase tracking-[0.2em] text-[#E2E8F0] font-bold">Checked in today</span>
        </div>
      ) : (
        <button
          onClick={checkIn}
          disabled={busy}
          className="w-full py-3 bg-[#E10000] text-white text-xs uppercase tracking-[0.25em] rounded-sm hover:bg-[#E10000]/80 disabled:opacity-50 transition-all lift-3d flex items-center justify-center gap-2"
        >
          {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Flame className="w-4 h-4" />}
          Check In Today
        </button>
      )}
      <p className="text-[10px] text-[#E2E8F0]/30 text-center mt-3">Come back every day to keep your streak alive</p>
    </div>
  );
}