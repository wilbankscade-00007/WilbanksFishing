import { Video, Package, Lightbulb, Camera, Film, Sparkles, Users } from 'lucide-react';
import { base44 } from '@/api/base44Client';

const ICON_MAP = { video: Video, merch: Package, tip: Lightbulb, bts: Film, gallery: Camera, other: Sparkles };

// Builds a single, time-sorted feed of everything recently added/changed on the site
// so the "What's New" popup and notification bell reflect every admin update automatically.
// Results are cached briefly so multiple consumers (notification bell, marquee, modal)
// share one set of API calls instead of each firing their own burst.
let _cache = null;
let _cacheTime = 0;
const CACHE_TTL = 30000;

export async function fetchWhatsNewFeed() {
  if (_cache && Date.now() - _cacheTime < CACHE_TTL) return _cache;

  const [videos, products, tips, sponsors, bts, catchPhotos, galleryPhotos, whatsNew] = await Promise.all([
    base44.entities.Video.list('-created_date', 5).catch(() => []),
    base44.entities.Product.list('-created_date', 5).catch(() => []),
    base44.entities.Tip.list('-created_date', 3).catch(() => []),
    base44.entities.Sponsor.list('-created_date', 3).catch(() => []),
    base44.entities.BehindTheScenes.list('-created_date', 3).catch(() => []),
    base44.entities.CatchPhoto.list('-created_date', 4).catch(() => []),
    base44.entities.CatchGalleryPhoto.list('-created_date', 4).catch(() => []),
    base44.entities.WhatsNew.list('-created_date', 5).catch(() => []),
  ]);

  const all = [
    ...videos.map(v => ({ type: 'New Video', title: v.title, desc: '', date: v.created_date, icon: Video, url: v.youtube_url })),
    ...products.map(p => ({ type: 'New Merch', title: p.name, desc: p.tagline || '', date: p.created_date, icon: Package, to: '/Shop' })),
    ...tips.map(t => ({ type: 'New Tip', title: t.title, desc: '', date: t.created_date, icon: Lightbulb, to: '/Tips' })),
    ...sponsors.map(s => ({ type: 'New Sponsor', title: s.name, desc: '', date: s.created_date, icon: Users, url: s.website_url })),
    ...bts.map(b => ({ type: 'Behind the Scenes', title: b.title, desc: b.description || '', date: b.created_date, icon: Film, to: '/BehindTheScenes' })),
    ...catchPhotos.map(c => ({ type: 'New Catch', title: c.caption || 'Catch Photo', desc: c.author ? `by ${c.author}` : '', date: c.created_date, icon: Camera, to: '/CatchGallery' })),
    ...galleryPhotos.map(g => ({ type: 'Gallery Update', title: g.caption || 'Gallery Photo', desc: g.author ? `by ${g.author}` : '', date: g.created_date, icon: Camera, to: '/CatchGallery' })),
    ...whatsNew.map(w => ({ type: "What's New", title: w.title, desc: w.description || '', date: w.created_date, icon: ICON_MAP[w.icon] || Sparkles, url: w.link_url })),
  ]
    .filter(n => n.date)
    .sort((a, b) => new Date(b.date) - new Date(a.date));

  _cache = all;
  _cacheTime = Date.now();
  return all;
}