import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Sparkles, ArrowRight } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { fetchWhatsNewFeed } from '@/lib/whatsNewFeed';
import { Link } from 'react-router-dom';

export default function WhatsNewModal() {
  const [items, setItems] = useState([]);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const checkFresh = async () => {
      try {
        const all = await fetchWhatsNewFeed();
        const lastVisit = localStorage.getItem('wf_last_visit');
        // First visit: baseline to the newest item so existing content doesn't flood the popup
        const lastDate = lastVisit ? new Date(lastVisit) : (all.length ? new Date(all[0].date) : new Date(0));
        const fresh = all.filter(d => new Date(d.date) > lastDate).slice(0, 10);
        setItems(fresh);
        localStorage.setItem('wf_last_visit', new Date().toISOString());
        if (fresh.length > 0) setOpen(true);
      } catch (e) {
        localStorage.setItem('wf_last_visit', new Date().toISOString());
      }
    };

    checkFresh();
    // Re-check when the user returns to the tab so newly added content re-triggers the popup
    const onVisible = () => { if (document.visibilityState === 'visible') checkFresh(); };
    document.addEventListener('visibilitychange', onVisible);
    return () => document.removeEventListener('visibilitychange', onVisible);
  }, []);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-[#0A0A0A]/80 backdrop-blur-sm"
          onClick={() => setOpen(false)}
        >
          <motion.div
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
            className="relative w-full max-w-lg glass border border-[#E10000]/30 rounded-sm shadow-2xl max-h-[85vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 glass border-b border-[#1C1010] p-5 flex items-center justify-between">
              <div>
                <span className="text-[10px] tracking-[0.4em] text-[#E10000] uppercase">Fresh Off the Water</span>
                <h3 className="font-heading font-extrabold text-2xl text-[#E2E8F0] uppercase mt-1">What's New</h3>
              </div>
              <button onClick={() => setOpen(false)} className="text-[#E2E8F0]/50 hover:text-[#E10000] transition-colors">
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="divide-y divide-[#1C1010]">
              {items.map((it, i) => {
                const Icon = it.icon || Sparkles;
                const Wrapper = it.to ? Link : (it.url ? 'a' : 'div');
                const wrapperProps = it.to
                  ? { to: it.to }
                  : it.url
                    ? { href: it.url, target: '_blank', rel: 'noopener noreferrer' }
                    : {};
                return (
                  <Wrapper
                    key={`${it.type}-${i}`}
                    {...wrapperProps}
                    className="flex items-start gap-4 p-5 hover:bg-[#1C1010]/30 transition-colors group"
                  >
                    <div className="w-10 h-10 rounded-full bg-[#E10000]/10 flex items-center justify-center flex-shrink-0">
                      <Icon className="w-5 h-5 text-[#E10000]" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-sm text-[#E2E8F0]">{it.title}</p>
                      <p className="text-xs text-[#E2E8F0]/60 mt-1 leading-relaxed">{it.desc}</p>
                      <p className="text-[10px] text-[#E2E8F0]/40 mt-2">{formatDistanceToNow(new Date(it.date), { addSuffix: true })}</p>
                    </div>
                    {(it.to || it.url) && <ArrowRight className="w-4 h-4 text-[#E2E8F0]/30 group-hover:text-[#E10000] transition-colors flex-shrink-0 mt-1" />}
                  </Wrapper>
                );
              })}
            </div>
            <div className="p-4 border-t border-[#1C1010]">
              <button onClick={() => setOpen(false)} className="w-full py-2 text-xs uppercase tracking-wider text-[#E2E8F0]/60 hover:text-[#E10000] transition-colors">
                Got it
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}