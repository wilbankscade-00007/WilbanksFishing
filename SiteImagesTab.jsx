import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Loader2 } from 'lucide-react';
import ImageUpload from './ImageUpload';

export default function SiteImagesTab() {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(null);

  useEffect(() => {
    base44.entities.SiteImage.list().then(data => {
      setImages(data);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const handleChange = (id, url) => {
    setImages(prev => prev.map(img => img.id === id ? { ...img, image_url: url } : img));
  };

  const handleSave = async (id) => {
    const img = images.find(i => i.id === id);
    if (!img) return;
    setSaving(id);
    try {
      await base44.entities.SiteImage.update(id, { image_url: img.image_url });
    } catch (e) {
      alert('Failed to save. Make sure you are logged in as an admin.');
    } finally {
      setSaving(null);
    }
  };

  if (loading) {
    return <div className="text-center py-8"><Loader2 className="w-6 h-6 animate-spin text-[#E10000] mx-auto" /></div>;
  }

  return (
    <div>
      <h3 className="font-heading text-xl text-[#E2E8F0] uppercase mb-6">Background & Page Photos</h3>
      <div className="grid sm:grid-cols-2 gap-6">
        {images.map(img => (
          <div key={img.id} className="p-4 border border-[#1C1010] rounded-sm space-y-3">
            <div>
              <h4 className="text-sm font-semibold text-[#E2E8F0]">{img.label}</h4>
              <p className="text-xs text-[#E2E8F0]/40">{img.key}</p>
            </div>
            {img.image_url && (
              <img src={img.image_url} alt={img.label} className="w-full h-32 object-cover rounded-sm border border-[#1C1010]" />
            )}
            <ImageUpload value={img.image_url} onChange={(url) => handleChange(img.id, url)} />
            <button
              onClick={() => handleSave(img.id)}
              disabled={saving === img.id}
              className="px-4 py-2 bg-[#E10000] text-white text-xs uppercase tracking-wider rounded-sm hover:bg-transparent hover:text-[#E10000] hover:border hover:border-[#E10000] transition-all disabled:opacity-50"
            >
              {saving === img.id ? 'Saving...' : 'Save'}
            </button>
          </div>
        ))}
      </div>
      {images.length === 0 && (
        <p className="text-[#E2E8F0]/40 text-center py-12 text-sm">No site images configured yet.</p>
      )}
    </div>
  );
}