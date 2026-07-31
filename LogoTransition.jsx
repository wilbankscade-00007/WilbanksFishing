import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

const LOGO_URL = 'https://media.base44.com/images/public/user_6a5139050a134ea1f78df45c/504f27ec4_ChatGPTImageJul10202608_14_06AM.png';

export default function LogoTransition() {
  const location = useLocation();
  const [show, setShow] = useState(true);

  useEffect(() => {
    setShow(true);
    const timer = setTimeout(() => setShow(false), 650);
    return () => clearTimeout(timer);
  }, [location.pathname]);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 1 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 z-[200] bg-[#0A0A0A] flex items-center justify-center pointer-events-none"
        >
          <motion.img
            src={LOGO_URL}
            initial={{ scale: 0.6, opacity: 0 }}
            animate={{ scale: 1, opacity: 0.9 }}
            exit={{ scale: 1.15, opacity: 0 }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
            className="h-24 md:h-32 w-auto bio-glow"
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}