import React, { useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Sparkles } from 'lucide-react';

const LOGO_URL = 'https://media.base44.com/images/public/user_6a5139050a134ea1f78df45c/504f27ec4_ChatGPTImageJul10202608_14_06AM.png';

export default function ProductGallery() {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] });
  // Parallax depth — watermark drifts + scales, content drifts at a different rate
  const yWatermark = useTransform(scrollYProgress, [0, 1], [60, -60]);
  const scaleWatermark = useTransform(scrollYProgress, [0, 1], [1.12, 0.88]);
  const yContent = useTransform(scrollYProgress, [0, 1], [30, -30]);

  return (
    <section id="shop" ref={ref} className="relative py-24 md:py-32 px-6 md:px-12">
      <div className="max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-10 md:mb-14 text-center"
        >
          <span className="text-[10px] tracking-[0.4em] text-[#E10000] uppercase">The Collection</span>
          <h2 className="font-heading font-extrabold text-4xl md:text-7xl text-[#E2E8F0] uppercase leading-[0.9] mt-2">Merch</h2>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="relative overflow-hidden rounded-sm border border-[#1C1010] bg-gradient-to-b from-[#1C1010]/40 to-[#0A0A0A] px-6 py-16 md:py-24 text-center"
        >
          <motion.div
            style={{ y: yWatermark, scale: scaleWatermark }}
            className="absolute inset-0 flex items-center justify-center opacity-10 pointer-events-none"
          >
            <img src={LOGO_URL} alt="" className="w-[420px] max-w-[80%] object-contain blur-[1px]" />
          </motion.div>

          <motion.div
            style={{ y: yContent }}
            className="relative z-10 flex flex-col items-center max-w-xl mx-auto"
          >
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[#E10000]/40 bg-[#E10000]/10 mb-6">
              <Sparkles className="w-3.5 h-3.5 text-[#E10000]" />
              <span className="text-[10px] tracking-[0.3em] text-[#E10000] uppercase font-bold">Coming Soon</span>
            </span>

            <h3 className="font-heading font-extrabold text-3xl md:text-5xl text-[#E2E8F0] uppercase leading-tight text-glow">
              Merch Dropping Soon
            </h3>
            <p className="mt-4 text-sm md:text-base text-[#E2E8F0]/60 leading-relaxed">
              We're cooking up something special for the WilbanksFishing crew. Tees, hoodies, hats and more — designed by anglers, for anglers. No products are live yet, but they're on the way.
            </p>

            <div className="mt-8 flex flex-col sm:flex-row items-center gap-3">
              <a
                href="https://wilbanksfishing.substack.com"
                target="_blank"
                rel="noopener noreferrer"
                className="px-6 py-2.5 bg-[#E10000] text-white text-xs uppercase tracking-[0.2em] rounded-sm hover:bg-[#C00000] transition-colors lift-3d"
              >
                Get Notified
              </a>
              <Link to="/Community" className="px-6 py-2.5 border border-[#1C1010] hover:border-[#E10000] text-[#E2E8F0]/70 hover:text-[#E10000] text-xs uppercase tracking-[0.2em] rounded-sm transition-colors lift-3d">
                Join the Crew
              </Link>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}