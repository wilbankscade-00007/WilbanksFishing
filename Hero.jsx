import React, { useState, useEffect } from 'react';
import { motion, useScroll, useTransform, useSpring } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import PhotoMarquee from './PhotoMarquee';
import WhatsNewMarquee from './WhatsNewMarquee';

const LOGO_URL = 'https://media.base44.com/images/public/user_6a5139050a134ea1f78df45c/504f27ec4_ChatGPTImageJul10202608_14_06AM.png';

export default function Hero() {
  const { scrollY } = useScroll();
  const yBg = useTransform(scrollY, [0, 800], [0, 200]);
  const opacity = useTransform(scrollY, [0, 500], [1, 0]);
  // Multi-layer parallax — each layer moves at a different speed for depth
  const yTop = useTransform(scrollY, [0, 700], [0, -110]);
  const yMid = useTransform(scrollY, [0, 700], [0, 50]);
  const yBottom = useTransform(scrollY, [0, 700], [0, 140]);

  // Mouse-driven 3D tilt on the background (spring-smoothed)
  const tiltRX = useSpring(0, { stiffness: 90, damping: 18 });
  const tiltRY = useSpring(0, { stiffness: 90, damping: 18 });

  const [photos1, setPhotos1] = useState([]);

  useEffect(() => {
    base44.entities.MemberCatch.list('-created_date', 50).then((rows) => {
      setPhotos1((rows || []).map(d => ({ url: d.image_url, caption: d.caption })));
    }).catch(() => {});
  }, []);

  const onTilt = (e) => {
    const r = e.currentTarget.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width - 0.5;
    const py = (e.clientY - r.top) / r.height - 0.5;
    tiltRX.set(-py * 6);
    tiltRY.set(px * 6);
  };
  const onTiltReset = () => { tiltRX.set(0); tiltRY.set(0); };

  return (
    <section
      id="top"
      className="relative h-screen w-full overflow-hidden bg-[#0A0A0A] flex flex-col"
      onMouseMove={onTilt}
      onMouseLeave={onTiltReset}
    >
      <motion.div
        style={{ y: yBg, rotateX: tiltRX, rotateY: tiltRY, transformPerspective: 1200 }}
        className="absolute inset-0 scale-110"
      >
        <img src={LOGO_URL} alt="" className="w-full h-full object-cover opacity-70" />
        <div className="absolute inset-0 bg-gradient-to-b from-[#0A0A0A]/30 via-[#0A0A0A]/50 to-[#0A0A0A]" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0A0A0A]/70 via-transparent to-[#0A0A0A]/70" />
      </motion.div>

      <div
        className="relative z-10 flex-1 flex flex-col justify-between items-center p-6 md:p-12 pt-24 pb-12 w-full"
        style={{ perspective: 1400 }}
      >
        <motion.div style={{ y: yTop, z: 30 }} className="w-full shrink-0">
          <motion.h1
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="font-heading font-extrabold leading-[0.82] tracking-tighter text-[#E2E8F0] uppercase text-center text-[13vw] md:text-[11vw] w-full"
          >
            Wilbanks
          </motion.h1>
        </motion.div>

        <motion.div style={{ y: yMid }} className="flex-1 flex flex-col justify-center w-full max-w-7xl py-4 gap-3">
          {photos1.length > 0 && (
            <PhotoMarquee photos={photos1} height="h-20 md:h-36" speed={55} seed={7} />
          )}
          <WhatsNewMarquee height="h-28 md:h-40" />
        </motion.div>

        <motion.div style={{ y: yBottom, z: 30 }} className="w-full shrink-0">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="font-heading font-extrabold text-[13vw] md:text-[11vw] leading-[0.82] tracking-tighter text-[#E10000] uppercase text-glow text-center w-full"
          >
            Fishing
          </motion.h2>
        </motion.div>
      </div>

      <motion.div style={{ opacity }} className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-2">
        <span className="text-[10px] tracking-[0.4em] text-[#E2E8F0]/40 uppercase">Descend</span>
        <motion.div animate={{ y: [0, 8, 0] }} transition={{ repeat: Infinity, duration: 2 }}>
          <ChevronDown className="w-5 h-5 text-[#E10000]" />
        </motion.div>
      </motion.div>
    </section>
  );
}