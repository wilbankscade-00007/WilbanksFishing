import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { motion } from 'framer-motion';
import GearList from '@/components/GearList';

export default function Tips() {
  const [tips, setTips] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    base44.entities.Tip.list('-created_date').then(data => {
      setTips(data);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-[#0A0A0A] pt-24">
      <div className="max-w-4xl mx-auto px-6 md:px-12 py-12">
        <Link to="/" className="inline-flex items-center gap-2 text-xs tracking-[0.3em] uppercase text-[#E2E8F0]/50 hover:text-[#E10000] transition-colors mb-8">
          <ArrowLeft className="w-4 h-4" /> Back to Home
        </Link>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-12">
          <span className="text-[10px] tracking-[0.4em] text-[#E10000] uppercase">Knowledge Base</span>
          <h1 className="font-heading font-extrabold text-4xl md:text-7xl text-[#E2E8F0] uppercase leading-[0.9] mt-2">
            Tips & Tricks
          </h1>
        </motion.div>

        <GearList />

        {loading ? (
          <div className="space-y-8">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-64 bg-[#1C1010]/50 rounded-sm animate-pulse" />
            ))}
          </div>
        ) : tips.length === 0 ? (
          <p className="text-[#E2E8F0]/40 text-center py-20">No tips posted yet. Check back soon!</p>
        ) : (
          <div className="space-y-12">
            {tips.map((tip, i) => (
              <motion.article
                key={tip.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="border border-[#1C1010] rounded-sm overflow-hidden hover:border-[#E10000]/50 transition-colors"
              >
                {tip.image_url && (
                  <div className="aspect-[2/1] overflow-hidden">
                    <img src={tip.image_url} alt={tip.title} className="w-full h-full object-cover" />
                  </div>
                )}
                <div className="p-6 md:p-10 space-y-4">
                  {tip.category && (
                    <span className="inline-block text-[10px] tracking-[0.3em] text-[#E10000] uppercase glass-light px-3 py-1 rounded-sm">{tip.category}</span>
                  )}
                  <h2 className="font-heading font-bold text-2xl md:text-4xl text-[#E2E8F0] uppercase">{tip.title}</h2>
                  <p className="text-sm md:text-base text-[#E2E8F0]/70 leading-relaxed whitespace-pre-wrap">{tip.content}</p>

                  {(tip.sections || []).map((section, si) => (
                    <div key={si} className="pt-6 border-t border-[#1C1010] space-y-3">
                      {section.heading && (
                        <h3 className="font-heading font-bold text-lg md:text-2xl text-[#E10000] uppercase">{section.heading}</h3>
                      )}
                      {section.image_url && (
                        <div className="rounded-sm overflow-hidden border border-[#1C1010]">
                          <img src={section.image_url} alt={section.heading || ''} className="w-full max-h-[400px] object-cover" />
                        </div>
                      )}
                      {section.body && (
                        <p className="text-sm md:text-base text-[#E2E8F0]/60 leading-relaxed whitespace-pre-wrap">{section.body}</p>
                      )}
                    </div>
                  ))}
                </div>
              </motion.article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}