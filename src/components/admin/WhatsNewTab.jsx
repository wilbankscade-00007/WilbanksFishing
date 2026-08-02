import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Plus, Pencil, Trash2, X, Loader2 } from 'lucide-react';
import { Input, TextArea, Select } from './FormFields';

const ICON_OPTIONS = [
  { label: 'Video', value: 'video' },
  { label: 'Merch', value: 'merch' },
  { label: 'Tip', value: 'tip' },
  { label: 'Behind the Scenes', value: 'bts' },
  { label: 'Gallery', value: 'gallery' },
  { label: 'Other', value: 'other' },
];

export default function WhatsNewTab() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);

  useEffect(() => { loadItems(); }, []);

  const loadItems = async () => {
    setLoading(true);
    try { setItems(await base44.entities.WhatsNew.list('-created_date')); } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const handleSave = async () => {
    try {
      if (editing.id) await base44.entities.WhatsNew.update(editing.id, editing);
      else await base44.entities.WhatsNew.create(editing);
      setEditing(null); loadItems();
    } catch (e) { alert('Failed to save.'); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this item?')) return;
    try { await base44.entities.WhatsNew.delete(id); loadItems(); }
    catch (e) { alert('Failed to delete.'); }
  };

  if (editing) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-heading text-xl text-[#E2E8F0] uppercase">{editing.id ? 'Edit' : 'Add'} What's New</h3>
          <button onClick={() => setEditing(null)} className="text-[#E2E8F0]/50 hover:text-[#E10000]"><X className="w-5 h-5" /></button>
        </div>
        <Input label="Title" value={editing.title} onChange={(v) => setEditing({ ...editing, title: v })} />
        <TextArea label="Description" value={editing.description} onChange={(v) => setEditing({ ...editing, description: v })} rows={3} />
        <Input label="Link URL (optional)" value={editing.link_url} onChange={(v) => setEditing({ ...editing, link_url: v })} />
        <Select label="Icon" value={editing.icon} options={ICON_OPTIONS} onChange={(v) => setEditing({ ...editing, icon: v })} />
        <Input label="Display Order" type="number" value={editing.display_order} onChange={(v) => setEditing({ ...editing, display_order: Number(v) })} />
        <button onClick={handleSave} className="px-6 py-2 bg-[#E10000] text-white text-xs uppercase tracking-wider rounded-sm hover:bg-transparent hover:text-[#E10000] hover:border hover:border-[#E10000] transition-all">Save Item</button>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-heading text-xl text-[#E2E8F0] uppercase">What's New ({items.length})</h3>
        <button onClick={() => setEditing({ title: '', description: '', link_url: '', icon: 'other', display_order: 0 })} className="flex items-center gap-2 px-4 py-2 border border-[#1C1010] hover:border-[#E10000] rounded-sm text-xs uppercase tracking-wider text-[#E2E8F0] transition-colors">
          <Plus className="w-4 h-4" /> Add Item
        </button>
      </div>
      <p className="text-xs text-[#E2E8F0]/40 mb-6">New items pop up for visitors the next time they open the site. Each item only shows once per visitor.</p>
      {loading ? (
        <div className="text-center py-8"><Loader2 className="w-6 h-6 animate-spin text-[#E10000] mx-auto" /></div>
      ) : items.length === 0 ? (
        <p className="text-center text-[#E2E8F0]/40 text-sm py-8">No items yet.</p>
      ) : (
        <div className="space-y-3">
          {items.map(it => (
            <div key={it.id} className="flex items-start justify-between p-4 border border-[#1C1010] rounded-sm gap-4">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] uppercase tracking-wider text-[#E10000]">{it.icon}</span>
                </div>
                <p className="font-bold text-sm text-[#E2E8F0] mt-1">{it.title}</p>
                <p className="text-xs text-[#E2E8F0]/60 mt-1 line-clamp-2">{it.description}</p>
              </div>
              <div className="flex gap-2 flex-shrink-0">
                <button onClick={() => setEditing(it)} className="text-[#E2E8F0]/80 hover:text-[#E10000]"><Pencil className="w-4 h-4" /></button>
                <button onClick={() => handleDelete(it.id)} className="text-[#E2E8F0]/80 hover:text-red-400"><Trash2 className="w-4 h-4" /></button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}