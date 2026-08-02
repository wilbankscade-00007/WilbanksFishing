import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, X } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import SmartImage from '@/components/SmartImage';

function getYouTubeId(url) {
  const match = url?.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/);
  return match ? match[1] : null;
}

export default function BehindTheScenes() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lightbox, setLightbox] = useState(null);

  useEffect(() => {
    base44.entities.BehindTheScenes.list('-created_date').then(data => {
      setItems(data);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-[#0A0A0A] pt-24">
      <div className="max-w-7xl mx-auto px-6 md:px-12 py-12">
        <Link to="/" className="inline-flex items-center gap-2 text-xs tracking-[0.3em] uppercase text-[#E2E8F0]/50 hover:text-[#E10000] transition-colors mb-8">
          <ArrowLeft className="w-4 h-4" /> Back to Home
        </Link>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-12">
          <span className="text-[10px] tracking-[0.4em] text-[#E10000] uppercase">Unfiltered</span>
          <h1 className="font-heading font-extrabold text-4xl sm:text-5xl md:text-7xl text-[#E2E8F0] uppercase leading-[0.9] mt-2">
            Behind the Scenes
          </h1>
        </motion.div>

        {loading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="aspect-square bg-[#1C1010]/50 rounded-sm animate-pulse" />
            ))}
          </div>
        ) : items.length === 0 ? (
          <p className="text-[#E2E8F0]/40 text-center py-20">No behind-the-scenes content yet. Check back soon!</p>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {items.map((item, i) => {
              const ytId = item.media_type === 'video' ? getYouTubeId(item.media_url) : null;
              return (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="group relative border border-[#1C1010] rounded-sm overflow-hidden hover:border-[#E10000] transition-colors"
                >
                  {item.media_type === 'video' && ytId ? (
                    <div className="aspect-video">
                      <iframe
                        src={`https://www.youtube.com/embed/${ytId}`}
                        title={item.title}
                        className="w-full h-full"
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      />
                    </div>
                  ) : (
                    <div className="aspect-square cursor-pointer" onClick={() => setLightbox(item)}>
                      <SmartImage src={item.media_url} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    </div>
                  )}
                  <div className="p-4">
                    <h3 className="font-bold text-sm text-[#E2E8F0] mb-1">{item.title}</h3>
                    {item.description && <p className="text-xs text-[#E2E8F0]/50">{item.description}</p>}
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      {lightbox && (
        <div className="fixed inset-0 z-[70] bg-[#0A0A0A]/95 backdrop-blur-md flex items-center justify-center p-6" onClick={() => setLightbox(null)}>
          <button className="absolute top-6 right-6 text-[#E2E8F0]"><X className="w-8 h-8" /></button>
          <img src={lightbox.media_url} alt={lightbox.title} className="max-w-full max-h-[80vh] object-contain rounded-sm" />
        </div>
      )}
    </div>
  );
}