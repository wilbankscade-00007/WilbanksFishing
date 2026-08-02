import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Plus, Pencil, Trash2, X, Loader2 } from 'lucide-react';
import ImageUpload from './ImageUpload';
import { Input, TextArea, Select } from './FormFields';

export default function BehindTheScenesTab() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);

  useEffect(() => { loadItems(); }, []);

  const loadItems = async () => {
    setLoading(true);
    try { setItems(await base44.entities.BehindTheScenes.list('-created_date')); } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const handleSave = async () => {
    try {
      if (editing.id) await base44.entities.BehindTheScenes.update(editing.id, editing);
      else await base44.entities.BehindTheScenes.create(editing);
      setEditing(null); loadItems();
    } catch (e) { alert('Failed to save. Make sure you are logged in as an admin.'); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this item?')) return;
    try { await base44.entities.BehindTheScenes.delete(id); loadItems(); }
    catch (e) { alert('Failed to delete.'); }
  };

  if (editing) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-heading text-xl text-[#E2E8F0] uppercase">{editing.id ? 'Edit' : 'Add'} BTS Content</h3>
          <button onClick={() => setEditing(null)} className="text-[#E2E8F0]/50 hover:text-[#E10000]"><X className="w-5 h-5" /></button>
        </div>
        <Input label="Title" value={editing.title} onChange={(v) => setEditing({ ...editing, title: v })} />
        <Select label="Media Type" value={editing.media_type || 'image'} onChange={(v) => setEditing({ ...editing, media_type: v })} options={[
          { value: 'image', label: 'Image (upload)' }, { value: 'video', label: 'Video (YouTube URL)' }
        ]} />
        <TextArea label="Description" value={editing.description} onChange={(v) => setEditing({ ...editing, description: v })} />
        {editing.media_type === 'video' ? (
          <Input label="YouTube URL" value={editing.media_url} onChange={(v) => setEditing({ ...editing, media_url: v })} placeholder="https://youtube.com/watch?v=..." />
        ) : (
          <ImageUpload value={editing.media_url} onChange={(url) => setEditing({ ...editing, media_url: url })} label="Image" />
        )}
        <button onClick={handleSave} className="px-6 py-2 bg-[#E10000] text-white text-xs uppercase tracking-wider rounded-sm hover:bg-transparent hover:text-[#E10000] hover:border hover:border-[#E10000] transition-all">Save Content</button>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-heading text-xl text-[#E2E8F0] uppercase">Behind the Scenes ({items.length})</h3>
        <button onClick={() => setEditing({ title: '', description: '', media_type: 'image', media_url: '' })} className="flex items-center gap-2 px-4 py-2 border border-[#1C1010] hover:border-[#E10000] rounded-sm text-xs uppercase tracking-wider text-[#E2E8F0] transition-colors">
          <Plus className="w-4 h-4" /> Add Content
        </button>
      </div>
      {loading ? (
        <div className="text-center py-8"><Loader2 className="w-6 h-6 animate-spin text-[#E10000] mx-auto" /></div>
      ) : (
        <div className="grid sm:grid-cols-2 gap-4">
          {items.map(item => (
            <div key={item.id} className="flex gap-3 p-3 border border-[#1C1010] rounded-sm">
              {item.media_type === 'image' && item.media_url ? (
                <img src={item.media_url} alt="" className="w-16 h-16 object-cover rounded-sm" />
              ) : (
                <div className="w-16 h-16 flex items-center justify-center text-[#E2E8F0]/30 text-xs">{item.media_type}</div>
              )}
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-semibold text-[#E2E8F0] truncate">{item.title}</h4>
                <p className="text-xs text-[#E2E8F0]/40 truncate">{item.media_type}</p>
                <div className="flex gap-2 mt-2">
                  <button onClick={() => setEditing(item)} className="text-[#E2E8F0]/60 hover:text-[#E10000]"><Pencil className="w-3.5 h-3.5" /></button>
                  <button onClick={() => handleDelete(item.id)} className="text-[#E2E8F0]/60 hover:text-red-400"><Trash2 className="w-3.5 h-3.5" /></button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}