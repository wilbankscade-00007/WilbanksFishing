import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Plus, Pencil, Trash2, X, Loader2 } from 'lucide-react';
import ImageUpload from './ImageUpload';
import { Input } from './FormFields';

export default function CatchPhotosTab() {
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);

  useEffect(() => { loadPhotos(); }, []);

  const loadPhotos = async () => {
    setLoading(true);
    try { setPhotos(await base44.entities.CatchPhoto.list()); } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const handleSave = async () => {
    try {
      if (editing.id) await base44.entities.CatchPhoto.update(editing.id, editing);
      else await base44.entities.CatchPhoto.create(editing);
      setEditing(null); loadPhotos();
    } catch (e) { alert('Failed to save.'); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this photo?')) return;
    try { await base44.entities.CatchPhoto.delete(id); loadPhotos(); }
    catch (e) { alert('Failed to delete.'); }
  };

  if (editing) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-heading text-xl text-[#E2E8F0] uppercase">{editing.id ? 'Edit' : 'Add'} Catch Photo</h3>
          <button onClick={() => setEditing(null)} className="text-[#E2E8F0]/50 hover:text-[#E10000]"><X className="w-5 h-5" /></button>
        </div>
        <ImageUpload value={editing.image_url} onChange={(url) => setEditing({ ...editing, image_url: url })} label="Photo" />
        <Input label="Caption" value={editing.caption} onChange={(v) => setEditing({ ...editing, caption: v })} />
        <Input label="Submitted By" value={editing.author} onChange={(v) => setEditing({ ...editing, author: v })} />
        <Input label="Display Order" type="number" value={editing.display_order} onChange={(v) => setEditing({ ...editing, display_order: Number(v) })} />
        <button onClick={handleSave} className="px-6 py-2 bg-[#E10000] text-white text-xs uppercase tracking-wider rounded-sm hover:bg-transparent hover:text-[#E10000] hover:border hover:border-[#E10000] transition-all">Save Photo</button>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-heading text-xl text-[#E2E8F0] uppercase">Catch Photos ({photos.length})</h3>
        <button onClick={() => setEditing({ image_url: '', caption: '', display_order: 0 })} className="flex items-center gap-2 px-4 py-2 border border-[#1C1010] hover:border-[#E10000] rounded-sm text-xs uppercase tracking-wider text-[#E2E8F0] transition-colors">
          <Plus className="w-4 h-4" /> Add Photo
        </button>
      </div>
      {loading ? (
        <div className="text-center py-8"><Loader2 className="w-6 h-6 animate-spin text-[#E10000] mx-auto" /></div>
      ) : photos.length === 0 ? (
        <p className="text-center text-[#E2E8F0]/40 text-sm py-8">No catch photos yet. Add photos to show in the rotating galleries.</p>
      ) : (
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
          {photos.map(p => (
            <div key={p.id} className="relative group">
              <img src={p.image_url} alt="" className="w-full aspect-square object-cover rounded-sm border border-[#1C1010]" />
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