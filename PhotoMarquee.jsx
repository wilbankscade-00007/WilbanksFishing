import React from 'react';
import { motion } from 'framer-motion';
import SmartImage from './SmartImage';

function shuffle(arr, seed) {
  const a = [...arr];
  let s = seed;
  for (let i = a.length - 1; i > 0; i--) {
    s = (s * 9301 + 49297) % 233280;
    const j = Math.floor((s / 233280) * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export default function PhotoMarquee({ photos = [], height = 'h-32 md:h-48', speed = 30, reverse = false, seed = 1 }) {
  if (!photos || photos.length === 0) return null;
  const shuffled = shuffle(photos, seed);
  const doubled = [...shuffled, ...shuffled];

  return (
    <div className={`relative w-full overflow-hidden ${height} border-y border-[#E10000]/30`} style={{ boxShadow: '0 0 30px hsl(0 100% 44% / 0.25), inset 0 0 20px hsl(0 100% 44% / 0.1)' }}>
      <div className="absolute inset-0 z-10 pointer-events-none" style={{ background: 'linear-gradient(90deg, hsl(0 0% 4%) 0%, transparent 8%, transparent 92%, hsl(0 0% 4%) 100%)' }} />
      <motion.div
        className="flex gap-4 h-full absolute left-0"
        animate={{ x: reverse ? ['-50%', '0%'] : ['0%', '-50%'] }}
        transition={{ duration: speed, repeat: Infinity, ease: 'linear' }}
      >
        {doubled.map((photo, i) => (
          <div key={i} className="relative flex-shrink-0 h-full aspect-[4/3] overflow-hidden rounded-sm border border-[#E10000]/40 group shadow-[0_0_15px_hsl(0_100%_44%/0.3)]">
            <SmartImage src={photo.url} alt={photo.caption || ''} className="h-full w-full object-cover" />
            {photo.caption && (
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-[#0A0A0A]/90 to-transparent p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <p className="text-xs text-[#E2E8F0] truncate">{photo.caption}</p>
              </div>
            )}
          </div>
        ))}
      </motion.div>
    </div>
  );
}