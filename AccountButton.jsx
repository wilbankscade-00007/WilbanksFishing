import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LogIn, LogOut } from 'lucide-react';
import { Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';

export default function AccountButton() {
  const [authed, setAuthed] = useState(null);
  const [me, setMe] = useState(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    base44.auth.isAuthenticated().then(async (ok) => {
      setAuthed(ok);
      if (ok) { try { setMe(await base44.auth.me()); } catch (_) {} }
    }).catch(() => setAuthed(false));
  }, []);

  if (authed === null) return null;

  if (!authed) {
    return (
      <Link to="/login" className="relative flex items-center gap-2 px-3 py-2 border border-[#1C1010] hover:border-[#E10000] rounded transition-colors group" title="Log in to save your progress">
        <LogIn className="w-4 h-4 text-[#E2E8F0] group-hover:text-[#E10000] transition-colors" />
        <span className="text-xs tracking-[0.2em] uppercase text-[#E2E8F0]/80 group-hover:text-[#E10000] transition-colors hidden sm:inline">Log in</span>
      </Link>
    );
  }

  const initial = (me?.full_name || me?.email || '?')[0].toUpperCase();

  return (
    <div className="relative">
      <button onClick={() => setOpen(o => !o)} className="flex items-center gap-2 px-1.5 py-1 border border-[#1C1010] hover:border-[#E10000] rounded transition-colors" title="Account">
        <div className="w-7 h-7 rounded-full bg-[#E10000]/20 flex items-center justify-center font-bold text-xs text-[#E2E8F0] border border-[#1C1010]">{initial}</div>
      </button>
      <AnimatePresence>
        {open && (
          <>
            <div className="fixed inset-0 z-[60]" onClick={() => setOpen(false)} />
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="absolute right-0 top-full mt-2 w-56 glass border border-[#1C1010] rounded-sm shadow-xl z-[70] p-3"
            >
              <p className="text-[10px] text-[#E2E8F0]/50 uppercase tracking-[0.2em]">Signed in as</p>
              <p className="text-sm text-[#E2E8F0] font-bold truncate mt-0.5">{me?.full_name || me?.email}</p>
              <Link to="/Profile" onClick={() => setOpen(false)} className="block mt-3 text-xs text-[#E2E8F0]/70 hover:text-[#E10000] transition-colors">Your Profile</Link>
              <Link to="/Leaderboard" onClick={() => setOpen(false)} className="block mt-1 text-xs text-[#E2E8F0]/70 hover:text-[#E10000] transition-colors">Your Leaderboard Rank</Link>
              <button
                onClick={async () => { await base44.auth.logout(); window.location.href = '/'; }}
                className="mt-2 w-full flex items-center gap-2 text-xs text-[#E10000] hover:underline pt-2 border-t border-[#1C1010]"
              >
                <LogOut className="w-3.5 h-3.5" /> Log out
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}