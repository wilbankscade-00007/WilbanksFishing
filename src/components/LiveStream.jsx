import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ExternalLink, Eye, Clock } from 'lucide-react';
import { base44 } from '@/api/base44Client';

function fmtDuration(ms) {
  if (!ms || ms < 0) return '';
  const s = Math.floor(ms / 1000);
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
  return `${m}:${String(sec).padStart(2, '0')}`;
}

export default function LiveStream() {
  const [live, setLive] = useState(null);
  const [elapsed, setElapsed] = useState('');

  useEffect(() => {
    const check = async () => {
      try {
        const res = await base44.functions.invoke('check-youtube-live', {});
        const d = res?.data || res;
        if (d) setLive(d);
      } catch (_) {}
    };
    check();
    const id = setInterval(check, 15000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    if (!live?.is_live || !live.started_at) { setElapsed(''); return; }
    const tick = () => setElapsed(fmtDuration(Date.now() - new Date(live.started_at).getTime()));
    tick();
    const t = setInterval(tick, 1000);
    return () => clearInterval(t);
  }, [live]);

  return (
    <AnimatePresence>
      {live?.is_live && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          className="mb-16 max-w-4xl mx-auto text-center"
        >
          <div className="inline-flex items-center gap-2 mb-4">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#E10000] opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#E10000]" />
            </span>
            <span className="text-[10px] tracking-[0.4em] text-[#E10000] uppercase font-bold">Live Now</span>
          </div>
          <div className="relative aspect-video overflow-hidden rounded-sm border border-[#E10000]/50 bio-glow">
            <iframe
              src={`https://www.youtube.com/embed/${live.video_id}?autoplay=1&mute=1`}
              title={live.title}
              className="w-full h-full"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
            />
          </div>
          <h3 className="font-bold text-lg text-[#E2E8F0] mt-4">{live.title}</h3>
          <div className="flex items-center justify-center gap-4 mt-2 text-xs text-[#E2E8F0]/60">
            {live.concurrent_viewers != null && (
              <span className="inline-flex items-center gap-1.5 text-[#E10000] font-semibold">
                <Eye className="w-3.5 h-3.5" /> {live.concurrent_viewers.toLocaleString()} watching
              </span>
            )}
            {elapsed && (
              <span className="inline-flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" /> {elapsed}
              </span>
            )}
          </div>
          <a
            href={live.watch_url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 mt-3 text-xs tracking-[0.3em] uppercase text-[#E10000] hover:underline"
          >
            Watch on YouTube <ExternalLink className="w-3 h-3" />
          </a>
        </motion.div>
      )}
    </AnimatePresence>
  );
}