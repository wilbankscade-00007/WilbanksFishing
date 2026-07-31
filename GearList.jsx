import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Package, ExternalLink } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import SmartImage from '@/components/SmartImage';

export default function GearList() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    base44.entities.GearItem.list().then(data => {
      setItems((data || []).sort((a, b) => (a.display_order || 0) - (b.display_order || 0)));
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-48 bg-[#1C1010]/50 rounded-sm animate-pulse" />
        ))}
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="mb-12"
      >
        <div className="flex items-center gap-3 mb-6">
          <Package className="w-5 h-5 text-[#E10000]" />
          <div>
            <span className="text-[10px] tracking-[0.4em] text-[#E10000] uppercase block">The Stuff I Use</span>
            <h2 className="font-heading font-bold text-2xl md:text-4xl text-[#E2E8F0] uppercase leading-tight">My Gear</h2>
          </div>
        </div>
        <p className="text-[#E2E8F0]/40 text-sm border border-[#1C1010] rounded-sm p-8 text-center">Gear list coming soon. Check back shortly!</p>
      </motion.section>
    );
  }

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="mb-12"
    >
      <div className="flex items-center gap-3 mb-6">
        <Package className="w-5 h-5 text-[#E10000]" />
        <div>
          <span className="text-[10px] tracking-[0.4em] text-[#E10000] uppercase block">The Stuff I Use</span>
          <h2 className="font-heading font-bold text-2xl md:text-4xl text-[#E2E8F0] uppercase leading-tight">My Gear</h2>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {items.map((item, i) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.04 }}
            className="group border border-[#1C1010] rounded-sm overflow-hidden hover:border-[#E10000] transition-all hover:-translate-y-1 hover:shadow-[0_10px_24px_rgba(225,0,0,0.35)] flex flex-col"
          >
            {item.image_url ? (
              <div className="aspect-square overflow-hidden bg-[#0A0A0A]">
                <SmartImage src={item.image_url} alt={item.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
              </div>
            ) : (
              <div className="aspect-square bg-[#1C1010]/40 flex items-center justify-center">
                <Package className="w-10 h-10 text-[#1C1010]" />
              </div>
            )}
            <div className="p-4 flex flex-col flex-1">
              {item.category && (
                <span className="text-[10px] tracking-[0.3em] text-[#E10000] uppercase mb-1">{item.category}</span>
              )}
              <h3 className="font-heading font-bold text-base md:text-lg text-[#E2E8F0] uppercase leading-tight">{item.name}</h3>
              {item.description && (
                <p className="text-xs text-[#E2E8F0]/60 leading-relaxed mt-2 line-clamp-3">{item.description}</p>
              )}
              {item.link_url && (
                <a
                  href={item.link_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-3 inline-flex items-center gap-1 text-[11px] uppercase tracking-wider text-[#E10000] hover:underline"
                >
                  View <ExternalLink className="w-3 h-3" />
                </a>
              )}
            </div>
          </motion.div>
        ))}
      </div>
    </motion.section>
  );
}