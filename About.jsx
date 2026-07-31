import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import { base44 } from '@/api/base44Client';

export default function About() {
  const [contents, setContents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    base44.entities.AboutContent.list().then(data => {
      setContents(data.sort((a, b) => (a.display_order || 0) - (b.display_order || 0)));
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  return (
    <div className="pt-24 min-h-screen bg-[#0A0A0A] overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 md:px-12 py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-16 text-center"
        >
          <span className="text-[10px] tracking-[0.4em] text-[#E10000] uppercase">About Me</span>
          <h1 className="font-heading font-extrabold text-5xl md:text-7xl text-[#E2E8F0] uppercase leading-[0.9] mt-2">
            The Story
          </h1>
        </motion.div>

        {loading ? (
          <div className="text-center py-16"><Loader2 className="w-8 h-8 animate-spin text-[#E10000] mx-auto" /></div>
        ) : contents.length === 0 ? (
          <p className="text-center text-[#E2E8F0]/40 text-sm py-16">No content yet.</p>
        ) : (
          <div className="space-y-20 md:space-y-32">
            {contents.map((item, i) => (
              <div
                key={item.id}
                className={`grid md:grid-cols-2 gap-8 md:gap-16 items-center ${i % 2 === 1 ? 'md:[direction:rtl]' : ''}`}
              >
                <motion.div
                  initial={{ opacity: 0, x: -40 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.8 }}
                  className="md:[direction:ltr]"
                >
                  {item.photo_url && (
                    <div className="relative aspect-[4/5] overflow-hidden rounded-sm border border-[#1C1010]">
                      <img src={item.photo_url} alt={item.title} className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A]/60 via-transparent to-transparent" />
                    </div>
                  )}
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, x: 40 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.8 }}
                  className="space-y-6 md:[direction:ltr]"
                >
                  {item.title && (
                    <h2 className="font-heading font-extrabold text-3xl md:text-5xl text-[#E2E8F0] uppercase leading-[0.9]">
                      {item.title}
                    </h2>
                  )}
                  <p className="text-lg text-[#E2E8F0]/70 leading-relaxed whitespace-pre-line">{item.bio}</p>
                </motion.div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}