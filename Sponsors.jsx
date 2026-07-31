import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ExternalLink, Loader2 } from 'lucide-react';
import { base44 } from '@/api/base44Client';

export default function Sponsors() {
  const [sponsors, setSponsors] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    base44.entities.Sponsor.list().then(data => {
      setSponsors(data.sort((a, b) => (a.display_order || 0) - (b.display_order || 0)));
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  return (
    <div className="pt-24 min-h-screen bg-[#0A0A0A]">
      <div className="max-w-7xl mx-auto px-6 md:px-12 py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12 text-center"
        >
          <span className="text-[10px] tracking-[0.4em] text-[#E10000] uppercase">Partners</span>
          <h1 className="font-heading font-extrabold text-5xl md:text-7xl text-[#E2E8F0] uppercase leading-[0.9] mt-2">
            Sponsors
          </h1>
        </motion.div>

        {loading ? (
          <div className="text-center py-16"><Loader2 className="w-8 h-8 animate-spin text-[#E10000] mx-auto" /></div>
        ) : sponsors.length === 0 ? (
          <p className="text-center text-[#E2E8F0]/40 text-sm py-16">No sponsors yet.</p>
        ) : (
          <div className="space-y-16">
            {sponsors.map((sponsor, i) => (
              <motion.div
                key={sponsor.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="border-t border-[#1C1010] pt-12"
              >
                <div className="grid md:grid-cols-2 gap-8 md:gap-12 items-start">
                  <div className={`text-center ${i % 2 === 1 ? 'md:order-2' : ''}`}>
                    {sponsor.logo_url ? (
                      <img src={sponsor.logo_url} alt={sponsor.name} className="w-full max-h-64 object-contain mb-6 mx-auto" />
                    ) : (
                      <h2 className="font-heading font-extrabold text-3xl md:text-4xl text-[#E2E8F0] uppercase mb-6">{sponsor.name}</h2>
                    )}
                    <a
                      href={sponsor.website_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-6 py-2 border border-[#1C1010] hover:border-[#E10000] rounded-sm text-xs uppercase tracking-wider text-[#E2E8F0] hover:text-[#E10000] transition-colors"
                    >
                      Visit Website <ExternalLink className="w-3 h-3" />
                    </a>
                    {sponsor.bio && (
                      <p className="text-base text-[#E2E8F0]/70 leading-relaxed mt-6 text-left">{sponsor.bio}</p>
                    )}
                  </div>
                  {sponsor.images && sponsor.images.length > 0 && (
                    <div className={`grid ${sponsor.images.length > 1 ? 'grid-cols-2' : 'grid-cols-1'} gap-3 ${i % 2 === 1 ? 'md:order-1' : ''}`}>
                      {sponsor.images.map((img, idx) => (
                        <div key={idx} className="aspect-square overflow-hidden rounded-sm border border-[#1C1010]">
                          <img src={img} alt={`${sponsor.name} ${idx + 1}`} className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}