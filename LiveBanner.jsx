import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Radio, Play, X, ExternalLink } from 'lucide-react';
import { base44 } from '@/api/base44Client';

export default function LiveBanner() {
  const [live, setLive] = useState(null);
  const [player, setPlayer] = useState(false);

  useEffect(() => {
    const check = async () => {
      try {
        const res = await base44.functions.invoke('check-youtube-live', {});
        const d = res?.data || res;
        if (d) setLive(d);
      } catch (_) {}
    };
    check();
    const id = setInterval(check, 10000);
    return () => clearInterval(id);
  }, []);

  if (!live || !live.is_live) return null;

  return (
    <>
      <motion.div
        initial={{ y: -60, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="sticky top-0 z-[60] bg-[#E10000] text-white"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2.5 flex items-center gap-3 flex-wrap">
          <span className="inline-flex items-center gap-2 font-bold text-sm uppercase tracking-wider whitespace-nowrap">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-white" />
            </span>
            <Radio className="w-4 h-4" /> Live Now
          </span>
          <span className="text-sm text-white/90 truncate flex-1 min-w-0 hidden sm:block">{live.title}</span>
          {live.concurrent_viewers != null && (
            <span className="inline-flex items-center gap-1 text-xs font-semibold bg-black/25 px-2 py-1 rounded-sm whitespace-nowrap">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-white" />
              </span>
              {live.concurrent_viewers.toLocaleString()}
            </span>
          )}
          <div className="flex items-center gap-2 ml-auto">
            <button
              onClick={() => setPlayer(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-black/30 hover:bg-black/50 rounded-sm text-xs font-bold uppercase tracking-wider transition-colors"
            >
              <Play className="w-3.5 h-3.5" /> Watch Here
            </button>
            <a
              href={live.watch_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white text-[#E10000] rounded-sm text-xs font-bold uppercase tracking-wider hover:bg-white/90 transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5" /> YouTube
            </a>
          </div>
        </div>
      </motion.div>

      <AnimatePresence>
        {player && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/90 flex items-center justify-center p-4"
            onClick={() => setPlayer(false)}
          >
            <button
              className="absolute top-5 right-5 text-white/70 hover:text-white"
              onClick={() => setPlayer(false)}
            >
              <X className="w-7 h-7" />
            </button>
            <div className="w-full max-w-4xl aspect-video" onClick={(e) => e.stopPropagation()}>
              <iframe
                src={`https://www.youtube.com/embed/${live.video_id}?autoplay=1&mute=1`}
                title="Live stream"
                className="w-full h-full rounded-sm border border-[#E10000]/40"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}