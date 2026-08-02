import React, { useState, useEffect } from 'react';
import { Loader2, Trash2 } from 'lucide-react';
import { base44 } from '@/api/base44Client';

function timeAgo(d) {
  const diff = Date.now() - new Date(d).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return 'now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

export default function CatchComments({ catchId, user }) {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [text, setText] = useState('');
  const [posting, setPosting] = useState(false);
  const [err, setErr] = useState('');

  const load = async () => {
    try {
      const list = await base44.entities.CatchComment.filter({ catch_id: catchId }, 'created_date', 200);
      setComments(list || []);
    } catch (e) {} finally { setLoading(false); }
  };
  useEffect(() => { load(); }, [catchId]);

  const post = async () => {
    const t = text.trim();
    if (!user || !t) return;
    setPosting(true);
    setErr('');
    try {
      const c = await base44.entities.CatchComment.create({
        catch_id: catchId,
        text: t,
        author_id: user.id,
        author_name: user.full_name || user.email || 'Angler',
      });
      setComments(prev => [...prev, c]);
      setText('');
    } catch (e) {
      setErr('Could not post comment.');
    } finally {
      setPosting(false);
    }
  };

  const remove = async (id) => {
    if (!window.confirm('Delete this comment?')) return;
    try {
      await base44.entities.CatchComment.delete(id);
      setComments(prev => prev.filter(c => c.id !== id));
    } catch (e) {}
  };

  return (
    <div className="mt-3 border-t border-[#1C1010] pt-3">
      {loading ? (
        <div className="flex justify-center py-2"><Loader2 className="w-4 h-4 animate-spin text-[#E10000]" /></div>
      ) : comments.length === 0 ? (
        <p className="text-xs text-[#E2E8F0]/40 text-center py-2">No comments yet — start the gear talk.</p>
      ) : (
        <div className="space-y-2">
          {comments.map((c) => (
            <div key={c.id} className="flex items-start gap-2">
              <div className="flex-1 min-w-0">
                <p className="text-xs">
                  <span className="font-bold text-[#E10000]">{c.author_name}</span>
                  <span className="text-[10px] text-[#E2E8F0]/30 ml-2">{timeAgo(c.created_date)}</span>
                </p>
                <p className="text-sm text-[#E2E8F0]/80 break-words">{c.text}</p>
              </div>
              {user && (c.author_id === user.id || user.role === 'admin') && (
                <button onClick={() => remove(c.id)} className="p-1 text-[#E2E8F0]/30 hover:text-[#E10000]"><Trash2 className="w-3 h-3" /></button>
              )}
            </div>
          ))}
        </div>
      )}
      {user ? (
        <div className="flex gap-2 mt-3">
          <input value={text} onChange={(e) => setText(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); post(); } }} maxLength={300} placeholder="Add a comment — ask about the gear…" className="flex-1 bg-[#0A0A0A] border border-[#1C1010] focus:border-[#E10000] rounded-sm px-3 py-1.5 text-sm text-[#E2E8F0] outline-none" />
          <button onClick={post} disabled={posting || !text.trim()} className="px-3 py-1.5 bg-[#E10000] text-white rounded-sm text-xs uppercase tracking-wider disabled:opacity-40">{posting ? '…' : 'Reply'}</button>
        </div>
      ) : (
        <p className="text-[11px] text-[#E2E8F0]/40 text-center mt-2">Log in to join the discussion.</p>
      )}
      {err && <p className="text-[11px] text-red-400 mt-1">{err}</p>}
    </div>
  );
}