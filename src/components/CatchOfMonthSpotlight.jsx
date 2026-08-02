import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Trophy } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import SmartImage from '@/components/SmartImage';

const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];

function formatMonth(ym) {
  if (!ym) return '';
  const [y, m] = ym.split('-');
  const mi = Number(m) - 1;
  if (!y || !Number.isFinite(mi) || mi < 0 || mi > 11) return '';
  return `${MONTHS[mi]} ${y}`;
}

export default function CatchOfMonthSpotlight({ photos: propPhotos } = {}) {
  const [featured, setFeatured] = useState(null);
  const [loading, setLoading] = useState(true);

  const process = (photos) => {
    const flagged = (photos || []).filter(p => p.is_catch_of_month);
    let pick = null;
    if (flagged.length > 1) {
      flagged.sort((a, b) => (b.featured_month || '').localeCompare(a.featured_month || ''));
      pick = flagged[0];
    } else if (flagged.length === 1) {
      pick = flagged[0];
    }
    // Fallback: show the most recent catch so the spotlight is always visible
    if (!pick && photos && photos.length) {
      pick = [...photos].sort((a, b) => new Date(b.created_date || 0) - new Date(a.created_date || 0))[0];
    }
    setFeatured(pick);
    setLoading(false);
  };

  useEffect(() => {
    if (propPhotos !== undefined) {
      process(propPhotos);
      return;
    }
    base44.entities.CatchGalleryPhoto.list().then(process).catch(() => setLoading(false));
  }, [propPhotos]);

  if (loading || !featured) return null;

  return (
    <motion.section
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="mb-16"
    >
      <div className="flex items-center justify-center gap-2 mb-4">
        <Trophy className="w-4 h-4 text-[#E10000]" />
        <span className="text-[10px] tracking-[0.4em] text-[#E10000] uppercase">
          Catch of the Month{featured.featured_month ? ` — ${formatMonth(featured.featured_month)}` : ''}
        </span>
      </div>
      <div className="grid md:grid-cols-2 gap-0 items-stretch rounded-sm border border-[#E10000]/30 bg-gradient-to-b from-[#1C1010]/40 to-[#0A0A0A] overflow-hidden bio-glow">
        <div className="relative aspect-[4/3] md:aspect-auto overflow-hidden">
          <SmartImage src={featured.image_url} alt={featured.caption || ''} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-r from-transparent to-[#0A0A0A]/30 md:to-[#0A0A0A]/60 pointer-events-none" />
        </div>
        <div className="p-6 md:p-10 flex flex-col justify-center">
          {featured.author && (
            <p className="text-xs text-[#E10000] uppercase tracking-[0.3em] mb-3">{featured.author}</p>
          )}
          {featured.caption && (
            <h3 className="font-heading font-extrabold text-2xl md:text-3xl text-[#E2E8F0] uppercase leading-tight mb-4">{featured.caption}</h3>
          )}
          {featured.story ? (
            <p className="text-sm md:text-base text-[#E2E8F0]/70 leading-relaxed whitespace-pre-line">{featured.story}</p>
          ) : (
            <p className="text-sm text-[#E2E8F0]/40 italic">No story added yet.</p>
          )}
        </div>
      </div>
    </motion.section>
  );
}