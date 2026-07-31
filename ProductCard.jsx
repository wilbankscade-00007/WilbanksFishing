import React from 'react';
import { motion } from 'framer-motion';
import { Plus } from 'lucide-react';
import SmartImage from './SmartImage';

export default function ProductCard({ product, onSelect, featured }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      whileHover={{ y: -4 }}
      onClick={() => onSelect(product)}
      className={`group relative cursor-pointer overflow-hidden rounded-sm border border-[#1C1010] bg-[#0A0A0A] ${
        featured ? 'h-full min-h-[500px]' : 'h-full min-h-[280px]'
      }`}
    >
      <SmartImage
        src={product.image_url}
        alt={product.name}
        eager={featured}
        className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A] via-[#0A0A0A]/20 to-transparent" />

      <div className="absolute top-4 left-4">
        <span className="text-[10px] tracking-[0.3em] text-[#E10000] uppercase glass-light px-3 py-1 rounded-sm">
          {product.category}
        </span>
      </div>

      <div className="absolute bottom-0 left-0 right-0 p-4 md:p-5 z-10">
        <div className="flex items-end justify-between gap-2">
          <div className="flex-1 min-w-0">
            <h3 className={`font-heading font-bold uppercase text-[#E2E8F0] leading-tight ${featured ? 'text-2xl md:text-3xl' : 'text-lg'}`}>
              {product.name}
            </h3>
            <p className="text-xs text-[#E2E8F0]/50 mt-1 truncate">{product.tagline}</p>
          </div>
          <span className="font-mono text-[#E10000] text-sm md:text-base whitespace-nowrap">
            ${product.price}
          </span>
        </div>

        <div className="overflow-hidden max-h-0 group-hover:max-h-32 transition-all duration-400">
          <div className="pt-3 mt-3 border-t border-[#E10000]/20 space-y-1">
            {(product.specs || []).slice(0, 3).map((spec, i) => (
              <div key={i} className="flex justify-between text-[10px] text-[#E2E8F0]/60">
                <span className="tracking-wider uppercase">{spec.label}</span>
                <span className="text-[#E2E8F0]/80 font-mono">{spec.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="absolute top-4 right-4 w-9 h-9 rounded-full bg-[#E10000]/90 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bio-glow">
        <Plus className="w-4 h-4 text-white" />
      </div>
    </motion.div>
  );
}