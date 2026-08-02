import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Plus, Pencil, Trash2, X, Loader2 } from 'lucide-react';
import ImageUpload from './ImageUpload';
import { Input, TextArea } from './FormFields';

export default function GearTab() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);

  useEffect(() => { loadItems(); }, []);

  const loadItems = async () => {
    setLoading(true);
    try { setItems(await base44.entities.GearItem.list()); } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const handleSave = async () => {
    try {
      if (editing.id) await base44.entities.GearItem.update(editing.id, editing);
      else await base44.entities.GearItem.create(editing);
      setEditing(null); loadItems();
    } catch (e) { alert('Failed to save. Make sure you are logged in as an admin.'); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this gear item?')) return;
    try { await base44.entities.GearItem.delete(id); loadItems(); }
    catch (e) { alert('Failed to delete.'); }
  };

  if (editing) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-heading text-xl text-[#E2E8F0] uppercase">{editing.id ? 'Edit' : 'Add'} Gear</h3>
          <button onClick={() => setEditing(null)} className="text-[#E2E8F0]/50 hover:text-[#E10000]"><X className="w-5 h-5" /></button>
        </div>
        <Input label="Name" value={editing.name} onChange={(v) => setEditing({ ...editing, name: v })} />
        <Input label="Category" value={editing.category} onChange={(v) => setEditing({ ...editing, category: v })} placeholder="Rods, Reels, Line, etc." />
        <Input label="Link URL" value={editing.link_url} onChange={(v) => setEditing({ ...editing, link_url: v })} placeholder="https://..." />
        <TextArea label="Description" value={editing.description} onChange={(v) => setEditing({ ...editing, description: v })} rows={4} />
        <ImageUpload value={editing.image_url} onChange={(url) => setEditing({ ...editing, image_url: url })} label="Image" />
        <Input label="Display Order" value={String(editing.display_order ?? 0)} onChange={(v) => setEditing({ ...editing, display_order: Number(v) || 0 })} />
        <button onClick={handleSave} className="px-6 py-2 bg-[#E10000] text-white text-xs uppercase tracking-wider rounded-sm hover:bg-transparent hover:text-[#E10000] hover:border hover:border-[#E10000] transition-all">Save Gear</button>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-heading text-xl text-[#E2E8F0] uppercase">Gear ({items.length})</h3>
        <button onClick={() => setEditing({ name: '', category: 'General', display_order: 0 })} className="flex items-center gap-2 px-4 py-2 border border-[#1C1010] hover:border-[#E10000] rounded-sm text-xs uppercase tracking-wider text-[#E2E8F0] transition-colors">
          <Plus className="w-4 h-4" /> Add Gear
        </button>
      </div>
      {loading ? (
        <div className="text-center py-8"><Loader2 className="w-6 h-6 animate-spin text-[#E10000] mx-auto" /></div>
      ) : (
        <div className="space-y-3">
          {items.map(t => (
            <div key={t.id} className="flex gap-3 p-3 border border-[#1C1010] rounded-sm">
              {t.image_url && <img src={t.image_url} alt="" className="w-12 h-12 object-cover rounded-sm" />}
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-semibold text-[#E2E8F0] truncate">{t.name}</h4>
                <p className="text-xs text-[#E2E8F0]/40 truncate">{t.category}</p>
              </div>
              <div className="flex gap-2">
                <button onClick={() => setEditing(t)} className="text-[#E2E8F0]/60 hover:text-[#E10000]"><Pencil className="w-3.5 h-3.5" /></button>
                <button onClick={() => handleDelete(t.id)} className="text-[#E2E8F0]/60 hover:text-red-400"><Trash2 className="w-3.5 h-3.5" /></button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}