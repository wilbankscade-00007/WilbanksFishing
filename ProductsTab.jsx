import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Plus, Pencil, Trash2, X, Loader2 } from 'lucide-react';
import ImageUpload from './ImageUpload';
import { Input, TextArea, Toggle, Select } from './FormFields';

export default function ProductsTab() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);

  useEffect(() => { loadProducts(); }, []);

  const loadProducts = async () => {
    setLoading(true);
    try { setProducts(await base44.entities.Product.list()); } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const handleSave = async () => {
    try {
      const data = { ...editing };
      if (typeof data.sizes === 'string') data.sizes = data.sizes.split(',').map(s => s.trim()).filter(Boolean);
      if (typeof data.colors === 'string') data.colors = data.colors.split(',').map(s => s.trim()).filter(Boolean);
      if (editing.id) await base44.entities.Product.update(editing.id, data);
      else await base44.entities.Product.create(data);
      setEditing(null); loadProducts();
    } catch (e) { alert('Failed to save. Make sure you are logged in as an admin.'); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this product?')) return;
    try { await base44.entities.Product.delete(id); loadProducts(); }
    catch (e) { alert('Failed to delete.'); }
  };

  if (editing) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-heading text-xl text-[#E2E8F0] uppercase">{editing.id ? 'Edit' : 'Add'} Product</h3>
          <button onClick={() => setEditing(null)} className="text-[#E2E8F0]/50 hover:text-[#E10000]"><X className="w-5 h-5" /></button>
        </div>
        <ImageUpload value={editing.image_url} onChange={(url) => setEditing({ ...editing, image_url: url })} label="Product Image" />
        <Input label="Name" value={editing.name} onChange={(v) => setEditing({ ...editing, name: v })} />
        <Input label="Tagline" value={editing.tagline} onChange={(v) => setEditing({ ...editing, tagline: v })} />
        <Input label="Price" type="number" value={editing.price} onChange={(v) => setEditing({ ...editing, price: parseFloat(v) || 0 })} />
        <TextArea label="Description" value={editing.description} onChange={(v) => setEditing({ ...editing, description: v })} />
        <Select label="Category" value={editing.category || 'apparel'} onChange={(v) => setEditing({ ...editing, category: v })} options={[
          { value: 'apparel', label: 'Apparel' }, { value: 'headwear', label: 'Headwear' },
          { value: 'accessories', label: 'Accessories' }, { value: 'drinkware', label: 'Drinkware' }
        ]} />
        <Input label="Sizes (comma-separated)" value={Array.isArray(editing.sizes) ? editing.sizes.join(', ') : editing.sizes || ''} onChange={(v) => setEditing({ ...editing, sizes: v })} />
        <Input label="Colors (comma-separated)" value={Array.isArray(editing.colors) ? editing.colors.join(', ') : editing.colors || ''} onChange={(v) => setEditing({ ...editing, colors: v })} />
        <div className="flex gap-4">
          <Toggle label="Featured (Large Tile)" checked={editing.is_featured} onChange={(v) => setEditing({ ...editing, is_featured: v })} />
          <Toggle label="In Stock" checked={editing.in_stock !== false} onChange={(v) => setEditing({ ...editing, in_stock: v })} />
        </div>
        <button onClick={handleSave} className="px-6 py-2 bg-[#E10000] text-white text-xs uppercase tracking-wider rounded-sm hover:bg-transparent hover:text-[#E10000] hover:border hover:border-[#E10000] transition-all">Save Product</button>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-heading text-xl text-[#E2E8F0] uppercase">Products ({products.length})</h3>
        <button onClick={() => setEditing({ name: '', price: 0, category: 'apparel', image_url: '', in_stock: true, is_featured: false })} className="flex items-center gap-2 px-4 py-2 border border-[#1C1010] hover:border-[#E10000] rounded-sm text-xs uppercase tracking-wider text-[#E2E8F0] transition-colors">
          <Plus className="w-4 h-4" /> Add Product
        </button>
      </div>
      {loading ? (
        <div className="text-center py-8"><Loader2 className="w-6 h-6 animate-spin text-[#E10000] mx-auto" /></div>
      ) : (
        <div className="grid sm:grid-cols-2 gap-4">
          {products.map(p => (
            <div key={p.id} className="flex gap-3 p-3 border border-[#1C1010] rounded-sm">
              <img src={p.image_url} alt="" className="w-16 h-16 object-cover rounded-sm" />
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-semibold text-[#E2E8F0] truncate">{p.name}</h4>
                <p className="text-xs text-[#E10000] font-mono">${p.price}</p>
                <div className="flex gap-2 mt-2">
                  <button onClick={() => setEditing(p)} className="text-[#E2E8F0]/60 hover:text-[#E10000]"><Pencil className="w-3.5 h-3.5" /></button>
                  <button onClick={() => handleDelete(p.id)} className="text-[#E2E8F0]/60 hover:text-red-400"><Trash2 className="w-3.5 h-3.5" /></button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}