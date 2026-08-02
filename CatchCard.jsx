import React, { useState } from 'react';
import { Trash2, MessageSquare, Wrench, Loader2, Fish } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import CatchComments from './CatchComments';

function timeAgo(d) {
  const diff = Date.now() - new Date(d).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return 'now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

export default function CatchCard({ catchItem, user, onDeleted }) {
  const [showComments, setShowComments] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const canDelete = !!(user && (catchItem.author_id === user.id || user.role === 'admin'));

  const remove = async () => {
    if (!window.confirm('Delete this catch?')) return;
    setDeleting(true);
    try {
      await base44.entities.MemberCatch.delete(catchItem.id);
      onDeleted?.(catchItem.id);
    } catch (e) {} finally { setDeleting(false); }
  };

  return (
    <div className="border border-[#1C1010] rounded-sm bg-[#0A0A0A]/60 overflow-hidden flex flex-col">
      <div className="bg-[#0A0A0A] flex items-center justify-center p-2">
        <img src={catchItem.image_url} alt={catchItem.caption || 'catch'} loading="lazy" className="block max-h-48 max-w-full w-auto h-auto rounded-sm" />
      </div>
      <div className="p-3 flex flex-col flex-1">
        <div className="flex items-center justify-between">
          <span className="text-[11px] text-[#E10000] uppercase tracking-wider font-bold">{catchItem.author_name}</span>
          <span className="text-[10px] text-[#E2E8F0]/30">{timeAgo(catchItem.created_date)}</span>
        </div>
        {catchItem.species && (
          <span className="inline-flex items-center gap-1 text-[10px] uppercase tracking-wider text-[#E10000] border border-[#E10000]/40 bg-[#E10000]/5 px-2 py-0.5 rounded-full mt-1.5 w-fit">
            <Fish className="w-3 h-3" /> {catchItem.species}
          </span>
        )}
        {catchItem.caption && <p className="text-sm text-[#E2E8F0]/90 mt-1 break-words">{catchItem.caption}</p>}
        {catchItem.gear_used && (
          <p className="text-xs text-[#E2E8F0]/50 mt-1 flex items-start gap-1.5 break-words">
            <Wrench className="w-3 h-3 mt-0.5 shrink-0 text-[#E10000]/70" /> {catchItem.gear_used}
          </p>
        )}
        <div className="flex items-center gap-3 mt-2">
          <button onClick={() => setShowComments(s => !s)} className="flex items-center gap-1.5 text-xs text-[#E2E8F0]/50 hover:text-[#E10000]">
            <MessageSquare className="w-3.5 h-3.5" /> Comments
          </button>
          {canDelete && (
            <button onClick={remove} disabled={deleting} className="ml-auto text-xs text-[#E2E8F0]/30 hover:text-[#E10000] flex items-center gap-1 disabled:opacity-40">
              {deleting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />} Delete
            </button>
          )}
        </div>
        {showComments && <CatchComments catchId={catchItem.id} user={user} />}
      </div>
    </div>
  );
}