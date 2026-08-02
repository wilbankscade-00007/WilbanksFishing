import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Play, ExternalLink } from 'lucide-react';
import { base44 } from '@/api/base44Client';

function getYouTubeId(url) {
  const match = url?.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/);
  return match ? match[1] : null;
}

export default function YouTubeSection() {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    base44.entities.Video.list().then(data => {
      setVideos(data.sort((a, b) => (a.display_order || 0) - (b.display_order || 0)));
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  if (!loading && videos.length === 0) return null;

  return (
    <section id="videos" className="relative py-24 md:py-32 px-6 md:px-12 border-t border-[#1C1010]">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-12 text-center"
        >
          <span className="text-[10px] tracking-[0.4em] text-[#E10000] uppercase">Latest Content</span>
          <h2 className="font-heading font-extrabold text-5xl md:text-7xl text-[#E2E8F0] uppercase leading-[0.9] mt-2">
            On the Water
          </h2>
        </motion.div>

        {loading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="aspect-video bg-[#1C1010]/50 rounded-sm animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {videos.map(video => {
              const ytId = getYouTubeId(video.youtube_url);
              const thumb = ytId ? `https://img.youtube.com/vi/${ytId}/maxresdefault.jpg` : null;
              return (
                <motion.a
                  key={video.id}
                  href={video.youtube_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  className="group relative aspect-video overflow-hidden rounded-sm border border-[#1C1010] hover:border-[#E10000] transition-colors"
                >
                  {thumb && <img src={thumb} alt={video.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A] via-[#0A0A0A]/20 to-transparent" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-14 h-14 rounded-full bg-[#E10000]/90 flex items-center justify-center group-hover:scale-110 transition-transform bio-glow">
                      <Play className="w-6 h-6 text-white ml-1" fill="white" />
                    </div>
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 p-4">
                    <h3 className="font-bold text-sm text-[#E2E8F0] line-clamp-2">{video.title}</h3>
                  </div>
                </motion.a>
              );
            })}
          </div>
        )}

        <div className="text-center mt-10">
          <a href="https://www.youtube.com/@WilbanksFishing" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-xs tracking-[0.3em] uppercase text-[#E10000] hover:underline">
            Watch on YouTube <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>
    </section>
  );
}