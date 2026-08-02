import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ExternalLink } from 'lucide-react';
import { base44 } from '@/api/base44Client';

export default function SponsorSection() {
  const [sponsors, setSponsors] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    base44.entities.Sponsor.list().then(data => {
      setSponsors(data.sort((a, b) => (a.display_order || 0) - (b.display_order || 0)));
      setLoading(false);
    });
  }, []);

  return (
    <section id="sponsors" className="relative py-20 md:py-28 border-t border-[#1C1010]">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-10 text-center"
        >
          <span className="text-[10px] tracking-[0.4em] text-[#E10000] uppercase">Partners</span>
          <h2 className="font-heading font-extrabold text-4xl md:text-6xl text-[#E2E8F0] uppercase leading-[0.9] mt-2">
            Sponsors
          </h2>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {loading ? (
            [...Array(4)].map((_, i) => (
              <div key={i} className="h-24 bg-[#1C1010]/50 rounded-sm animate-pulse" />
            ))
          ) : sponsors.length === 0 ? (
            <p className="col-span-full text-center text-[#E2E8F0]/40 text-sm">No sponsors yet.</p>
          ) : (
            sponsors.map(sponsor => (
              <motion.a
                key={sponsor.id}
                href={sponsor.website_url}
                target="_blank"
                rel="noopener noreferrer"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="group relative flex items-center justify-center h-24 md:h-28 border border-[#1C1010] rounded-sm hover:border-[#E10000] transition-colors p-4"
              >
                {sponsor.logo_url ? (
                  <img
                    src={sponsor.logo_url}
                    alt={sponsor.name}
                    className="max-h-full max-w-full object-contain opacity-60 group-hover:opacity-100 transition-opacity"
                  />
                ) : (
                  <span className="font-heading font-bold text-lg md:text-xl text-[#E2E8F0]/60 group-hover:text-[#E10000] transition-colors uppercase text-center">
                    {sponsor.name}
                  </span>
                )}
                <ExternalLink className="absolute top-2 right-2 w-3 h-3 text-[#E2E8F0]/20 group-hover:text-[#E10000] transition-colors" />
              </motion.a>
            ))
          )}
        </div>
      </div>
    </section>
  );
}