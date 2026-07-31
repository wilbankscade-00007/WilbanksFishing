import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Mail, Camera } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useCatchGalleryPhotos } from '@/hooks/useCatchGalleryPhotos';
import PhotoMarquee from './PhotoMarquee';
import CatchOfMonthSpotlight from './CatchOfMonthSpotlight';

export default function NewsletterSignup() {
  const { data: galleryPhotos = [], isError } = useCatchGalleryPhotos();
  const [fallbackPhotos, setFallbackPhotos] = useState([]);

  useEffect(() => {
    if (!isError) return;
    let active = true;
    base44.entities.CatchPhoto.list().then(data => {
      if (!active) return;
      const sorted = data.sort((a, b) => (a.display_order || 0) - (b.display_order || 0));
      setFallbackPhotos(sorted.map(d => ({ url: d.image_url, caption: d.caption })));
    }).catch(() => {});
    return () => { active = false; };
  }, [isError]);

  const photos = galleryPhotos.length
    ? galleryPhotos.map(d => ({ url: d.image_url, caption: d.caption }))
    : fallbackPhotos;

  return (
    <section className="relative pt-10 md:pt-14 pb-32 md:pb-48 px-6 md:px-12 border-t border-[#1C1010] overflow-hidden">
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-[600px] h-[600px] rounded-full bg-[#E10000]/5 blur-[120px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="relative z-10 max-w-4xl mx-auto text-center">

        <Camera className="w-12 h-12 text-[#E10000] mx-auto mb-6" />
        <span className="text-[10px] tracking-[0.4em] text-[#E10000] uppercase">Show Off Your Catch</span>
        <h2 className="font-heading font-extrabold text-4xl sm:text-5xl md:text-7xl text-[#E2E8F0] uppercase leading-[0.9] mt-2 mb-6">Send Me Your<br />Best Catch</h2>
        <p className="text-lg text-[#E2E8F0]/60 leading-relaxed mb-8 max-w-xl mx-auto">
          Send me your best catch of the week and it might be featured in the gallery below and in the next newsletter! Email your photos to:
        </p>
        <a href="mailto:wilbanksfishing@gmail.com" className="inline-block text-xl md:text-2xl text-[#E10000] hover:underline tracking-wider mb-12">
          wilbanksfishing@gmail.com
        </a>
      </motion.div>

      <div className="relative z-10 max-w-6xl mx-auto px-4 mb-16">
        <CatchOfMonthSpotlight photos={galleryPhotos} />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="relative z-10 max-w-4xl mx-auto text-center">
        {photos.length > 0 && (
          <div className="mb-16">
            <p className="text-xs tracking-[0.3em] uppercase text-[#E2E8F0]/40 mb-4">Catch Gallery</p>
            <PhotoMarquee photos={photos} height="h-40 md:h-56" speed={60} seed={3} />
          </div>
        )}

        <div className="pt-10 border-t border-[#1C1010]">
          <Mail className="w-8 h-8 text-[#E10000] mx-auto mb-4" />
          <span className="text-[10px] tracking-[0.4em] text-[#E10000] uppercase">Stay Connected</span>
          <h3 className="font-heading font-extrabold text-3xl md:text-5xl text-[#E2E8F0] uppercase leading-[0.9] mt-2 mb-4">Join the Family</h3>
          <p className="text-sm text-[#E2E8F0]/60 leading-relaxed mb-8 max-w-md mx-auto">
            Get the latest drops, fishing tips, and behind-the-scenes content delivered straight to your inbox.
          </p>

          <div className="flex justify-center">
            <iframe
              src="https://wilbanksfishing.substack.com/embed"
              width="480"
              height="320"
              style={{ border: '1px solid #EEE', background: 'white', maxWidth: '100%' }}
              frameBorder="0"
              scrolling="no"
              title="WilbanksFishing Newsletter"
            />
          </div>
        </div>
      </motion.div>
    </section>
  );
}