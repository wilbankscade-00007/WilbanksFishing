import React, { useState, useEffect } from 'react';
import { Loader2, LogIn } from 'lucide-react';
import { Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { useReactions } from '@/hooks/useReactions';

const REACTION_EMOJIS = ['🔥', '🐟', '❤️', '😂', '🎯', '🤯'];

function ytThumb(url) {
  const m = String(url || '').match(/(?:v=|youtu\.be\/|embed\/)([A-Za-z0-9_-]{11})/);
  return m ? `https://img.youtube.com/vi/${m[1]}/hqdefault.jpg` : null;
}

export default function EpisodeReactions() {
  const [video, setVideo] = useState(null);
  const [loadingVid, setLoadingVid] = useState(true);
  const [busy, setBusy] = useState(null);

  useEffect(() => {
    base44.entities.Video.list('-created_date', 1)
      .then((d) => setVideo((d || [])[0] || null))
      .catch(() => {})
      .finally(() => setLoadingVid(false));
  }, []);

  const vidId = video?.id || 'none';
  const { reactions, myReaction, loading, user, submit } = useReactions('video_reaction', vidId, { unique: true });

  const counts = {};
  reactions.forEach((r) => { counts[r.value] = (counts[r.value] || 0) + 1; });
  const myPick = myReaction?.value;

  const react = async (emoji) => {
    if (!user || busy) return;
    setBusy(emoji);
    try { await submit(emoji); } catch (e) { /* ignore */ }
    finally { setBusy(null); }
  };

  if (!user) {
    return (
      <div className="flex flex-col items-center text-center py-10 px-6 border border-[#1C1010] rounded-sm bg-[#0A0A0A]/60">
        <div className="w-12 h-12 rounded-full border border-[#E10000]/40 bg-[#E10000]/10 flex items-center justify-center mb-3"><LogIn className="w-5 h-5 text-[#E10000]" /></div>
        <h3 className="font-heading font-bold text-base text-[#E2E8F0] uppercase mb-1">Log in to react</h3>
        <p className="text-xs text-[#E2E8F0]/50 max-w-xs mb-4">Pick an emoji reaction to the latest episode.</p>
        <Link to="/login" className="px-5 py-2 bg-[#E10000] text-white text-[11px] uppercase tracking-[0.2em] rounded-sm hover:bg-transparent hover:border hover:border-[#E10000] transition-all lift-3d">Log In</Link>
      </div>
    );
  }

  if (loadingVid || loading) {
    return <div className="flex justify-center py-10"><Loader2 className="w-6 h-6 animate-spin text-[#E10000]" /></div>;
  }
  if (!video) {
    return <p className="text-center text-sm text-[#E2E8F0]/40 py-8 border border-[#1C1010] rounded-sm">No episode loaded yet.</p>;
  }

  const thumb = ytThumb(video.youtube_url);

  return (
    <div className="border border-[#1C1010] rounded-sm bg-[#0A0A0A]/60 p-4 h-full flex flex-col">
      <div className="flex gap-3 mb-4">
        {thumb ? (
          <img src={thumb} alt={video.title} className="w-24 h-16 object-cover rounded-sm border border-[#1C1010] shrink-0" />
        ) : (
          <div className="w-24 h-16 rounded-sm border border-[#1C1010] bg-[#1C1010] shrink-0" />
        )}
        <div className="min-w-0 flex-1">
          <p className="text-[10px] uppercase tracking-[0.2em] text-[#E10000] font-bold mb-1">Latest Episode</p>
          <p className="font-heading font-bold text-sm text-[#E2E8F0] uppercase leading-tight line-clamp-3">{video.title}</p>
        </div>
      </div>
      <p className="text-[10px] uppercase tracking-wider text-[#E2E8F0]/40 mb-2">Tap your reaction{myPick ? ' · tap again to change' : ''}</p>
      <div className="grid grid-cols-3 gap-2">
        {REACTION_EMOJIS.map((e) => {
          const count = counts[e] || 0;
          const mine = myPick === e;
          return (
            <button
              key={e}
              onClick={() => react(e)}
              disabled={!!busy}
              className={`relative flex flex-col items-center gap-1 py-3 rounded-sm border transition-all lift-3d ${mine ? 'border-[#E10000] bg-[#E10000]/15 shadow-[0_0_14px_rgba(225,0,0,0.4)]' : 'border-[#1C1010] hover:border-[#E10000]/60 hover:bg-[#E10000]/5'}`}
            >
              <span className="text-2xl">{busy === e ? <Loader2 className="w-5 h-5 animate-spin text-[#E10000]" /> : e}</span>
              <span className="text-[10px] font-bold text-[#E2E8F0]/70">{count}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}