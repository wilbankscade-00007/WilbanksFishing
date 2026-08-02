import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Loader2, Fish } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import ProfileRank from '@/components/ProfileRank';
import ProfilePurchases from '@/components/ProfilePurchases';
import ProfileNotifications from '@/components/ProfileNotifications';
import ProfileStats from '@/components/ProfileStats';

const OWNER_EMAIL = 'wilbankscade@gmail.com';

export default function Profile() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = async () => {
    setLoading(true); setError('');
    try {
      const res = await base44.functions.invoke('profile-data', {});
      const d = res.data || res;
      if (d.error) throw new Error(d.error);
      setData(d);
    } catch (e) {
      setError(e.message || 'Could not load profile');
    } finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  if (loading) return (
    <div className="min-h-screen bg-[#0A0A0A] pt-24 flex items-center justify-center">
      <Loader2 className="w-8 h-8 animate-spin text-[#E10000]" />
    </div>
  );
  if (error) return (
    <div className="min-h-screen bg-[#0A0A0A] pt-24 flex flex-col items-center justify-center gap-4 px-6 text-center">
      <p className="text-sm text-[#E10000]">{error}</p>
      <button onClick={load} className="px-5 py-2 bg-[#E10000] text-white text-xs uppercase tracking-[0.2em] rounded-sm">Retry</button>
    </div>
  );

  const u = data.user;
  const initial = (u.full_name || u.email || '?')[0].toUpperCase();
  const memberSince = u.created_date ? new Date(u.created_date).toLocaleDateString() : '—';
  const isOwner = (u.email || '').toLowerCase() === OWNER_EMAIL;

  return (
    <div className="min-h-screen bg-[#0A0A0A] pt-24">
      <div className="max-w-4xl mx-auto px-6 md:px-12 py-12">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-10 text-center">
          <span className="text-[10px] tracking-[0.4em] text-[#E10000] uppercase">Your Hub</span>
          <h1 className="font-heading font-extrabold text-4xl sm:text-5xl md:text-7xl text-[#E2E8F0] uppercase leading-[0.9] mt-2">Profile</h1>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
          className="flex items-center gap-4 border border-[#1C1010] rounded-sm p-5 bg-gradient-to-b from-[#1C1010]/40 to-[#0A0A0A] mb-8">
          <div className="w-14 h-14 rounded-full bg-[#E10000]/20 border border-[#E10000]/40 flex items-center justify-center font-bold text-xl text-[#E2E8F0] overflow-hidden shrink-0">
            {u.claimed_avatar_url ? <img src={u.claimed_avatar_url} alt={u.claimed_display_name} className="w-full h-full object-cover" /> : initial}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-bold text-[#E2E8F0] truncate">{u.full_name || u.claimed_display_name || 'Member'}</p>
            <p className="text-xs text-[#E2E8F0]/50 truncate">{u.email}</p>
            <p className="text-[10px] text-[#E2E8F0]/30 tracking-[0.2em] uppercase mt-1">Member since {memberSince}</p>
          </div>
          <Link to="/CatchBoard" className="shrink-0 flex items-center gap-2 px-4 py-2.5 bg-[#E10000] text-white text-[11px] uppercase tracking-[0.2em] rounded-sm hover:bg-[#E10000]/80 transition-all lift-3d">
            <Fish className="w-4 h-4" /> Catch Board
          </Link>
        </motion.div>

        <ProfileRank leaderboard={data.leaderboard} claimed={!!u.claimed_channel_id} />
        {isOwner && <ProfileStats />}
        <ProfilePurchases orders={data.orders} />
        <ProfileNotifications notifications={data.notifications || []} />
      </div>
    </div>
  );
}