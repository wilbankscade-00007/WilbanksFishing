import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Package, Lightbulb, Film, Users, Camera, Youtube, Sparkles, Globe, Heart } from 'lucide-react';
import { fetchWhatsNewFeed } from '@/lib/whatsNewFeed';
import { Link } from 'react-router-dom';

const CATEGORIES = {
  website: { label: 'Site', icon: Globe, color: 'text-[#E10000]', tag: 'bg-[#E10000]/15 text-[#E10000] border-[#E10000]/40' },
  channel: { label: 'Channel', icon: Youtube, color: 'text-[#E2E8F0]', tag: 'bg-[#E2E8F0]/10 text-[#E2E8F0] border-[#E2E8F0]/30' },
  me: { label: 'WilbanksFishing', icon: Heart, color: 'text-[#FFD700]', tag: 'bg-[#FFD700]/10 text-[#FFD700] border-[#FFD700]/40' },
};

function timeAgo(iso) {
  if (!iso) return '';
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 60) return m <= 1 ? 'now' : `${m}m`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h`;
  const d = Math.floor(h / 24);
  if (d < 30) return `${d}d`;
  return new Date(iso).toLocaleDateString();
}

export default function WhatsNewMarquee({ height = 'h-28 md:h-40' }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        // Reuse the shared, cached "What's New" feed so the marquee and the
        // notification bell share one set of API calls instead of duplicating them.
        const TYPE_MAP = {
          'New Video': { cat: 'channel', icon: Youtube, kind: 'New Video' },
          "What's New": { cat: 'me', icon: Sparkles, kind: 'from Cade' },
          'New Merch': { cat: 'website', icon: Package, kind: 'New Merch' },
          'New Tip': { cat: 'website', icon: Lightbulb, kind: 'New Tip' },
          'Behind the Scenes': { cat: 'website', icon: Film, kind: 'BTS' },
          'New Sponsor': { cat: 'website', icon: Users, kind: 'Sponsor' },
          'Gallery Update': { cat: 'website', icon: Camera, kind: 'Gallery' },
        };

        const feed = await fetchWhatsNewFeed();
        const all = feed
          .filter(n => TYPE_MAP[n.type])
          .map(n => {
            const m = TYPE_MAP[n.type];
            return { cat: m.cat, icon: m.icon, kind: m.kind, title: n.title, to: n.to, url: n.url, date: n.date };
          })
          .slice(0, 20);

        setItems(all);
      } catch (e) {
        console.error('WhatsNewMarquee load error', e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (!loading && items.length === 0) return null;
  const doubled = items.length > 0 ? [...items, ...items] : [];

  return (
    <div className={`relative w-full overflow-hidden ${height} border-y border-[#E10000]/30`} style={{ boxShadow: '0 0 30px hsl(0 100% 44% / 0.25), inset 0 0 20px hsl(0 100% 44% / 0.1)' }}>
      <div className="absolute inset-0 z-10 pointer-events-none" style={{ background: 'linear-gradient(90deg, hsl(0 0% 4%) 0%, transparent 8%, transparent 92%, hsl(0 0% 4%) 100%)' }} />
      {loading ? (
        <div className="flex items-center h-full px-4 gap-3">
          {[...Array(5)].map((_, i) => <div key={i} className="flex-shrink-0 w-56 h-full bg-[#1C1010]/50 rounded-sm animate-pulse" />)}
        </div>
      ) : (
        <motion.div
          className="flex h-full absolute left-0 items-center w-max"
          animate={{ x: ['0%', '-50%'] }}
          transition={{ duration: Math.max(30, items.length * 3), repeat: Infinity, ease: 'linear' }}
        >
          {doubled.map((item, i) => {
            const c = CATEGORIES[item.cat];
            const Icon = item.icon;
            const Tag = item.to ? Link : (item.url ? 'a' : 'div');
            const tagProps = item.to ? { to: item.to } : (item.url ? { href: item.url, target: '_blank', rel: 'noopener noreferrer' } : {});
            return (
              <Tag
                key={i}
                {...tagProps}
                className={`group flex-shrink-0 w-56 mr-3 h-[88%] flex flex-col justify-between px-4 py-3 rounded-sm border ${c.tag.split(' ').find(t => t.startsWith('border'))} bg-gradient-to-b from-[#1C1010]/50 to-[#0A0A0A]`}
              >
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full border ${c.tag} text-[8px] uppercase tracking-[0.15em]`}>
                      <Icon className="w-2.5 h-2.5" /> {c.label}
                    </span>
                    <span className={`text-[8px] uppercase tracking-[0.15em] ${c.color}`}>{item.kind}</span>
                  </div>
                  <h3 className="font-bold text-xs text-[#E2E8F0] leading-tight mt-2 line-clamp-3">{item.title}</h3>
                </div>
                <p className="text-[8px] text-[#E2E8F0]/30 tracking-[0.15em] uppercase">{timeAgo(item.date)}</p>
              </Tag>
            );
          })}
        </motion.div>
      )}
    </div>
  );
}