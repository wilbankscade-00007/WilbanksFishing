import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { X, LogIn, Fish, ArrowRight } from 'lucide-react';
import { useAuth } from '@/lib/AuthContext';

const STORAGE_KEY = 'wf_login_prompt_seen';

export default function LoginPrompt() {
  const { isAuthenticated, authChecked, isLoadingAuth } = useAuth();
  const [show, setShow] = useState(false);

  useEffect(() => {
    // Only prompt guests once auth state is confirmed (not loading, not logged in)
    if (isLoadingAuth || !authChecked || isAuthenticated) return;
    try {
      if (sessionStorage.getItem(STORAGE_KEY)) return;
    } catch (e) { /* ignore */ }
    const t = setTimeout(() => setShow(true), 2500);
    return () => clearTimeout(t);
  }, [isLoadingAuth, authChecked, isAuthenticated]);

  const dismiss = () => {
    setShow(false);
    try { sessionStorage.setItem(STORAGE_KEY, '1'); } catch (e) { /* ignore */ }
  };

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed bottom-6 left-6 z-[70] max-w-xs"
        >
          <motion.div
            initial={{ y: 40, scale: 0.95 }}
            animate={{ y: 0, scale: 1 }}
            exit={{ y: 40, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 260, damping: 22 }}
            className="relative glass border border-[#E10000]/50 rounded-sm overflow-hidden shadow-[0_18px_50px_rgba(225,0,0,0.35)]"
          >
            <button
              onClick={dismiss}
              className="absolute top-2 right-2 z-10 text-[#E2E8F0]/50 hover:text-[#E10000] transition-colors"
              aria-label="Dismiss"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="relative px-5 pt-5 pb-4 bg-gradient-to-br from-[#1C1010] via-[#0A0A0A] to-[#1C1010]">
              <div className="absolute -top-10 -left-10 w-32 h-32 rounded-full bg-[#E10000]/20 blur-2xl pointer-events-none" />
              <div className="relative flex items-center gap-3 mb-3">
                <div className="relative w-12 h-12 rounded-full border border-[#E10000]/60 bg-[#E10000]/15 flex items-center justify-center">
                  <span className="absolute flex h-2.5 w-2.5 -top-0.5 -right-0.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#E10000] opacity-60" />
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#E10000]" />
                  </span>
                  <LogIn className="w-5 h-5 text-[#E10000]" />
                </div>
                <div>
                  <p className="text-[9px] tracking-[0.3em] uppercase text-[#E10000]">Join the crew</p>
                  <p className="font-heading font-bold text-base text-[#E2E8F0] uppercase leading-none mt-0.5">Log In</p>
                </div>
              </div>
              <p className="text-xs text-[#E2E8F0]/60 leading-relaxed mb-4">
                Create an account or log in to join the live Family Gathering chat, vote on catches, climb the leaderboard, and track your rank.
              </p>
              <Link
                to="/login"
                onClick={dismiss}
                className="flex items-center justify-center gap-2 w-full px-4 py-2.5 bg-[#E10000] text-white text-xs uppercase tracking-[0.2em] rounded-sm hover:bg-[#E10000]/80 transition-all lift-3d"
              >
                Log In / Sign Up <ArrowRight className="w-3.5 h-3.5" />
              </Link>
              <p className="flex items-center justify-center gap-1.5 mt-2.5 text-[10px] text-[#E2E8F0]/30 tracking-wide">
                <Fish className="w-3 h-3" /> It's free — see you on the water
              </p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}