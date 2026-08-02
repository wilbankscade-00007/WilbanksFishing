import React, { useState, useEffect } from 'react';
import {
  Users, Activity, Clock, Zap, Mail, ShoppingCart, DollarSign,
  RefreshCw, Fish, MessageSquare, Heart, ThumbsUp, CheckCircle,
  Image, Video, Trophy, Eye,
} from 'lucide-react';
import {
  ResponsiveContainer, AreaChart, Area, BarChart, Bar, XAxis, YAxis,
  Tooltip, CartesianGrid, PieChart, Pie, Cell, Legend,
} from 'recharts';
import { base44 } from '@/api/base44Client';

const STALE_MS = 45 * 1000;
const OWNER_EMAIL = 'wilbankscade@gmail.com';

function dayKey(d) { const x = new Date(d); x.setHours(0, 0, 0, 0); return x.getTime(); }
function lastNDays(n) {
  const days = [];
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(); d.setHours(0, 0, 0, 0); d.setDate(d.getDate() - i);
    days.push(d);
  }
  return days;
}
function bucketByDay(items, dateField, days) {
  const map = {};
  days.forEach(d => { map[d.getTime()] = 0; });
  (items || []).forEach(it => {
    const t = it[dateField]; if (!t) return;
    const k = dayKey(t);
    if (k in map) map[k]++;
  });
  return days.map(d => ({ date: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }), count: map[d.getTime()] }));
}
function fmtDuration(ms) {
  if (!ms || ms < 0) return '0s';
  const s = Math.round(ms / 1000);
  const m = Math.floor(s / 60);
  if (m >= 60) { const h = Math.floor(m / 60); return `${h}h ${m % 60}m`; }
  return m > 0 ? `${m}m ${s % 60}s` : `${s}s`;
}
function withinDays(date, n) {
  if (!date) return false;
  return Date.now() - new Date(date).getTime() < n * 24 * 3600 * 1000;
}
// Convert a 2-letter country code (ISO-3166) into its flag emoji
function flagEmoji(code) {
  if (!code || code.length !== 2) return '📍';
  const cc = code.toUpperCase();
  const A = 0x1F1E6;
  return String.fromCodePoint(A + (cc.charCodeAt(0) - 65), A + (cc.charCodeAt(1) - 65));
}

function MiniStat({ icon: Icon, label, value, sub }) {
  return (
    <div className="p-3 border border-[#1C1010] rounded-sm bg-[#0A0A0A]/40">
      <div className="flex items-center gap-2 mb-1.5">
        <Icon className="w-3.5 h-3.5 text-[#E10000]" />
        <span className="text-[9px] uppercase tracking-[0.18em] text-[#E2E8F0]/50">{label}</span>
      </div>
      <p className="font-heading text-2xl text-[#E2E8F0] leading-none">{value}</p>
      {sub && <p className="text-[10px] text-[#E2E8F0]/40 mt-1">{sub}</p>}
    </div>
  );
}

const TT = {
  contentStyle: { background: '#0A0A0A', border: '1px solid #E10000', borderRadius: '2px', fontSize: '12px' },
  labelStyle: { color: '#E2E8F0' },
  itemStyle: { color: '#E2E8F0' },
};
const PIE_COLORS = ['#E10000', '#FF4D4D', '#7F1D1D', '#9F1239', '#92400E'];

