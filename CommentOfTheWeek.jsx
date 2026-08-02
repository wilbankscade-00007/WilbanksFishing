import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Quote, Star } from 'lucide-react';
import { base44 } from '@/api/base44Client';

export default function CommentOfTheWeek() {
  const [comment, setComment] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    base44.entities.Comment.filter({ is_featured: true })
      .then(data => {
        if (data.length > 0) {
          setComment(data[0]);
          setLoading(false);
        } else {
          base44.entities.Comment.list('-created_date', 1).then(d => {
            if (d.length > 0) setComment(d[0]);
            setLoading(false);
          }).catch(() => setLoading(false));
        }
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    <section className="relative py-10 md:py-14 px-6 md:px-12 border-t border-[#1C1010] overflow-hidden">
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <Quote className="w-[300px] h-[300px] text-[#1C1010]/20" fill="currentColor" />
      </div>
      <div className="relative z-10 max-w-3xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="relative border border-[#E10000]/40 rounded-sm bg-[#1C1010]/30 p-8 md:p-12 bio-glow"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 mb-6 rounded-full border border-[#E10000]/60 bg-[#E10000]/10">
            <Star className="w-3 h-3 text-[#E10000]" fill="currentColor" />
            <span className="text-[10px] tracking-[0.4em] text-[#E10000] uppercase">Comment of the Week</span>
          </div>

          {loading ? (
            <div className="h-28 md:h-36 animate-pulse rounded-sm bg-[#1C1010]/50" />
          ) : comment ? (
            <>
              {comment.image_url ? (
                <div className="mt-2 mb-4">
                  <img src={comment.image_url} alt="Comment of the week" className="w-full max-w-xl mx-auto rounded-sm border border-[#1C1010]" />
                </div>
              ) : (
                <p className="font-heading text-2xl md:text-4xl text-[#E2E8F0] leading-tight mt-2 mb-6">
                  &ldquo;{comment.text}&rdquo;
                </p>
              )}
              {comment.author && (
                <p className="text-sm text-[#E2E8F0]/50 tracking-wider uppercase">&mdash; {comment.author}</p>
              )}
              {comment.video_url && (
                <a
                  href={comment.video_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 mt-6 px-6 py-2 border border-[#1C1010] hover:border-[#E10000] rounded-sm text-xs uppercase tracking-wider text-[#E2E8F0] hover:text-[#E10000] transition-colors"
                >
                  Watch the Video
                </a>
              )}
            </>
          ) : (
            <p className="text-lg md:text-xl text-[#E2E8F0]/40 italic">
              My favorite comment of the week will be featured here.
            </p>
          )}
        </motion.div>
      </div>
    </section>
  );
}