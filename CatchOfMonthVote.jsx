import React, { useState, useEffect } from 'react';
import { Loader2, LogIn, Trophy } from 'lucide-react';
import { Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { useReactions } from '@/hooks/useReactions';

function monthKey() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}
function monthLabel() {
  return new Date().toLocaleString('en-US', { month: 'long', year: 'numeric' });
}

export default function CatchOfMonthVote() {
  const { reactions, myReaction, loading, user, submit } = useReactions('catch_vote', monthKey(), { unique: true });
  const [photos, setPhotos] = useState([]);
  const [loadingPhotos, setLoadingPhotos] = useState(true);
  const [voting, setVoting] = useState(null);

  useEffect(() => {
    base44.entities.CatchGalleryPhoto.list()
      .then((data) => setPhotos((data || []).filter((p) => !p.is_catch_of_month).slice(0, 8)))
      .catch(() => {})
      .finally(() => setLoadingPhotos(false));
  }, []);

  const counts = {};
  reactions.forEach((r) => { counts[r.value] = (counts[r.value] || 0) + 1; });
  const totalVotes = reactions.length;
  const votedFor = myReaction?.value;

  const vote = async (photoId) => {
    if (!user || voting) return;
    setVoting(photoId);
    try { await submit(photoId); } catch (e) { /* ignore */ }
    finally { setVoting(null); }
  };

  if (!user) {
    return (
      <div className="flex flex-col items-center text-center py-10 px-6 border border-[#1C1010] rounded-sm bg-[#0A0A0A]/60">
        <div className="w-12 h-12 rounded-full border border-[#E10000]/40 bg-[#E10000]/10 flex items-center justify-center mb-3"><LogIn className="w-5 h-5 text-[#E10000]" /></div>
        <h3 className="font-heading font-bold text-base text-[#E2E8F0] uppercase mb-1">Log in to vote</h3>
        <p className="text-xs text-[#E2E8F0]/50 max-w-xs mb-4">Pick your favorite catch — one vote per member each month.</p>
        <Link to="/login" className="px-5 py-2 bg-[#E10000] text-white text-[11px] uppercase tracking-[0.2em] rounded-sm hover:bg-transparent hover:border hover:border-[#E10000] transition-all lift-3d">Log In</Link>
      </div>
    );
  }

  if (loadingPhotos) {
    return <div className="flex justify-center py-10"><Loader2 className="w-6 h-6 animate-spin text-[#E10000]" /></div>;
  }
  if (photos.length === 0) {
    return <p className="text-center text-sm text-[#E2E8F0]/40 py-8 border border-[#1C1010] rounded-sm">No catch photos to vote on yet — check back soon.</p>;
  }

  return (
    <div className="border border-[#1C1010] rounded-sm bg-[#0A0A0A]/60 p-4">
      <div className="flex items-center justify-between mb-4">
        <span className="text-[10px] uppercase tracking-[0.3em] text-[#E2E8F0]/50">{monthLabel()}</span>
        <span className="text-[10px] uppercase tracking-wider text-[#E10000] font-bold">{totalVotes} {totalVotes === 1 ? 'vote' : 'votes'}</span>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {photos.map((p) => {
          const count = counts[p.id] || 0;
          const pct = totalVotes ? Math.round((count / totalVotes) * 100) : 0;
          const mine = votedFor === p.id;
          return (
            <div key={p.id} className={`relative rounded-sm overflow-hidden border transition-all ${mine ? 'border-[#E10000] shadow-[0_0_18px_rgba(225,0,0,0.5)]' : 'border-[#1C1010]'}`}>
              <div className="aspect-square overflow-hidden bg-[#1C1010]">
                <img src={p.image_url} alt={p.caption || 'Catch'} className="w-full h-full object-cover" />
              </div>
              {mine && (
                <span className="absolute top-2 left-2 flex items-center gap-1 px-2 py-0.5 bg-[#E10000] text-white text-[9px] uppercase tracking-wider rounded-sm">
                  <Trophy className="w-3 h-3" /> Your pick
                </span>
              )}
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 to-transparent p-2">
                <div className="h-1.5 rounded-full bg-[#1C1010] overflow-hidden mb-1.5">
                  <div className="h-full bg-[#E10000] transition-all" style={{ width: `${pct}%` }} />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-[#E2E8F0]/70 truncate pr-1">{p.caption || p.author || 'Catch'}</span>
                  <span className="text-[10px] font-bold text-[#E2E8F0]">{count}</span>
                </div>
              </div>
              <button
                onClick={() => vote(p.id)}
                disabled={!!voting}
                className={`absolute inset-0 flex items-center justify-center bg-black/0 hover:bg-black/40 transition-all text-xs uppercase tracking-[0.2em] font-bold ${mine ? 'text-transparent hover:text-transparent' : 'text-transparent hover:text-[#E10000]'}`}
              >
                {!mine && (voting === p.id ? <Loader2 className="w-5 h-5 animate-spin" /> : <span className="opacity-0 hover:opacity-100 px-3 py-1.5 border border-[#E10000] rounded-sm bg-[#0A0A0A]/80">Vote</span>)}
              </button>
            </div>
          );
        })}
      </div>
      {votedFor && <p className="text-center text-[11px] text-[#E2E8F0]/50 mt-4">Voted! Tap another photo to switch your pick.</p>}
    </div>
  );
}