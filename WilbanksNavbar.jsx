import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingBag, Menu, X, Home as HomeIcon, Youtube, Trophy, Film, Lightbulb, Users, User, Info, ChevronRight, MessagesSquare, Fish } from 'lucide-react';
import { useCart } from './CartContext';
import NotificationBell from './NotificationBell';
import ActiveUsersCounter from './ActiveUsersCounter';
import AccountButton from './AccountButton';
import { Link } from 'react-router-dom';

const LOGO_URL = 'https://media.base44.com/images/public/user_6a5139050a134ea1f78df45c/504f27ec4_ChatGPTImageJul10202608_14_06AM.png';

const MENU = [
  { type: 'item', to: '/', label: 'Home', icon: HomeIcon, desc: 'The latest from the channel' },
  { type: 'group', label: 'Watch', icon: Youtube, items: [
    { to: '/YouTube', label: 'YouTube', icon: Youtube, desc: 'Videos & live channel stats' },
    { to: '/BehindTheScenes', label: 'Behind the Scenes', icon: Film, desc: 'Off-camera moments' },
  ]},
  { type: 'group', label: 'Community', icon: Users, items: [
    { to: '/Community', label: 'Community Hub', icon: MessagesSquare, desc: 'Vote, check in & react' },
    { to: '/Leaderboard', label: 'Leaderboard', icon: Trophy, desc: 'Climb the fan rankings' },
    { to: '/CatchBoard', label: 'Catch Board', icon: Fish, desc: 'Your personal catch dashboard' },
  ]},
  { type: 'item', to: '/Tips', label: 'Learn', icon: Lightbulb, desc: 'Tactics & how-tos' },
  { type: 'item', to: '/Shop', label: 'Shop', icon: ShoppingBag, desc: 'WilbanksFishing merch' },
  { type: 'group', label: 'The Brand', icon: Info, items: [
    { to: '/Sponsors', label: 'Sponsors', icon: Users, desc: 'The brands behind us' },
    { to: '/About', label: 'About', icon: Info, desc: 'Our story' },
  ]},
  { type: 'item', to: '/Profile', label: 'Profile', icon: User, desc: 'Your rank, purchases & alerts' },
];

