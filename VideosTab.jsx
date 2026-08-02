import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Plus, Pencil, Trash2, X, Loader2 } from 'lucide-react';
import { Input, TextArea } from './FormFields';

export default function VideosTab() {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);

  useEffect(() => { loadVideos(); }, []);

  const loadVideos = async () => {
    setLoading(true);
    try { setVideos(await base44.entities.Video.list()); } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const handleSave = async () => {
    try {
      if (editing.id) await base44.entities.Video.update(editing.id, editing);
      else await base44.entities.Video.create(editing);
      setEditing(null); loadVideos();
    } catch (e) { alert('Failed to save. Make sure you are logged in as an admin.'); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this video?')) return;
    try { await base44.entities.Video.delete(id); loadVideos(); }
    catch (e) { alert('Failed to delete.'); }
  };

  if (editing) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-heading text-xl text-[#E2E8F0] uppercase">{editing.id ? 'Edit' : 'Add'} Video</h3>
          <button onClick={() => setEditing(null)} className="text-[#E2E8F0]/50 hover:text-[#E10000]"><X className="w-5 h-5" /></button>
        </div>
        <Input label="Title" value={editing.title} onChange={(v) => setEditing({ ...editing, title: v })} />
        <Input label="YouTube URL" value={editing.youtube_url} onChange={(v) => setEditing({ ...editing, youtube_url: v })} placeholder="https://youtube.com/watch?v=..." />
        <TextArea label="Description" value={editing.description} onChange={(v) => setEditing({ ...editing, description: v })} />
        <button onClick={handleSave} className="px-6 py-2 bg-[#E10000] text-white text-xs uppercase tracking-wider rounded-sm hover:bg-transparent hover:text-[#E10000] hover:border hover:border-[#E10000] transition-all">Save Video</button>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-heading text-xl text-[#E2E8F0] uppercase">Videos ({videos.length})</h3>
        <button onClick={() => setEditing({ title: '', youtube_url: '', description: '' })} className="flex items-center gap-2 px-4 py-2 border border-[#1C1010] hover:border-[#E10000] rounded-sm text-xs uppercase tracking-wider text-[#E2E8F0] transition-colors">
          <Plus className="w-4 h-4" /> Add Video
        </button>
      </div>
      {loading ? (
        <div className="text-center py-8"><Loader2 className="w-6 h-6 animate-spin text-[#E10000] mx-auto" /></div>
      ) : (
        <div className="space-y-3">
          {videos.map(v => (
            <div key={v.id} className="flex items-center gap-3 p-3 border border-[#1C1010] rounded-sm">
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-semibold text-[#E2E8F0] truncate">{v.title}</h4>
                <p className="text-xs text-[#E2E8F0]/40 truncate">{v.youtube_url}</p>
              </div>
              <div className="flex gap-2">
                <button onClick={() => setEditing(v)} className="text-[#E2E8F0]/60 hover:text-[#E10000]"><Pencil className="w-3.5 h-3.5" /></button>
                <button onClick={() => handleDelete(v.id)} className="text-[#E2E8F0]/60 hover:text-red-400"><Trash2 className="w-3.5 h-3.5" /></button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}