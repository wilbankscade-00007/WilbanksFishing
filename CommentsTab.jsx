import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Plus, Pencil, Trash2, X, Loader2 } from 'lucide-react';
import { Input, TextArea, Toggle } from './FormFields';
import ImageUpload from './ImageUpload';

export default function CommentsTab() {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);

  useEffect(() => { loadComments(); }, []);

  const loadComments = async () => {
    setLoading(true);
    try { setComments(await base44.entities.Comment.list()); } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const handleSave = async () => {
    try {
      if (editing.id) await base44.entities.Comment.update(editing.id, editing);
      else await base44.entities.Comment.create(editing);
      setEditing(null); loadComments();
    } catch (e) { alert('Failed to save.'); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this comment?')) return;
    try { await base44.entities.Comment.delete(id); loadComments(); }
    catch (e) { alert('Failed to delete.'); }
  };

  if (editing) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-heading text-xl text-[#E2E8F0] uppercase">{editing.id ? 'Edit' : 'Add'} Comment</h3>
          <button onClick={() => setEditing(null)} className="text-[#E2E8F0]/50 hover:text-[#E10000]"><X className="w-5 h-5" /></button>
        </div>
        <Input label="Author" value={editing.author} onChange={(v) => setEditing({ ...editing, author: v })} />
        <TextArea label="Comment Text" value={editing.text} onChange={(v) => setEditing({ ...editing, text: v })} rows={4} />
        <ImageUpload label="Comment Screenshot (optional)" value={editing.image_url} onChange={(v) => setEditing({ ...editing, image_url: v })} />
        <Input label="Video URL" value={editing.video_url} onChange={(v) => setEditing({ ...editing, video_url: v })} placeholder="https://..." />
        <Toggle label="Featured (Comment of the Week)" checked={editing.is_featured} onChange={(v) => setEditing({ ...editing, is_featured: v })} />
        <button onClick={handleSave} className="px-6 py-2 bg-[#E10000] text-white text-xs uppercase tracking-wider rounded-sm hover:bg-transparent hover:text-[#E10000] hover:border hover:border-[#E10000] transition-all">Save Comment</button>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-heading text-xl text-[#E2E8F0] uppercase">Comments ({comments.length})</h3>
        <button onClick={() => setEditing({ author: '', text: '', image_url: '', is_featured: false })} className="flex items-center gap-2 px-4 py-2 border border-[#1C1010] hover:border-[#E10000] rounded-sm text-xs uppercase tracking-wider text-[#E2E8F0] transition-colors">
          <Plus className="w-4 h-4" /> Add Comment
        </button>
      </div>
      {loading ? (
        <div className="text-center py-8"><Loader2 className="w-6 h-6 animate-spin text-[#E10000] mx-auto" /></div>
      ) : comments.length === 0 ? (
        <p className="text-center text-[#E2E8F0]/40 text-sm py-8">No comments yet. Add one to feature on the home page.</p>
      ) : (
        <div className="space-y-3">
          {comments.map(c => (
            <div key={c.id} className="p-3 border border-[#1C1010] rounded-sm">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-semibold text-[#E2E8F0]">{c.author}</h4>
                    {c.is_featured && <span className="text-[10px] text-[#E10000] uppercase tracking-wider border border-[#E10000] px-2 py-0.5 rounded-sm">Featured</span>}
                  </div>
                  <p className="text-xs text-[#E2E8F0]/60 mt-1 line-clamp-2">{c.text}</p>
                </div>
                <div className="flex gap-2 flex-shrink-0">
                  <button onClick={() => setEditing(c)} className="text-[#E2E8F0]/60 hover:text-[#E10000]"><Pencil className="w-3.5 h-3.5" /></button>
                  <button onClick={() => handleDelete(c.id)} className="text-[#E2E8F0]/60 hover:text-red-400"><Trash2 className="w-3.5 h-3.5" /></button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}