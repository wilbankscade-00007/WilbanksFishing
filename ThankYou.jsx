import React from 'react';
import { motion } from 'framer-motion';
import { Check } from 'lucide-react';
import { Link } from 'react-router-dom';

const LOGO_URL = 'https://media.base44.com/images/public/user_6a5139050a134ea1f78df45c/504f27ec4_ChatGPTImageJul10202608_14_06AM.png';

export default function ThankYou() {
  return (
    <div className="min-h-screen bg-[#0A0F12] flex flex-col items-center justify-center px-6 py-20 relative overflow-hidden">
      <div className="absolute inset-0 opacity-20">
        <div className="absolute inset-0 bg-gradient-to-b from-[#0A0F12] via-[#0A0F12] to-[#0A0F12]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-[#14FFEC]/5 blur-[120px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 flex flex-col items-center text-center max-w-lg"
      >
        <img src={LOGO_URL} alt="WilbanksFishing" className="h-14 mb-8" />

        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: 'spring', stiffness: 200, damping: 15 }}
          className="w-16 h-16 rounded-full bg-[#14FFEC] flex items-center justify-center bio-glow mb-6"
        >
          <Check className="w-8 h-8 text-[#0A0F12]" strokeWidth={3} />
        </motion.div>

        <span className="text-[10px] tracking-[0.4em] text-[#14FFEC] uppercase mb-3">Order Confirmed</span>
        <h1 className="font-heading font-extrabold text-4xl md:text-5xl text-[#E2E8F0] uppercase leading-[0.9] mb-4">
          Gear Loaded
        </h1>
        <p className="text-sm text-[#E2E8F0]/60 leading-relaxed mb-8">
          Your equipment is being prepared for deployment. You'll receive a confirmation email with tracking details shortly.
        </p>

        <div className="w-full topo-line mb-8" />

        <Link
          to="/"
          className="px-8 py-3 border border-[#14FFEC] text-[#14FFEC] text-xs tracking-[0.3em] uppercase rounded-sm hover:bg-[#14FFEC] hover:text-[#0A0F12] transition-all"
        >
          Back to the Arsenal
        </Link>
      </motion.div>
    </div>
  );
}