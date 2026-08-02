import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Plus, Pencil, Trash2, X, Loader2 } from 'lucide-react';
import ImageUpload from './ImageUpload';
import { Input, TextArea } from './FormFields';

export default function AboutTab() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);

  useEffect(() => { loadItems(); }, []);

  const loadItems = async () => {
    setLoading(true);
    try { setItems(await base44.entities.AboutContent.list()); } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const handleSave = async () => {
    try {
      if (editing.id) await base44.entities.AboutContent.update(editing.id, editing);
      else await base44.entities.AboutContent.create(editing);
      setEditing(null); loadItems();
    } catch (e) { alert('Failed to save. Make sure you are logged in as an admin.'); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this section?')) return;
    try { await base44.entities.AboutContent.delete(id); loadItems(); }
    catch (e) { alert('Failed to delete.'); }
  };

  if (editing) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-heading text-xl text-[#E2E8F0] uppercase">{editing.id ? 'Edit' : 'Add'} About Section</h3>
          <button onClick={() => setEditing(null)} className="text-[#E2E8F0]/50 hover:text-[#E10000]"><X className="w-5 h-5" /></button>
        </div>
        <Input label="Title" value={editing.title} onChange={(v) => setEditing({ ...editing, title: v })} placeholder="e.g., How It Started" />
        <TextArea label="Bio Text" value={editing.bio} onChange={(v) => setEditing({ ...editing, bio: v })} rows={6} />
        <ImageUpload value={editing.photo_url} onChange={(url) => setEditing({ ...editing, photo_url: url })} label="Photo" />
        <Input label="Display Order" type="number" value={editing.display_order} onChange={(v) => setEditing({ ...editing, display_order: Number(v) })} />
        <button onClick={handleSave} className="px-6 py-2 bg-[#E10000] text-white text-xs uppercase tracking-wider rounded-sm hover:bg-transparent hover:text-[#E10000] hover:border hover:border-[#E10000] transition-all">Save Section</button>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-heading text-xl text-[#E2E8F0] uppercase">About Sections ({items.length})</h3>
        <button onClick={() => setEditing({ title: '', bio: '', display_order: 0 })} className="flex items-center gap-2 px-4 py-2 border border-[#1C1010] hover:border-[#E10000] rounded-sm text-xs uppercase tracking-wider text-[#E2E8F0] transition-colors">
          <Plus className="w-4 h-4" /> Add Section
        </button>
      </div>
      {loading ? (
        <div className="text-center py-8"><Loader2 className="w-6 h-6 animate-spin text-[#E10000] mx-auto" /></div>
      ) : items.length === 0 ? (
        <p className="text-center text-[#E2E8F0]/40 text-sm py-8">No about sections yet. Add one to get started.</p>
      ) : (
        <div className="space-y-3">
          {items.map(item => (
            <div key={item.id} className="flex gap-3 p-3 border border-[#1C1010] rounded-sm">
              {item.photo_url ? (
                <img src={item.photo_url} alt="" className="w-16 h-16 object-cover rounded-sm" />
              ) : (
                <div className="w-16 h-16 flex items-center justify-center text-[#E2E8F0]/30 text-xs">No photo</div>
              )}
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-semibold text-[#E2E8F0] truncate">{item.title}</h4>
                <p className="text-xs text-[#E2E8F0]/50 line-clamp-2 mt-1">{item.bio}</p>
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