import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Plus, Pencil, Trash2, X, Loader2, Upload } from 'lucide-react';
import ImageUpload from './ImageUpload';
import { Input, TextArea, Select } from './FormFields';

export default function SponsorsTab() {
  const [sponsors, setSponsors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);
  const [uploadingImg, setUploadingImg] = useState(false);

  useEffect(() => { loadSponsors(); }, []);

  const loadSponsors = async () => {
    setLoading(true);
    try { setSponsors(await base44.entities.Sponsor.list()); } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const handleSave = async () => {
    try {
      if (editing.id) await base44.entities.Sponsor.update(editing.id, editing);
      else await base44.entities.Sponsor.create(editing);
      setEditing(null); loadSponsors();
    } catch (e) { alert('Failed to save. Make sure you are logged in as an admin.'); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this sponsor?')) return;
    try { await base44.entities.Sponsor.delete(id); loadSponsors(); }
    catch (e) { alert('Failed to delete.'); }
  };

  const handleAddImage = async (url) => {
    if (!url) return;
    setEditing({ ...editing, images: [...(editing.images || []), url] });
  };

  const handleRemoveImage = (idx) => {
    setEditing({ ...editing, images: editing.images.filter((_, i) => i !== idx) });
  };

  if (editing) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-heading text-xl text-[#E2E8F0] uppercase">{editing.id ? 'Edit' : 'Add'} Sponsor</h3>
          <button onClick={() => setEditing(null)} className="text-[#E2E8F0]/50 hover:text-[#E10000]"><X className="w-5 h-5" /></button>
        </div>
        <Input label="Sponsor Name" value={editing.name} onChange={(v) => setEditing({ ...editing, name: v })} />
        <ImageUpload value={editing.logo_url} onChange={(url) => setEditing({ ...editing, logo_url: url })} label="Logo" />
        <Input label="Website URL" value={editing.website_url} onChange={(v) => setEditing({ ...editing, website_url: v })} placeholder="https://..." />
        <TextArea label="Bio / Description" value={editing.bio} onChange={(v) => setEditing({ ...editing, bio: v })} rows={4} />
        
        <div>
          <label className="text-xs tracking-wider uppercase text-[#E2E8F0]/50 mb-2 block">Pictures</label>
          {editing.images && editing.images.length > 0 && (
            <div className="grid grid-cols-3 gap-2 mb-2">
              {editing.images.map((img, idx) => (
                <div key={idx} className="relative group">
                  <img src={img} alt="" className="w-full h-24 object-cover rounded-sm border border-[#1C1010]" />
                  <button
                    onClick={() => handleRemoveImage(idx)}
                    className="absolute top-1 right-1 w-5 h-5 bg-[#0A0A0A]/80 rounded-full flex items-center justify-center text-[#E10000] opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          )}
          <ImageUpload value={null} onChange={handleAddImage} label="Add Picture" />
        </div>
        
        <button onClick={handleSave} className="px-6 py-2 bg-[#E10000] text-white text-xs uppercase tracking-wider rounded-sm hover:bg-transparent hover:text-[#E10000] hover:border hover:border-[#E10000] transition-all">Save Sponsor</button>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-heading text-xl text-[#E2E8F0] uppercase">Sponsors ({sponsors.length})</h3>
        <button onClick={() => setEditing({ name: '', website_url: '', bio: '', images: [] })} className="flex items-center gap-2 px-4 py-2 border border-[#1C1010] hover:border-[#E10000] rounded-sm text-xs uppercase tracking-wider text-[#E2E8F0] transition-colors">
          <Plus className="w-4 h-4" /> Add Sponsor
        </button>
      </div>
      {loading ? (
        <div className="text-center py-8"><Loader2 className="w-6 h-6 animate-spin text-[#E10000] mx-auto" /></div>
      ) : (
        <div className="grid sm:grid-cols-2 gap-4">
          {sponsors.map(s => (
            <div key={s.id} className="flex gap-3 p-3 border border-[#1C1010] rounded-sm">
              {s.logo_url ? (
                <img src={s.logo_url} alt="" className="w-16 h-16 object-contain rounded-sm" />
              ) : (
                <div className="w-16 h-16 flex items-center justify-center text-[#E2E8F0]/30 text-xs">No logo</div>
              )}
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-semibold text-[#E2E8F0] truncate">{s.name}</h4>
                <p className="text-xs text-[#E2E8F0]/40 truncate">{s.website_url}</p>
                {s.bio && <p className="text-xs text-[#E2E8F0]/50 mt-1 line-clamp-2">{s.bio}</p>}
                {s.images && s.images.length > 0 && <p className="text-xs text-[#E10000]/70 mt-1">{s.images.length} photos</p>}
                <div className="flex gap-2 mt-2">
                  <button onClick={() => setEditing(s)} className="text-[#E2E8F0]/60 hover:text-[#E10000]"><Pencil className="w-3.5 h-3.5" /></button>
                  <button onClick={() => handleDelete(s.id)} className="text-[#E2E8F0]/60 hover:text-red-400"><Trash2 className="w-3.5 h-3.5" /></button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}