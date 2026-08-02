import React from 'react';
import { motion } from 'framer-motion';
import { Youtube, Instagram, Mail } from 'lucide-react';
import { Link } from 'react-router-dom';

const LOGO_URL = 'https://media.base44.com/images/public/user_6a5139050a134ea1f78df45c/504f27ec4_ChatGPTImageJul10202608_14_06AM.png';

export default function WilbanksFooter() {
  return (
    <footer className="relative bg-[#0A0A0A] border-t border-[#1C1010] overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 md:px-12 pt-16 pb-8">
        <div className="grid md:grid-cols-4 gap-12 mb-16">
          <div className="md:col-span-2">
            <img src={LOGO_URL} alt="WilbanksFishing" className="h-12 w-auto mb-4" />
            <p className="text-sm text-[#E2E8F0]/50 max-w-xs leading-relaxed">Premium merch for the WilbanksFishing Family. Built on the water, by us.

            </p>
          </div>

          <div>
            <h4 className="text-[10px] tracking-[0.4em] text-[#E10000] uppercase mb-4">Navigate</h4>
            <ul className="space-y-2">
              <li><Link to="/Shop" className="text-sm text-[#E2E8F0]/60 hover:text-[#E10000] transition-colors">Shop</Link></li>
              <li><Link to="/CatchGallery" className="text-sm text-[#E2E8F0]/60 hover:text-[#E10000] transition-colors">Catch Gallery</Link></li>
              <li><Link to="/About" className="text-sm text-[#E2E8F0]/60 hover:text-[#E10000] transition-colors">About</Link></li>
              <li><Link to="/Sponsors" className="text-sm text-[#E2E8F0]/60 hover:text-[#E10000] transition-colors">Sponsors</Link></li>
              <li><Link to="/Tips" className="text-sm text-[#E2E8F0]/60 hover:text-[#E10000] transition-colors">Tips</Link></li>
              <li><Link to="/BehindTheScenes" className="text-sm text-[#E2E8F0]/60 hover:text-[#E10000] transition-colors">Behind the Scenes</Link></li>
              <li><a href="https://www.youtube.com/@WilbanksFishing" className="text-sm text-[#E2E8F0]/60 hover:text-[#E10000] transition-colors">YouTube</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-[10px] tracking-[0.4em] text-[#E10000] uppercase mb-4">Connect</h4>
            <div className="flex gap-3">
              <a href="https://www.youtube.com/@WilbanksFishing" className="w-10 h-10 rounded-full border border-[#1C1010] flex items-center justify-center hover:border-[#E10000] transition-colors">
                <Youtube className="w-4 h-4 text-[#E2E8F0]/70" />
              </a>
              <a href="https://instagram.com" className="w-10 h-10 rounded-full border border-[#1C1010] flex items-center justify-center hover:border-[#E10000] transition-colors">
                <Instagram className="w-4 h-4 text-[#E2E8F0]/70" />
              </a>
              <a href="mailto:hello@wilbanksfishing.com" className="w-10 h-10 rounded-full border border-[#1C1010] flex items-center justify-center hover:border-[#E10000] transition-colors">
                <Mail className="w-4 h-4 text-[#E2E8F0]/70" />
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-[#1C1010] pt-8 flex flex-col md:flex-row justify-between gap-4">
          <p className="text-xs text-[#E2E8F0]/30 tracking-wider">© 2026 WilbanksFishing. All rights reserved.</p>
          <div className="flex gap-6">
            <a href="#" className="text-xs text-[#E2E8F0]/30 hover:text-[#E10000] transition-colors">Privacy</a>
            <a href="#" className="text-xs text-[#E2E8F0]/30 hover:text-[#E10000] transition-colors">Terms</a>
            <a href="#" className="text-xs text-[#E2E8F0]/30 hover:text-[#E10000] transition-colors">Shipping</a>
            <Link to="/admin" className="text-xs text-[#E2E8F0]/30 hover:text-[#E10000] transition-colors">Admin</Link>
          </div>
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        className="relative w-full overflow-hidden -mb-[3vw]">
        
        <h2 className="font-heading font-extrabold text-[22vw] leading-[0.8] text-center text-[#1C1010]/30 uppercase tracking-tighter select-none">
          Wilbanks
        </h2>
      </motion.div>
    </footer>);

}