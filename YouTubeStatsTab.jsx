import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Plus, Pencil, Trash2, X, Loader2, RefreshCw } from 'lucide-react';
import { Input } from './FormFields';

export default function YouTubeStatsTab() {
  const [stats, setStats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);

  useEffect(() => { loadStats(); }, []);

  const loadStats = async () => {
    setLoading(true);
    try { setStats(await base44.entities.YouTubeStats.list()); } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const [syncing, setSyncing] = useState(false);
  const handleSync = async () => {
    setSyncing(true);
    try {
      await base44.functions.invoke('sync-youtube-stats', { force: true });
      await loadStats();
    } catch (e) {
      alert('Sync failed. Check the YouTube API key.');
    } finally { setSyncing(false); }
  };

  const handleSave = async () => {
    try {
      if (editing.id) await base44.entities.YouTubeStats.update(editing.id, editing);
      else await base44.entities.YouTubeStats.create(editing);
      setEditing(null); loadStats();
    } catch (e) { alert('Failed to save.'); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this stats record?')) return;
    try { await base44.entities.YouTubeStats.delete(id); loadStats(); }
    catch (e) { alert('Failed to delete.'); }
  };

  const fmt = (n) => Number(n || 0).toLocaleString();

  if (editing) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-heading text-xl text-[#E2E8F0] uppercase">{editing.id ? 'Edit' : 'Add'} Channel Stats</h3>
          <button onClick={() => setEditing(null)} className="text-[#E2E8F0]/50 hover:text-[#E10000]"><X className="w-5 h-5" /></button>
        </div>
        <Input label="Subscribers" type="number" value={editing.subscribers} onChange={(v) => setEditing({ ...editing, subscribers: Number(v) })} />
        <Input label="Total Views" type="number" value={editing.total_views} onChange={(v) => setEditing({ ...editing, total_views: Number(v) })} />
        <Input label="Video Count" type="number" value={editing.video_count} onChange={(v) => setEditing({ ...editing, video_count: Number(v) })} />
        <Input label="Latest Video Title" value={editing.latest_video_title} onChange={(v) => setEditing({ ...editing, latest_video_title: v })} />
        <Input label="Latest Video URL" value={editing.latest_video_url} onChange={(v) => setEditing({ ...editing, latest_video_url: v })} />
        <Input label="Display Order" type="number" value={editing.display_order} onChange={(v) => setEditing({ ...editing, display_order: Number(v) })} />
        <button onClick={handleSave} className="px-6 py-2 bg-[#E10000] text-white text-xs uppercase tracking-wider rounded-sm hover:bg-transparent hover:text-[#E10000] hover:border hover:border-[#E10000] transition-all">Save Stats</button>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-heading text-xl text-[#E2E8F0] uppercase">YouTube Stats ({stats.length})</h3>
        <div className="flex items-center gap-2">
          <button onClick={handleSync} disabled={syncing} className="flex items-center gap-2 px-4 py-2 bg-[#E10000] text-white rounded-sm text-xs uppercase tracking-wider hover:bg-transparent hover:text-[#E10000] hover:border hover:border-[#E10000] transition-all disabled:opacity-50">
            <RefreshCw className={`w-4 h-4 ${syncing ? 'animate-spin' : ''}`} /> Sync Now
          </button>
          <button onClick={() => setEditing({ subscribers: 0, total_views: 0, video_count: 0, display_order: 0 })} className="flex items-center gap-2 px-4 py-2 border border-[#1C1010] hover:border-[#E10000] rounded-sm text-xs uppercase tracking-wider text-[#E2E8F0] transition-colors">
            <Plus className="w-4 h-4" /> Add Stats
          </button>
        </div>
      </div>
      <p className="text-xs text-[#E2E8F0]/40 mb-6">Shown as a compact widget on the home page and a larger stat row on the YouTube page. Keep one active record.</p>
      {loading ? (
        <div className="text-center py-8"><Loader2 className="w-6 h-6 animate-spin text-[#E10000] mx-auto" /></div>
      ) : stats.length === 0 ? (
        <p className="text-center text-[#E2E8F0]/40 text-sm py-8">No stats yet. Add your channel numbers.</p>
      ) : (
        <div className="space-y-3">
          {stats.map(s => (
            <div key={s.id} className="flex items-center justify-between p-4 border border-[#1C1010] rounded-sm">
              <div className="grid grid-cols-3 gap-6">
                <div><p className="text-[10px] uppercase tracking-wider text-[#E2E8F0]/40">Subs</p><p className="font-bold text-[#E2E8F0]">{fmt(s.subscribers)}</p></div>
                <div><p className="text-[10px] uppercase tracking-wider text-[#E2E8F0]/40">Views</p><p className="font-bold text-[#E2E8F0]">{fmt(s.total_views)}</p></div>
                <div><p className="text-[10px] uppercase tracking-wider text-[#E2E8F0]/40">Videos</p><p className="font-bold text-[#E2E8F0]">{fmt(s.video_count)}</p></div>
              </div>
              <div className="flex gap-2">
                <button onClick={() => setEditing(s)} className="text-[#E2E8F0]/80 hover:text-[#E10000]"><Pencil className="w-4 h-4" /></button>
                <button onClick={() => handleDelete(s.id)} className="text-[#E2E8F0]/80 hover:text-red-400"><Trash2 className="w-4 h-4" /></button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}