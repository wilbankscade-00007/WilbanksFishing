import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Plus, Pencil, Trash2, X, Loader2 } from 'lucide-react';
import ImageUpload from './ImageUpload';
import { Input } from './FormFields';

export default function CatchGalleryTab() {
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);

  useEffect(() => { loadPhotos(); }, []);

  const loadPhotos = async () => {
    setLoading(true);
    try { setPhotos(await base44.entities.CatchGalleryPhoto.list()); } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const handleSave = async () => {
    try {
      if (editing.is_catch_of_month) {
        const others = photos.filter(p => p.id !== editing.id && p.is_catch_of_month);
        if (others.length) await base44.entities.CatchGalleryPhoto.bulkUpdate(others.map(o => ({ id: o.id, is_catch_of_month: false })));
      }
      if (editing.id) await base44.entities.CatchGalleryPhoto.update(editing.id, editing);
      else await base44.entities.CatchGalleryPhoto.create(editing);
      setEditing(null); loadPhotos();
    } catch (e) { alert('Failed to save.'); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this photo?')) return;
    try { await base44.entities.CatchGalleryPhoto.delete(id); loadPhotos(); }
    catch (e) { alert('Failed to delete.'); }
  };

  if (editing) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-heading text-xl text-[#E2E8F0] uppercase">{editing.id ? 'Edit' : 'Add'} Gallery Photo</h3>
          <button onClick={() => setEditing(null)} className="text-[#E2E8F0]/50 hover:text-[#E10000]"><X className="w-5 h-5" /></button>
        </div>
        <ImageUpload value={editing.image_url} onChange={(url) => setEditing({ ...editing, image_url: url })} label="Photo" />
        <Input label="Caption" value={editing.caption} onChange={(v) => setEditing({ ...editing, caption: v })} />
        <Input label="Submitted By" value={editing.author} onChange={(v) => setEditing({ ...editing, author: v })} />
        <Input label="Display Order" type="number" value={editing.display_order} onChange={(v) => setEditing({ ...editing, display_order: Number(v) })} />
        <div className="space-y-3 border border-[#1C1010] rounded-sm p-4 bg-[#0A0A0A]/40">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={!!editing.is_catch_of_month}
              onChange={(e) => setEditing({ ...editing, is_catch_of_month: e.target.checked, featured_month: e.target.checked ? (editing.featured_month || new Date().toISOString().slice(0, 7)) : editing.featured_month })}
              className="w-4 h-4 accent-[#E10000]"
            />
            <span className="text-sm text-[#E2E8F0] uppercase tracking-wider">Feature as Catch of the Month</span>
          </label>
          {editing.is_catch_of_month && (
            <>
              <Input label="Featured Month (YYYY-MM)" value={editing.featured_month || ''} onChange={(v) => setEditing({ ...editing, featured_month: v })} />
              <div>
                <label className="block text-xs uppercase tracking-wider text-[#E2E8F0]/50 mb-1">Story</label>
                <textarea
                  value={editing.story || ''}
                  onChange={(e) => setEditing({ ...editing, story: e.target.value })}
                  rows={4}
                  placeholder="Tell this fan's story…"
                  className="w-full bg-[#0A0A0A] border border-[#1C1010] focus:border-[#E10000] rounded-sm p-3 text-sm text-[#E2E8F0] outline-none resize-y"
                />
              </div>
            </>
          )}
        </div>
        <button onClick={handleSave} className="px-6 py-2 bg-[#E10000] text-white text-xs uppercase tracking-wider rounded-sm hover:bg-transparent hover:text-[#E10000] hover:border hover:border-[#E10000] transition-all">Save Photo</button>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-heading text-xl text-[#E2E8F0] uppercase">Catch Gallery ({photos.length})</h3>
        <button onClick={() => setEditing({ image_url: '', caption: '', display_order: 0, is_catch_of_month: false, story: '', featured_month: '' })} className="flex items-center gap-2 px-4 py-2 border border-[#1C1010] hover:border-[#E10000] rounded-sm text-xs uppercase tracking-wider text-[#E2E8F0] transition-colors">
          <Plus className="w-4 h-4" /> Add Photo
        </button>
      </div>
      <p className="text-xs text-[#E2E8F0]/40 mb-6">These photos feed the Catch Gallery page and the Send Me Your Best Catch marquee — separate from the hero catch photos.</p>
      {loading ? (
        <div className="text-center py-8"><Loader2 className="w-6 h-6 animate-spin text-[#E10000] mx-auto" /></div>
      ) : photos.length === 0 ? (
        <p className="text-center text-[#E2E8F0]/40 text-sm py-8">No gallery photos yet.</p>
      ) : (
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
          {photos.map(p => (
            <div key={p.id} className="relative group">
              <img src={p.image_url} alt="" className="w-full aspect-square object-cover rounded-sm border border-[#1C1010]" />
              {p.is_catch_of_month && <span className="absolute top-1 left-1 bg-[#E10000] text-white text-[9px] uppercase tracking-wider px-1.5 py-0.5 rounded-sm z-10">★ CotM</span>}
              <div className="absolute inset-0 bg-[#0A0A0A]/80 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2 p-2">
                <p className="text-xs text-[#E2E8F0] text-center line-clamp-2">{p.caption}</p>
                <div className="flex gap-2">
                  <button onClick={() => setEditing(p)} className="text-[#E2E8F0]/80 hover:text-[#E10000]"><Pencil className="w-4 h-4" /></button>
                  <button onClick={() => handleDelete(p.id)} className="text-[#E2E8F0]/80 hover:text-red-400"><Trash2 className="w-4 h-4" /></button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}