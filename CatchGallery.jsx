import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, X } from 'lucide-react';
import { useCatchGalleryPhotos } from '@/hooks/useCatchGalleryPhotos';
import PhotoMarquee from '@/components/PhotoMarquee';
import CatchOfMonthSpotlight from '@/components/CatchOfMonthSpotlight';
import SmartImage from '@/components/SmartImage';

export default function CatchGallery() {
  const { data: photos = [], isLoading: loading } = useCatchGalleryPhotos();
  const [lightbox, setLightbox] = useState(null);

  const marqueePhotos = photos.map(p => ({ url: p.image_url, caption: p.caption }));

  return (
    <div className="min-h-screen bg-[#0A0A0A] pt-24">
      <div className="max-w-7xl mx-auto px-6 md:px-12 py-12">
        <Link to="/" className="inline-flex items-center gap-2 text-xs tracking-[0.3em] uppercase text-[#E2E8F0]/50 hover:text-[#E10000] transition-colors mb-8">
          <ArrowLeft className="w-4 h-4" /> Back to Home
        </Link>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-10 text-center">
          <span className="text-[10px] tracking-[0.4em] text-[#E10000] uppercase">From the Crew</span>
          <h1 className="font-heading font-extrabold text-4xl sm:text-5xl md:text-7xl text-[#E2E8F0] uppercase leading-[0.9] mt-2">Catch Gallery</h1>
          <p className="text-sm text-[#E2E8F0]/60 leading-relaxed mt-4 max-w-md mx-auto">
            The best catches from the WilbanksFishing family. Submit yours and it might land here.
          </p>
        </motion.div>

        <CatchOfMonthSpotlight photos={photos} />

        {photos.length > 0 && (
          <div className="mb-16">
            <PhotoMarquee photos={marqueePhotos} height="h-40 md:h-60" speed={60} seed={5} />
          </div>
        )}

        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {[...Array(8)].map((_, i) => <div key={i} className="aspect-square bg-[#1C1010]/50 rounded-sm animate-pulse" />)}
          </div>
        ) : photos.length === 0 ? (
          <p className="text-[#E2E8F0]/40 text-center py-20">No catches yet. Be the first — email your photos to wilbanksfishing@gmail.com.</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {photos.map((p, i) => (
              <motion.button
                key={p.id}
                onClick={() => setLightbox(p)}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.03 }}
                className="group relative aspect-square overflow-hidden rounded-sm border border-[#1C1010] hover:border-[#E10000] transition-colors"
              >
                <SmartImage src={p.image_url} alt={p.caption || ''} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A]/90 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-3">
                  <div>
                    {p.caption && <p className="text-xs text-[#E2E8F0] line-clamp-2">{p.caption}</p>}
                    {p.author && <p className="text-[10px] text-[#E10000] uppercase tracking-wider mt-1">{p.author}</p>}
                  </div>
                </div>
              </motion.button>
            ))}
          </div>
        )}
      </div>

      <AnimatePresence>
        {lightbox && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[80] bg-[#0A0A0A]/95 flex items-center justify-center p-6"
            onClick={() => setLightbox(null)}
          >
            <button className="absolute top-6 right-6 text-[#E2E8F0]/70 hover:text-[#E10000]" onClick={() => setLightbox(null)}>
              <X className="w-8 h-8" />
            </button>
            <motion.img
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              src={lightbox.image_url}
              alt={lightbox.caption || ''}
              className="max-w-full max-h-[80vh] object-contain rounded-sm border border-[#E10000]/30"
            />
            {(lightbox.caption || lightbox.author) && (
              <div className="absolute bottom-8 left-0 right-0 text-center px-6">
                {lightbox.caption && <p className="text-sm text-[#E2E8F0]">{lightbox.caption}</p>}
                {lightbox.author && <p className="text-xs text-[#E10000] uppercase tracking-wider mt-1">{lightbox.author}</p>}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}