export default function ProfileStats() {
  const [data, setData] = useState(null);
  const [recentUsers, setRecentUsers] = useState([]);
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = async (soft = false) => {
    if (soft) setRefreshing(true); else setLoading(true);
    try {
      const [
        users, reactions, messages, sessions, subs, orders,
        leaders, videos, catches, gallery, marquee2, comments,
      ] = await Promise.all([
        base44.entities.User.list('-created_date', 500).catch(() => []),
        base44.entities.Reaction.list('-created_date', 500).catch(() => []),
        base44.entities.ChatMessage.list('-created_date', 500).catch(() => []),
        base44.entities.ActiveSession.list().catch(() => []),
        base44.entities.NewsletterSubscriber.list().catch(() => []),
        base44.entities.Order.list('-created_date', 100).catch(() => []),
        base44.entities.LeaderboardEntry.list().catch(() => []),
        base44.entities.Video.list().catch(() => []),
        base44.entities.CatchPhoto.list().catch(() => []),
        base44.entities.CatchGalleryPhoto.list().catch(() => []),
        base44.entities.PhotoMarquee2.list().catch(() => []),
        base44.entities.Comment.list().catch(() => []),
      ]);

      const breakdown = { emoji_shout: 0, catch_vote: 0, video_reaction: 0, checkin: 0, chat: 0 };
      (reactions || []).forEach(r => { if (breakdown[r.target_type] !== undefined) breakdown[r.target_type]++; });
      breakdown.chat = (messages || []).length;
      const totalInteractions = Object.values(breakdown).reduce((a, b) => a + b, 0);

      const durations = (sessions || [])
        .filter(s => s.last_seen && s.created_date)
        .map(s => new Date(s.last_seen).getTime() - new Date(s.created_date).getTime())
        .filter(d => d >= 0 && d < 24 * 3600 * 1000);
      const avgMs = durations.length ? durations.reduce((a, b) => a + b, 0) / durations.length : 0;
      const totalMs = durations.reduce((a, b) => a + b, 0);
      const liveSessions = (sessions || []).filter(s => s.last_seen && (Date.now() - new Date(s.last_seen).getTime()) < STALE_MS);
      const liveCount = liveSessions.length;
      const revenue = (orders || []).reduce((sum, o) => sum + (o.total || 0), 0);

      // Geo breakdown of currently-live visitors
      const liveVisitors = liveSessions
        .filter(s => s.country || s.region || s.city)
        .map(s => ({
          country: s.country || 'Unknown',
          country_code: s.country_code || '',
          region: s.region || '',
          city: s.city || '',
        }));
      const byCountry = {};
      liveVisitors.forEach(v => { byCountry[v.country] = (byCountry[v.country] || 0) + 1; });
      const countryChips = Object.entries(byCountry).sort((a, b) => b[1] - a[1]);

      const days = lastNDays(14);
      const signupsByDay = bucketByDay(users, 'created_date', days);
      const interactionsByDay = bucketByDay([...(reactions || []), ...(messages || [])], 'created_date', days);
      const pieData = [
        { name: 'Crew Shouts', value: breakdown.emoji_shout },
        { name: 'Chat Msgs', value: breakdown.chat },
        { name: 'Catch Votes', value: breakdown.catch_vote },
        { name: 'Video Reactions', value: breakdown.video_reaction },
        { name: 'Check-ins', value: breakdown.checkin },
      ].filter(p => p.value > 0);

      setData({
        liveUsers: liveCount,
        totalUsers: (users || []).length,
        newSignups7d: (users || []).filter(u => withinDays(u.created_date, 7)).length,
        newSignups30d: (users || []).filter(u => withinDays(u.created_date, 30)).length,
        totalSessions: (sessions || []).length,
        avgSession: avgMs, totalTime: totalMs,
        totalInteractions, breakdown,
        subscribers: (subs || []).length,
        orders: (orders || []).length, revenue,
        leaders: (leaders || []).length,
        videos: (videos || []).length,
        catches: (catches || []).length,
        gallery: (gallery || []).length,
        marquee2: (marquee2 || []).length,
        comments: (comments || []).length,
        signupsByDay, interactionsByDay, pieData,
        liveVisitors, countryChips,
      });
      setRecentUsers((users || []).slice(0, 5));
      setRecentOrders((orders || []).slice(0, 5));
    } catch (e) {
      console.error('ProfileStats load failed:', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { load(); }, []);

  if (loading) {
    return (
      <div className="border border-[#E10000]/30 rounded-sm bg-[#0A0A0A]/40 p-6 mb-8">
        <div className="flex items-center gap-2 mb-4">
          <Zap className="w-4 h-4 text-[#E10000]" />
          <h2 className="font-heading text-lg text-[#E2E8F0] uppercase">Website Analytics</h2>
        </div>
        <div className="flex justify-center py-6"><RefreshCw className="w-5 h-5 animate-spin text-[#E10000]" /></div>
      </div>
    );
  }

  return (
    <div className="border border-[#E10000]/30 rounded-sm bg-[#0A0A0A]/40 p-5 mb-8">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <Zap className="w-4 h-4 text-[#E10000]" />
          <h2 className="font-heading text-lg text-[#E2E8F0] uppercase">Website Analytics</h2>
          <span className="text-[9px] uppercase tracking-[0.2em] text-[#E10000]/70 border border-[#E10000]/40 px-1.5 py-0.5 rounded-sm">Admin</span>
        </div>
        <button onClick={() => load(true)} disabled={refreshing}
          className="flex items-center gap-1.5 px-3 py-1.5 border border-[#1C1010] hover:border-[#E10000] rounded-sm text-[10px] uppercase tracking-wider text-[#E2E8F0]/70 transition-colors disabled:opacity-50">
          <RefreshCw className={`w-3 h-3 ${refreshing ? 'animate-spin' : ''}`} /> Refresh
        </button>
      </div>

      <div className="flex items-center gap-3 p-3 border border-[#E10000]/40 rounded-sm bg-[#E10000]/5 mb-4">
        <span className="relative flex h-2.5 w-2.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#E10000] opacity-75" />
          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#E10000]" />
        </span>
        <p className="text-sm text-[#E2E8F0]">{data?.liveUsers ?? 0} <span className="text-[#E2E8F0]/50">live now · {data?.totalSessions ?? 0} total sessions tracked</span></p>
      </div>

      {/* Live visitor locations */}
      <h3 className="text-[10px] uppercase tracking-[0.25em] text-[#E2E8F0]/40 mb-2.5">Where Live Visitors Are From</h3>
      {(data?.liveUsers ?? 0) === 0 ? (
        <p className="text-xs text-[#E2E8F0]/40 py-3 mb-5 text-center border border-[#1C1010] rounded-sm">No live visitors right now.</p>
      ) : (data?.liveVisitors?.length || 0) === 0 ? (
        <p className="text-xs text-[#E2E8F0]/40 py-3 mb-5 text-center border border-[#1C1010] rounded-sm">{data?.liveUsers ?? 0} live visitor(s) — locations not available.</p>
      ) : (
        <div className="mb-5">
          {(data?.countryChips || []).length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-3">
              {data.countryChips.map(([country, count]) => (
                <span key={country} className="text-[10px] uppercase tracking-wider px-2 py-1 rounded-sm border border-[#E10000]/40 bg-[#E10000]/10 text-[#E2E8F0]">
                  {country} <span className="text-[#E10000] font-bold">{count}</span>
                </span>
              ))}
            </div>
          )}
          <div className="border border-[#1C1010] rounded-sm divide-y divide-[#1C1010] max-h-48 overflow-y-auto hide-scrollbar">
            {data.liveVisitors.map((v, i) => (
              <div key={i} className="flex items-center gap-3 px-3 py-2.5">
                <span className="text-base">{v.country_code ? flagEmoji(v.country_code) : '📍'}</span>
                <div className="min-w-0 flex-1">
                  <p className="text-xs text-[#E2E8F0] truncate">{v.city || v.region || v.country}</p>
                  <p className="text-[10px] text-[#E2E8F0]/40 truncate">{[v.region, v.country].filter(Boolean).join(', ')}</p>
                </div>
                <span className="relative flex h-2 w-2 shrink-0">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#E10000] opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-[#E10000]" />
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* People & engagement */}
      <h3 className="text-[10px] uppercase tracking-[0.25em] text-[#E2E8F0]/40 mb-2.5">People & Engagement</h3>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5 mb-5">
        <MiniStat icon={Users} label="Members" value={data?.totalUsers ?? 0} sub={`${data?.newSignups7d ?? 0} new / 7d`} />
        <MiniStat icon={Users} label="Signups 30d" value={data?.newSignups30d ?? 0} />
        <MiniStat icon={Eye} label="Sessions" value={data?.totalSessions ?? 0} />
        <MiniStat icon={Clock} label="Avg Session" value={fmtDuration(data?.avgSession)} sub={`Total ${fmtDuration(data?.totalTime)}`} />
        <MiniStat icon={Activity} label="Interactions" value={data?.totalInteractions ?? 0} sub="all-time" />
        <MiniStat icon={Fish} label="Crew Shouts" value={data?.breakdown?.emoji_shout ?? 0} />
        <MiniStat icon={MessageSquare} label="Chat Msgs" value={data?.breakdown?.chat ?? 0} />
        <MiniStat icon={Heart} label="Video Reactions" value={data?.breakdown?.video_reaction ?? 0} />
        <MiniStat icon={ThumbsUp} label="Catch Votes" value={data?.breakdown?.catch_vote ?? 0} />
        <MiniStat icon={CheckCircle} label="Check-ins" value={data?.breakdown?.checkin ?? 0} />
      </div>

      {/* Commerce */}
      <h3 className="text-[10px] uppercase tracking-[0.25em] text-[#E2E8F0]/40 mb-2.5">Commerce</h3>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5 mb-5">
        <MiniStat icon={ShoppingCart} label="Orders" value={data?.orders ?? 0} />
        <MiniStat icon={DollarSign} label="Revenue" value={`$${(data?.revenue ?? 0).toFixed(2)}`} />
        <MiniStat icon={Mail} label="Newsletter" value={data?.subscribers ?? 0} />
        <MiniStat icon={Trophy} label="Leaderboard" value={data?.leaders ?? 0} />
      </div>

      {/* Content */}
      <h3 className="text-[10px] uppercase tracking-[0.25em] text-[#E2E8F0]/40 mb-2.5">Content Library</h3>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5 mb-5">
        <MiniStat icon={Video} label="Videos" value={data?.videos ?? 0} />
        <MiniStat icon={MessageSquare} label="Comments" value={data?.comments ?? 0} />
        <MiniStat icon={Image} label="Catch Photos" value={data?.catches ?? 0} />
        <MiniStat icon={Image} label="Gallery Photos" value={data?.gallery ?? 0} />
        <MiniStat icon={Image} label="Marquee 2" value={data?.marquee2 ?? 0} />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mb-5">
        <div className="p-3 border border-[#1C1010] rounded-sm">
          <h4 className="text-[10px] uppercase tracking-[0.2em] text-[#E2E8F0]/60 mb-3">New Signups — 14 Days</h4>
          <ResponsiveContainer width="100%" height={170}>
            <AreaChart data={data?.signupsByDay || []} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
              <defs>
                <linearGradient id="psSignup" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#E10000" stopOpacity={0.7} />
                  <stop offset="100%" stopColor="#E10000" stopOpacity={0.05} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1C1010" />
              <XAxis dataKey="date" stroke="#7F1D1D" tick={{ fontSize: 9 }} />
              <YAxis stroke="#7F1D1D" tick={{ fontSize: 9 }} allowDecimals={false} />
              <Tooltip {...TT} />
              <Area type="monotone" dataKey="count" stroke="#E10000" strokeWidth={2} fill="url(#psSignup)" name="Signups" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="p-3 border border-[#1C1010] rounded-sm">
          <h4 className="text-[10px] uppercase tracking-[0.2em] text-[#E2E8F0]/60 mb-3">Interactions — 14 Days</h4>
          <ResponsiveContainer width="100%" height={170}>
            <BarChart data={data?.interactionsByDay || []} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1C1010" />
              <XAxis dataKey="date" stroke="#7F1D1D" tick={{ fontSize: 9 }} />
              <YAxis stroke="#7F1D1D" tick={{ fontSize: 9 }} allowDecimals={false} />
              <Tooltip {...TT} />
              <Bar dataKey="count" fill="#E10000" name="Interactions" radius={[2, 2, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {(data?.pieData?.length || 0) > 0 && (
        <div className="p-3 border border-[#1C1010] rounded-sm mb-5">
          <h4 className="text-[10px] uppercase tracking-[0.2em] text-[#E2E8F0]/60 mb-3">Interaction Breakdown</h4>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={data.pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label={{ fill: '#E2E8F0', fontSize: 10 }}>
                {data.pieData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
              </Pie>
              <Tooltip {...TT} />
              <Legend wrapperStyle={{ fontSize: 10, color: '#E2E8F0' }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Recent activity lists */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <h4 className="text-[10px] uppercase tracking-[0.2em] text-[#E2E8F0]/60 mb-2.5">Newest Members</h4>
          {recentUsers.length === 0 ? (
            <p className="text-[#E2E8F0]/40 text-xs py-4 text-center border border-[#1C1010] rounded-sm">No members yet.</p>
          ) : (
            <div className="border border-[#1C1010] rounded-sm divide-y divide-[#1C1010]">
              {recentUsers.map(u => (
                <div key={u.id} className="flex items-center justify-between gap-2 px-3 py-2.5">
                  <div className="min-w-0">
                    <p className="text-xs text-[#E2E8F0] truncate">{u.full_name || u.email || 'Unknown'}</p>
                    <p className="text-[10px] text-[#E2E8F0]/40 truncate">{u.email}</p>
                  </div>
                  <p className="text-[10px] text-[#E2E8F0]/40 whitespace-nowrap">{u.created_date ? new Date(u.created_date).toLocaleDateString() : ''}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        <div>
          <h4 className="text-[10px] uppercase tracking-[0.2em] text-[#E2E8F0]/60 mb-2.5">Recent Orders</h4>
          {recentOrders.length === 0 ? (
            <p className="text-[#E2E8F0]/40 text-xs py-4 text-center border border-[#1C1010] rounded-sm">No orders yet.</p>
          ) : (
            <div className="border border-[#1C1010] rounded-sm divide-y divide-[#1C1010]">
              {recentOrders.map(o => (
                <div key={o.id} className="flex items-center justify-between gap-2 px-3 py-2.5">
                  <div className="min-w-0">
                    <p className="text-xs text-[#E2E8F0] truncate">{o.buyer_name || o.buyer_email || 'Unknown buyer'}</p>
                    <p className="text-[10px] text-[#E2E8F0]/40">{(o.items || []).length} item(s) · {new Date(o.created_date).toLocaleDateString()}</p>
                  </div>
                  <p className="text-xs font-mono text-[#E10000]">${(o.total || 0).toFixed(2)}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}