import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Play, ExternalLink } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import YouTubeStatsWidget from './YouTubeStatsWidget';

function getYouTubeId(url) {
  const match = url?.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/);
  return match ? match[1] : null;
}

export default function HomeVideoSection() {
  const [videos, setVideos] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Trigger a fresh stats sync (respects a 30s server cache) so the newest
    // long-form upload is picked up automatically every time someone lands here.
    base44.functions.invoke('sync-youtube-stats').catch(() => {});
    base44.entities.YouTubeStats.list().then(data => {
      if (data.length) setStats(data.sort((a, b) => (a.display_order || 0) - (b.display_order || 0))[0]);
    }).catch(() => {});
    base44.entities.Video.list().then(data => {
      setVideos(data.sort((a, b) => (a.display_order || 0) - (b.display_order || 0)));
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  // Newest video — pulled from the auto-synced YouTube stats (latest long-form
  // upload), falling back to a curated Video record if stats aren't ready yet.
  const newestFromStats = stats?.latest_video_url
    ? { youtube_url: stats.latest_video_url, title: stats.latest_video_title || '', description: '' }
    : null;
  const newest = newestFromStats || videos[0] || null;
  // Recent grid — curated Video records, excluding whichever video is shown as newest.
  const recent = videos.filter((v) => !newest || v.youtube_url !== newest.youtube_url).slice(0, 3);
  const newestId = newest ? getYouTubeId(newest.youtube_url) : null;

  if (!loading && !newest && recent.length === 0) return null;

  return (
    <section id="videos" className="relative pt-24 md:pt-32 pb-10 md:pb-14 px-6 md:px-12 border-t border-[#1C1010]">
      <div className="max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-10 text-center"
        >
          <span className="text-[10px] tracking-[0.4em] text-[#E10000] uppercase">Latest Content</span>
          <h2 className="font-heading font-extrabold text-4xl sm:text-5xl md:text-7xl text-[#E2E8F0] uppercase leading-[0.9] mt-2">On the Water</h2>
        </motion.div>

        <YouTubeStatsWidget />

        {loading ? (
          <div className="max-w-3xl mx-auto">
            <div className="aspect-video bg-[#1C1010]/50 rounded-sm animate-pulse mb-8" />
            <div className="grid sm:grid-cols-3 gap-4">
              {[...Array(3)].map((_, i) => <div key={i} className="aspect-video bg-[#1C1010]/50 rounded-sm animate-pulse" />)}
            </div>
          </div>
        ) : (
          <>
            {newest && newestId && (
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="mb-12 max-w-3xl mx-auto text-center"
              >
                <span className="text-[10px] tracking-[0.4em] text-[#E10000] uppercase block mb-4">Newest Video</span>
                <div className="relative aspect-video overflow-hidden rounded-sm border border-[#1C1010] hover:border-[#E10000] transition-colors">
                  <iframe
                    src={`https://www.youtube.com/embed/${newestId}`}
                    title={newest.title}
                    className="w-full h-full"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
                <h3 className="font-bold text-lg text-[#E2E8F0] mt-4">{newest.title}</h3>
                {newest.description && <p className="text-sm text-[#E2E8F0]/60 mt-2 max-w-2xl mx-auto">{newest.description}</p>}
              </motion.div>
            )}

            {recent.length > 0 && (
              <div className="grid sm:grid-cols-3 gap-4">
                {recent.map((video, i) => {
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
                      transition={{ delay: i * 0.05 }}
                      className="group relative aspect-video overflow-hidden rounded-sm border border-[#1C1010] hover:border-[#E10000] transition-colors"
                    >
                      {thumb && <img src={thumb} alt={video.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />}
                      <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A] via-[#0A0A0A]/20 to-transparent" />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-12 h-12 rounded-full bg-[#E10000]/90 flex items-center justify-center group-hover:scale-110 transition-transform bio-glow">
                          <Play className="w-5 h-5 text-white ml-1" fill="white" />
                        </div>
                      </div>
                      <div className="absolute bottom-0 left-0 right-0 p-3">
                        <h3 className="font-bold text-xs text-[#E2E8F0] line-clamp-2">{video.title}</h3>
                      </div>
                    </motion.a>
                  );
                })}
              </div>
            )}
          </>
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