export default function WilbanksNavbar() {
  const { totalItems, openCart } = useCart();
  const [menuOpen, setMenuOpen] = useState(false);
  const [openGroup, setOpenGroup] = useState(null);

  return (
    <>
      <motion.header
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="fixed top-0 left-0 right-0 z-50 glass border-b border-[#1C1010]"
      >
        <nav className="relative flex items-center justify-between px-6 md:px-12 py-4">
          <div className="flex items-center gap-3 z-10">
            <Link to="/" className="flex items-center gap-3">
              <img src={LOGO_URL} alt="WilbanksFishing" className="h-9 w-auto object-contain" />
            </Link>
            <ActiveUsersCounter />
          </div>

          <button
            onClick={() => setMenuOpen(true)}
            className="hidden md:flex absolute left-1/2 -translate-x-1/2 items-center gap-2.5 px-6 py-2.5 rounded-full border border-[#E10000]/60 bg-gradient-to-r from-[#E10000]/15 via-[#1C1010]/40 to-[#E10000]/15 hover:from-[#E10000]/25 hover:to-[#E10000]/25 hover:border-[#E10000] shadow-[0_0_18px_rgba(225,0,0,0.35)] hover:shadow-[0_12px_30px_rgba(225,0,0,0.6)] hover:-translate-y-0.5 transition-all group"
          >
            <span className="relative flex">
              <Menu className="w-4 h-4 text-[#E10000] group-hover:scale-110 transition-transform" />
              <span className="absolute -top-1 -right-1 flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#E10000] opacity-60" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#E10000]" />
              </span>
            </span>
            <span className="text-xs font-bold tracking-[0.3em] uppercase text-[#E2E8F0] group-hover:text-white text-glow transition-colors">Explore Pages</span>
            <ChevronRight className="w-3.5 h-3.5 text-[#E10000] group-hover:translate-x-1 transition-all" />
          </button>

          <div className="flex items-center gap-2 md:gap-4 z-10">
            <button
              onClick={() => setMenuOpen(true)}
              className="md:hidden relative flex items-center gap-2 px-4 py-2 rounded-full border border-[#E10000]/60 bg-[#E10000]/15 shadow-[0_0_15px_rgba(225,0,0,0.3)] text-[#E2E8F0] transition-all hover:-translate-y-0.5 hover:shadow-[0_10px_24px_rgba(225,0,0,0.45)]"
              aria-label="Open menu"
            >
              <span className="relative flex">
                <Menu className="w-4 h-4 text-[#E10000]" />
                <span className="absolute -top-1 -right-1 flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#E10000] opacity-60" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-[#E10000]" />
                </span>
              </span>
              <span className="text-[10px] font-bold tracking-[0.25em] uppercase">Menu</span>
            </button>
            <NotificationBell />
            <AccountButton />
            <button
              onClick={openCart}
              className="relative flex items-center gap-2 px-4 py-2 border border-[#1C1010] hover:border-[#E10000] rounded transition-all hover:-translate-y-0.5 hover:shadow-[0_10px_24px_rgba(225,0,0,0.45)] group"
            >
              <ShoppingBag className="w-4 h-4 text-[#E2E8F0] group-hover:text-[#E10000] group-hover:scale-110 group-hover:drop-shadow-[0_4px_10px_rgba(225,0,0,0.55)] transition-all duration-300" />
              <span className="text-xs tracking-[0.2em] uppercase text-[#E2E8F0]/80 group-hover:text-[#E10000] transition-colors hidden sm:inline">
                Tackle Box
              </span>
              <AnimatePresence>
                {totalItems > 0 && (
                  <motion.span
                    key={totalItems}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                    className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-[#E10000] text-white text-[10px] font-bold flex items-center justify-center bio-glow"
                  >
                    {totalItems}
                  </motion.span>
                )}
              </AnimatePresence>
            </button>
          </div>
        </nav>
      </motion.header>

      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] bg-[#0A0A0A]/95 backdrop-blur-xl flex flex-col"
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#1C1010]">
              <img src={LOGO_URL} alt="WilbanksFishing" className="h-9 w-auto object-contain" />
              <button onClick={() => setMenuOpen(false)} className="text-[#E2E8F0]/60 hover:text-[#E10000] transition-colors">
                <X className="w-7 h-7" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto px-6 py-8">
              <p className="text-[10px] tracking-[0.4em] uppercase text-[#E10000] mb-6">Explore the Channel</p>
              <div className="space-y-1">
                {MENU.map((entry, i) => {
                  if (entry.type === 'item') {
                    const Icon = entry.icon;
                    return (
                      <motion.div key={entry.to} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.04 }}>
                        <Link to={entry.to} onClick={() => setMenuOpen(false)} className="group [perspective:800px] flex items-center gap-4 p-4 rounded-sm border border-transparent hover:border-[#E10000]/40 hover:bg-[#E10000]/5 transition-all">
                          <span className="font-mono text-xs text-[#E2E8F0]/30 w-6">{String(i + 1).padStart(2, '0')}</span>
                          <div className="w-11 h-11 rounded-full border border-[#1C1010] bg-gradient-to-b from-[#2A1410] to-[#0E0808] flex items-center justify-center [transform-style:preserve-3d] transition-all duration-300 ease-out group-hover:border-[#E10000] group-hover:from-[#E10000]/30 group-hover:to-[#1C1010]/40 group-hover:[transform:rotateX(-14deg)_rotateY(14deg)_scale(1.12)] group-hover:shadow-[0_12px_26px_rgba(225,0,0,0.55)]">
                            <Icon className="w-5 h-5 text-[#E2E8F0]/70 group-hover:text-[#E10000] group-hover:scale-110 transition-all duration-300 [transform:translateZ(8px)]" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-heading font-bold text-xl text-[#E2E8F0] uppercase tracking-wide group-hover:text-[#E10000] transition-colors">{entry.label}</p>
                            <p className="text-xs text-[#E2E8F0]/40">{entry.desc}</p>
                          </div>
                          <ChevronRight className="w-5 h-5 text-[#E2E8F0]/20 group-hover:text-[#E10000] group-hover:translate-x-1 transition-all" />
                        </Link>
                      </motion.div>
                    );
                  }
                  const GroupIcon = entry.icon;
                  const isOpen = openGroup === entry.label;
                  return (
                    <div key={entry.label}>
                      <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.04 }}>
                        <button onClick={() => setOpenGroup(isOpen ? null : entry.label)} className="group w-full [perspective:800px] flex items-center gap-4 p-4 rounded-sm border border-transparent hover:border-[#E10000]/40 hover:bg-[#E10000]/5 transition-all">
                          <span className="font-mono text-xs text-[#E2E8F0]/30 w-6">{String(i + 1).padStart(2, '0')}</span>
                          <div className="w-11 h-11 rounded-full border border-[#1C1010] bg-gradient-to-b from-[#2A1410] to-[#0E0808] flex items-center justify-center [transform-style:preserve-3d] transition-all duration-300 ease-out group-hover:border-[#E10000] group-hover:from-[#E10000]/30 group-hover:to-[#1C1010]/40 group-hover:[transform:rotateX(-14deg)_rotateY(14deg)_scale(1.12)] group-hover:shadow-[0_12px_26px_rgba(225,0,0,0.55)]">
                            <GroupIcon className="w-5 h-5 text-[#E2E8F0]/70 group-hover:text-[#E10000] group-hover:scale-110 transition-all duration-300 [transform:translateZ(8px)]" />
                          </div>
                          <div className="flex-1 min-w-0 text-left">
                            <p className="font-heading font-bold text-xl text-[#E2E8F0] uppercase tracking-wide group-hover:text-[#E10000] transition-colors">{entry.label}</p>
                            <p className="text-xs text-[#E2E8F0]/40">{entry.items.length} pages · tap to expand</p>
                          </div>
                          <ChevronRight className={`w-5 h-5 text-[#E2E8F0]/40 group-hover:text-[#E10000] transition-all duration-300 ${isOpen ? 'rotate-90' : ''}`} />
                        </button>
                      </motion.div>
                      <AnimatePresence>
                        {isOpen && (
                          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }} className="overflow-hidden">
                            {entry.items.map((sub) => {
                              const SubIcon = sub.icon;
                              return (
                                <Link key={sub.to} to={sub.to} onClick={() => setMenuOpen(false)} className="group flex items-center gap-3 pl-14 pr-4 py-3 rounded-sm border border-transparent hover:border-[#E10000]/40 hover:bg-[#E10000]/5 transition-all">
                                  <div className="w-9 h-9 rounded-full border border-[#1C1010] bg-gradient-to-b from-[#2A1410] to-[#0E0808] flex items-center justify-center group-hover:border-[#E10000] transition-all">
                                    <SubIcon className="w-4 h-4 text-[#E2E8F0]/70 group-hover:text-[#E10000] transition-colors" />
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <p className="font-heading font-bold text-base text-[#E2E8F0] uppercase tracking-wide group-hover:text-[#E10000] transition-colors">{sub.label}</p>
                                    <p className="text-[11px] text-[#E2E8F0]/40">{sub.desc}</p>
                                  </div>
                                  <ChevronRight className="w-4 h-4 text-[#E2E8F0]/20 group-hover:text-[#E10000] group-hover:translate-x-1 transition-all" />
                                </Link>
                              );
                            })}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                })}
              </div>
            </div>
            <div className="px-6 py-5 border-t border-[#1C1010]">
              <p className="text-[10px] text-[#E2E8F0]/30 tracking-[0.2em] uppercase text-center">Tap any page to dive in</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}