import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, LogIn, Fish, Images } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';
import CatchUploadForm from '@/components/catchboard/CatchUploadForm';
import CatchCard from '@/components/catchboard/CatchCard';
import PhotoMarquee from '@/components/PhotoMarquee';
import CatchTracker from '@/components/catchboard/CatchTracker';

export default function CatchBoard() {
  const { user } = useAuth();
  const [catches, setCatches] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try {
      const list = await base44.entities.MemberCatch.list('-created_date', 100);
      setCatches(list || []);
    } catch (e) {} finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  const myCatches = user ? catches.filter((c) => c.author_id === user.id) : [];

  return (
    <div className="min-h-screen bg-[#0A0A0A] pt-24 pb-20">
      <div className="max-w-5xl mx-auto px-6 md:px-12">
        <Link to="/" className="inline-flex items-center gap-2 text-xs tracking-[0.3em] uppercase text-[#E2E8F0]/50 hover:text-[#E10000] transition-colors mb-8">
          <ArrowLeft className="w-4 h-4" /> Back to Home
        </Link>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-10 text-center">
          <span className="text-[10px] tracking-[0.4em] text-[#E10000] uppercase">Your Personal Catch Dashboard</span>
          <h1 className="font-heading font-extrabold text-4xl sm:text-5xl md:text-6xl text-[#E2E8F0] uppercase leading-[0.9] mt-2">Catch Board</h1>
          <p className="text-sm text-[#E2E8F0]/60 mt-4 max-w-md mx-auto">Upload your catches to your own board, then browse the community gallery and talk gear.</p>
        </motion.div>

        {catches.length > 0 && (
          <div className="mb-10">
            <div className="flex items-center gap-2 mb-3">
              <Images className="w-4 h-4 text-[#E10000]" />
              <span className="text-[10px] tracking-[0.3em] uppercase text-[#E2E8F0]/50">Catch Marquee</span>
            </div>
            <PhotoMarquee photos={catches.map((c) => ({ url: c.image_url, caption: c.caption }))} height="h-28 md:h-40" speed={45} seed={3} />
          </div>
        )}

        <CatchTracker catches={catches} />

        {user ? (
          <section className="mb-14">
            <div className="flex items-center gap-2 mb-4">
              <Fish className="w-4 h-4 text-[#E10000]" />
              <h2 className="font-heading font-bold text-lg text-[#E2E8F0] uppercase tracking-wide">My Catch Board</h2>
              <span className="text-xs text-[#E2E8F0]/40 ml-auto">{myCatches.length} {myCatches.length === 1 ? 'catch' : 'catches'}</span>
            </div>
            <CatchUploadForm user={user} onPosted={(c) => setCatches((prev) => [c, ...prev])} />
            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
              {myCatches.length === 0 ? (
                <p className="col-span-full text-center text-[#E2E8F0]/40 text-sm py-8 border border-dashed border-[#1C1010] rounded-sm">Your board is empty — upload your first catch above.</p>
              ) : myCatches.map((c) => (
                <CatchCard key={c.id} catchItem={c} user={user} onDeleted={(id) => setCatches((prev) => prev.filter((x) => x.id !== id))} />
              ))}
            </div>
          </section>
        ) : (
          <section className="mb-14 flex flex-col items-center text-center py-8 px-6 border border-[#1C1010] rounded-sm bg-[#0A0A0A]/60">
            <LogIn className="w-6 h-6 text-[#E10000] mb-2" />
            <p className="text-sm text-[#E2E8F0]/70 mb-3">Log in to start your own Catch Board and post your catches.</p>
            <Link to="/login" className="px-5 py-2 bg-[#E10000] text-white text-[11px] uppercase tracking-[0.2em] rounded-sm hover:bg-[#E10000]/80 transition-all lift-3d">Log In</Link>
          </section>
        )}

        <section>
          <div className="flex items-center gap-2 mb-4">
            <Images className="w-4 h-4 text-[#E10000]" />
            <h2 className="font-heading font-bold text-lg text-[#E2E8F0] uppercase tracking-wide">Community Gallery</h2>
            <span className="text-xs text-[#E2E8F0]/40 ml-auto">{catches.length} {catches.length === 1 ? 'catch' : 'catches'}</span>
          </div>
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[...Array(4)].map((_, i) => <div key={i} className="aspect-video bg-[#1C1010]/50 rounded-sm animate-pulse" />)}
            </div>
          ) : catches.length === 0 ? (
            <div className="text-center py-16">
              <Fish className="w-10 h-10 text-[#E2E8F0]/20 mx-auto mb-3" />
              <p className="text-[#E2E8F0]/40">No catches posted yet. Be the first!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {catches.map((c) => (
                <CatchCard key={c.id} catchItem={c} user={user} onDeleted={(id) => setCatches((prev) => prev.filter((x) => x.id !== id))} />
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}