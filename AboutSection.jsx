import React from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';

const ABOUT_IMG = 'https://media.base44.com/images/public/6a5139318a957c718bd166bb/73c9786ce_IMG_61971.jpg';

export default function AboutSection() {
  const { scrollYProgress } = useScroll();
  const xText = useTransform(scrollYProgress, [0, 1], [0, -200]);

  return (
    <section id="about" className="relative py-24 md:py-32 overflow-hidden">
      <motion.div style={{ x: xText }} className="absolute top-1/2 -translate-y-1/2 left-0 w-[200%] pointer-events-none">
        <p className="font-heading font-extrabold text-[12vw] leading-none text-[#1C1010]/40 uppercase whitespace-nowrap">
          Wilbanks · Fishing · Wilbanks · Fishing
        </p>
      </motion.div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 md:px-12 grid md:grid-cols-2 gap-12 md:gap-20 items-center">
        <motion.div
          initial={{ opacity: 0, x: -40 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}>
          
          <div className="relative aspect-[4/5] overflow-hidden rounded-sm">
            <img src={ABOUT_IMG} alt="WilbanksFishing" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A] via-transparent to-transparent" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 40 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="space-y-6">
          
          <span className="text-[10px] tracking-[0.4em] text-[#E10000] uppercase">About Me</span>
          <h2 className="font-heading font-extrabold text-4xl md:text-6xl leading-[0.9] text-[#E2E8F0] uppercase">
            The Story<br />Behind the Cast
          </h2>
          <p className="text-lg text-[#E2E8F0]/70 leading-relaxed max-w-md">What started as a passion for early mornings on the water has grown into a community of anglers who live and breathe fishing. I'm just a guy who loves to fish, and I wanted to share that with the world. Every piece of merch, every video, every tip — it all comes from time spent on the water, learning, failing, and getting better.</p>
          <div className="pt-4 border-t border-[#1C1010]">
            <p className="text-sm text-[#E2E8F0]/50 leading-relaxed">This is more than a brand. It's a family.</p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}