import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Plus, Pencil, Trash2, X, Loader2 } from 'lucide-react';
import ImageUpload from './ImageUpload';
import { Input, TextArea } from './FormFields';

export default function TipsTab() {
  const [tips, setTips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);

  useEffect(() => { loadTips(); }, []);

  const loadTips = async () => {
    setLoading(true);
    try { setTips(await base44.entities.Tip.list('-created_date')); } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const handleSave = async () => {
    try {
      if (editing.id) await base44.entities.Tip.update(editing.id, editing);
      else await base44.entities.Tip.create(editing);
      setEditing(null); loadTips();
    } catch (e) { alert('Failed to save. Make sure you are logged in as an admin.'); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this tip?')) return;
    try { await base44.entities.Tip.delete(id); loadTips(); }
    catch (e) { alert('Failed to delete.'); }
  };

  const addSection = () => {
    setEditing({ ...editing, sections: [...(editing.sections || []), { heading: '', body: '', image_url: '' }] });
  };

  const updateSection = (index, field, value) => {
    const sections = [...(editing.sections || [])];
    sections[index] = { ...sections[index], [field]: value };
    setEditing({ ...editing, sections });
  };

  const removeSection = (index) => {
    const sections = [...(editing.sections || [])];
    sections.splice(index, 1);
    setEditing({ ...editing, sections });
  };

  if (editing) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-heading text-xl text-[#E2E8F0] uppercase">{editing.id ? 'Edit' : 'Add'} Tip</h3>
          <button onClick={() => setEditing(null)} className="text-[#E2E8F0]/50 hover:text-[#E10000]"><X className="w-5 h-5" /></button>
        </div>
        <Input label="Title" value={editing.title} onChange={(v) => setEditing({ ...editing, title: v })} />
        <Input label="Category" value={editing.category} onChange={(v) => setEditing({ ...editing, category: v })} placeholder="General, Techniques, Gear, etc." />
        <TextArea label="Intro Content" value={editing.content} onChange={(v) => setEditing({ ...editing, content: v })} rows={4} />
        <ImageUpload value={editing.image_url} onChange={(url) => setEditing({ ...editing, image_url: url })} label="Main Image (optional)" />

        <div className="pt-4 border-t border-[#1C1010]">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm tracking-wider uppercase text-[#E2E8F0]/70">Sections</h4>
            <button onClick={addSection} className="flex items-center gap-1 px-3 py-1 border border-[#1C1010] hover:border-[#E10000] rounded-sm text-xs uppercase tracking-wider text-[#E2E8F0] transition-colors">
              <Plus className="w-3 h-3" /> Add Section
            </button>
          </div>
          <div className="space-y-4">
            {(editing.sections || []).map((section, index) => (
              <div key={index} className="p-4 border border-[#1C1010] rounded-sm space-y-3 relative">
                <button onClick={() => removeSection(index)} className="absolute top-3 right-3 text-[#E2E8F0]/50 hover:text-red-400">
                  <X className="w-4 h-4" />
                </button>
                <span className="text-[10px] tracking-[0.3em] text-[#E10000] uppercase">Section {index + 1}</span>
                <Input label="Heading" value={section.heading} onChange={(v) => updateSection(index, 'heading', v)} />
                <TextArea label="Body" value={section.body} onChange={(v) => updateSection(index, 'body', v)} rows={4} />
                <ImageUpload value={section.image_url} onChange={(url) => updateSection(index, 'image_url', url)} label="Section Image (optional)" />
              </div>
            ))}
          </div>
        </div>

        <button onClick={handleSave} className="px-6 py-2 bg-[#E10000] text-white text-xs uppercase tracking-wider rounded-sm hover:bg-transparent hover:text-[#E10000] hover:border hover:border-[#E10000] transition-all">Save Tip</button>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-heading text-xl text-[#E2E8F0] uppercase">Tips ({tips.length})</h3>
        <button onClick={() => setEditing({ title: '', content: '', category: 'General' })} className="flex items-center gap-2 px-4 py-2 border border-[#1C1010] hover:border-[#E10000] rounded-sm text-xs uppercase tracking-wider text-[#E2E8F0] transition-colors">
          <Plus className="w-4 h-4" /> Add Tip
        </button>
      </div>
      {loading ? (
        <div className="text-center py-8"><Loader2 className="w-6 h-6 animate-spin text-[#E10000] mx-auto" /></div>
      ) : (
        <div className="space-y-3">
          {tips.map(t => (
            <div key={t.id} className="flex gap-3 p-3 border border-[#1C1010] rounded-sm">
              {t.image_url && <img src={t.image_url} alt="" className="w-12 h-12 object-cover rounded-sm" />}
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-semibold text-[#E2E8F0] truncate">{t.title}</h4>
                <p className="text-xs text-[#E2E8F0]/40 truncate">{t.category} · {(t.sections || []).length} sections</p>
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