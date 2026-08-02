import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Play, ExternalLink, ArrowLeft, Youtube } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import YouTubeLiveStats from '@/components/YouTubeLiveStats';
import ViewerMap from '@/components/ViewerMap';
import RecentVideoPerformance from '@/components/RecentVideoPerformance';
import AchievementsSection from '@/components/AchievementsSection';
import LiveStream from '@/components/LiveStream';

const CHANNEL_URL = 'https://www.youtube.com/@WilbanksFishing';

function getYouTubeId(url) {
  const match = url?.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/);
  return match ? match[1] : null;
}

export default function YouTube() {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    base44.entities.Video.list().then(data => {
      setVideos(data.sort((a, b) => (a.display_order || 0) - (b.display_order || 0)));
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const newestVideo = !loading && videos.length > 0 ? videos[0] : null;
  const newestYtId = newestVideo ? getYouTubeId(newestVideo.youtube_url) : null;

  return (
    <div className="min-h-screen bg-[#0A0A0A] pt-24">
      <div className="max-w-7xl mx-auto px-6 md:px-12 py-12">
        <Link to="/" className="inline-flex items-center gap-2 text-xs tracking-[0.3em] uppercase text-[#E2E8F0]/50 hover:text-[#E10000] transition-colors mb-8">
          <ArrowLeft className="w-4 h-4" /> Back to Home
        </Link>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-12 text-center">
          <span className="text-[10px] tracking-[0.4em] text-[#E10000] uppercase">WilbanksFishing</span>
          <h1 className="font-heading font-extrabold text-4xl sm:text-5xl md:text-7xl text-[#E2E8F0] uppercase leading-[0.9] mt-2">
            On the Water
          </h1>
          <p className="text-sm text-[#E2E8F0]/60 leading-relaxed mt-4 max-w-md mx-auto">
            Watch the latest adventures, catches, and behind-the-scenes action from the WilbanksFishing channel.
          </p>
          <a
            href={CHANNEL_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 mt-6 px-6 py-3 bg-[#E10000] text-white font-bold uppercase tracking-[0.2em] text-xs rounded-sm hover:bg-transparent hover:text-[#E10000] hover:border hover:border-[#E10000] transition-all bio-glow"
          >
            <Youtube className="w-4 h-4" /> Subscribe on YouTube
          </a>
        </motion.div>

        <LiveStream />

        <YouTubeLiveStats />

        <AchievementsSection />

        <ViewerMap />

        {newestVideo && newestYtId && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mb-16 max-w-4xl mx-auto text-center"
          >
            <span className="text-[10px] tracking-[0.4em] text-[#E10000] uppercase block mb-4">Newest Video</span>
            <div className="relative aspect-video overflow-hidden rounded-sm border border-[#1C1010] hover:border-[#E10000] transition-colors">
              <iframe
                src={`https://www.youtube.com/embed/${newestYtId}`}
                title={newestVideo.title}
                className="w-full h-full"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
            <h3 className="font-bold text-lg text-[#E2E8F0] mt-4">{newestVideo.title}</h3>
            {newestVideo.description && <p className="text-sm text-[#E2E8F0]/60 mt-2 max-w-2xl mx-auto">{newestVideo.description}</p>}
          </motion.div>
        )}

        {loading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="aspect-video bg-[#1C1010]/50 rounded-sm animate-pulse" />
            ))}
          </div>
        ) : videos.length === 0 ? (
          <p className="text-[#E2E8F0]/40 text-center py-20">No videos posted yet. Check back soon!</p>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {videos.map((video, i) => {
              const ytId = getYouTubeId(video.youtube_url);
              const thumb = ytId ? `https://img.youtube.com/vi/${ytId}/maxresdefault.jpg` : null;
              return (
                <motion.a
                  key={video.id}
                  href={video.youtube_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
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
                    {video.description && <p className="text-xs text-[#E2E8F0]/50 mt-1 line-clamp-1">{video.description}</p>}
                  </div>
                </motion.a>
              );
            })}
          </div>
        )}

        <div className="text-center mt-12">
          <a
            href={CHANNEL_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-xs tracking-[0.3em] uppercase text-[#E10000] hover:underline"
          >
            Watch all videos on YouTube <ExternalLink className="w-3 h-3" />
          </a>
        </div>

        <RecentVideoPerformance />
      </div>
    </div>
  );
}