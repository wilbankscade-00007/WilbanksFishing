import React, { useState, useEffect, useCallback } from 'react';
import {
  Users, ShoppingCart, DollarSign, Mail, Image, Trophy, Video,
  MessageSquare, RefreshCw, Clock, Activity, Fish, ThumbsUp, Heart, CheckCircle, Zap,
} from 'lucide-react';
import {
  ResponsiveContainer, AreaChart, Area, BarChart, Bar, XAxis, YAxis,
  Tooltip, CartesianGrid, PieChart, Pie, Cell, Legend,
} from 'recharts';
import { base44 } from '@/api/base44Client';

const STALE_MS = 45 * 1000;

function useNow(tick) {
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    if (!tick) return;
    const id = setInterval(() => setNow(Date.now()), tick);
    return () => clearInterval(id);
  }, [tick]);
  return now;
}

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
  const r = s % 60;
  if (m >= 60) { const h = Math.floor(m / 60); return `${h}h ${m % 60}m`; }
  return m > 0 ? `${m}m ${r}s` : `${r}s`;
}
function withinDays(date, n) {
  if (!date) return false;
  return Date.now() - new Date(date).getTime() < n * 24 * 3600 * 1000;
}

function StatCard({ icon: Icon, label, value, sub, accent }) {
  return (
    <div className="p-4 border border-[#1C1010] rounded-sm bg-[#0A0A0A]/40">
      <div className="flex items-center gap-2 mb-2">
        <Icon className={`w-4 h-4 ${accent || 'text-[#E10000]'}`} />
        <span className="text-[10px] uppercase tracking-[0.2em] text-[#E2E8F0]/50">{label}</span>
      </div>
      <p className="font-heading text-3xl text-[#E2E8F0]">{value}</p>
      {sub && <p className="text-[11px] text-[#E2E8F0]/40 mt-1">{sub}</p>}
    </div>
  );
}

function ChartCard({ title, children }) {
  return (
    <div className="p-4 border border-[#1C1010] rounded-sm bg-[#0A0A0A]/40">
      <h4 className="text-xs uppercase tracking-[0.2em] text-[#E2E8F0]/60 mb-4">{title}</h4>
      {children}
    </div>
  );
}

const TOOLTIP_STYLE = {
  contentStyle: { background: '#0A0A0A', border: '1px solid #E10000', borderRadius: '2px', fontSize: '12px' },
  labelStyle: { color: '#E2E8F0' },
  itemStyle: { color: '#E2E8F0' },
};
const PIE_COLORS = ['#E10000', '#FF4D4D', '#7F1D1D', '#9F1239', '#92400E'];

export default function StatsTab() {
  const [data, setData] = useState(null);
  const [orders, setOrders] = useState([]);
  const [recentUsers, setRecentUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);
  const now = useNow(5000);

  const load = useCallback(async (soft = false) => {
    if (soft) setRefreshing(true); else setLoading(true);
    try {
      const [
        users, reactions, messages, sessions, subs, ordersList,
        leaders, videos, catches, gallery, marquee2, comments, products,
      ] = await Promise.all([
        base44.entities.User.list('-created_date', 500).catch(() => []),
        base44.entities.Reaction.list('-created_date', 500).catch(() => []),
        base44.entities.ChatMessage.list('-created_date', 500).catch(() => []),
        base44.entities.ActiveSession.list().catch(() => []),
        base44.entities.NewsletterSubscriber.list().catch(() => []),
        base44.entities.Order.list('-created_date', 50).catch(() => []),
        base44.entities.LeaderboardEntry.list().catch(() => []),
        base44.entities.Video.list().catch(() => []),
        base44.entities.CatchPhoto.list().catch(() => []),
        base44.entities.CatchGalleryPhoto.list().catch(() => []),
        base44.entities.PhotoMarquee2.list().catch(() => []),
        base44.entities.Comment.list().catch(() => []),
        base44.entities.Product.list().catch(() => []),
      ]);

      const liveCount = (sessions || []).filter(s => s.last_seen && (now - new Date(s.last_seen).getTime()) < STALE_MS).length;
      const revenue = (ordersList || []).reduce((sum, o) => sum + (o.total || 0), 0);

      // Interactions breakdown
      const breakdown = { emoji_shout: 0, catch_vote: 0, video_reaction: 0, checkin: 0, chat: 0 };
      (reactions || []).forEach(r => { if (breakdown[r.target_type] !== undefined) breakdown[r.target_type]++; });
      breakdown.chat = (messages || []).length;
      const totalInteractions = Object.values(breakdown).reduce((a, b) => a + b, 0);

      // Time spent (session duration = last_seen - created_date)
      const durations = (sessions || [])
        .filter(s => s.last_seen && s.created_date)
        .map(s => new Date(s.last_seen).getTime() - new Date(s.created_date).getTime())
        .filter(d => d >= 0 && d < 24 * 3600 * 1000);
      const avgMs = durations.length ? durations.reduce((a, b) => a + b, 0) / durations.length : 0;
      const totalMs = durations.reduce((a, b) => a + b, 0);

      // Charts
      const days = lastNDays(14);
      const signupsByDay = bucketByDay(users, 'created_date', days);
      const allInteractions = [...(reactions || []), ...(messages || [])];
      const interactionsByDay = bucketByDay(allInteractions, 'created_date', days);
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
        avgSession: avgMs,
        totalTime: totalMs,
        totalInteractions,
        breakdown,
        revenue,
        orders: (ordersList || []).length,
        subscribers: (subs || []).length,
        products: (products || []).length,
        leaders: (leaders || []).length,
        videos: (videos || []).length,
        catches: (catches || []).length,
        gallery: (gallery || []).length,
        marquee2: (marquee2 || []).length,
        comments: (comments || []).length,
        signupsByDay, interactionsByDay, pieData,
      });
      setOrders((ordersList || []).slice(0, 8));
      setRecentUsers((users || []).slice(0, 6));
      setLastUpdated(new Date());
    } catch (e) {
      console.error('Stats load failed:', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [now]);

  useEffect(() => { load(); }, []);

  if (loading && !data) {
    return <div className="text-center py-8"><RefreshCw className="w-6 h-6 animate-spin text-[#E10000] mx-auto" /></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-heading text-xl text-[#E2E8F0] uppercase">Site Analytics</h3>
          <p className="text-xs text-[#E2E8F0]/40 mt-1">
            {lastUpdated ? `Updated ${lastUpdated.toLocaleTimeString()}` : 'Loading…'}
          </p>
        </div>
        <button
          onClick={() => load(true)}
          disabled={refreshing}
          className="flex items-center gap-2 px-4 py-2 border border-[#1C1010] hover:border-[#E10000] rounded-sm text-xs uppercase tracking-wider text-[#E2E8F0] transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} /> Refresh
        </button>
      </div>

      <div className="flex items-center gap-3 p-4 border border-[#E10000]/40 rounded-sm bg-[#E10000]/5">
        <span className="relative flex h-3 w-3">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#E10000] opacity-75" />
          <span className="relative inline-flex rounded-full h-3 w-3 bg-[#E10000]" />
        </span>
        <div>
          <p className="font-heading text-2xl text-[#E2E8F0]">{data?.liveUsers ?? 0} <span className="text-sm text-[#E2E8F0]/50 font-body">live now</span></p>
          <p className="text-[11px] text-[#E2E8F0]/40">Active visitors in the last 45 seconds</p>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        <StatCard icon={Users} label="Total Members" value={data?.totalUsers ?? 0} sub={`${data?.newSignups7d ?? 0} new this week`} />
        <StatCard icon={Zap} label="New Signups (30d)" value={data?.newSignups30d ?? 0} sub={`${data?.newSignups7d ?? 0} in last 7 days`} />
        <StatCard icon={Activity} label="Interactions" value={data?.totalInteractions ?? 0} sub="all-time" />
        <StatCard icon={Clock} label="Avg. Session" value={fmtDuration(data?.avgSession)} sub={`Total ${fmtDuration(data?.totalTime)}`} />
        <StatCard icon={ShoppingCart} label="Orders" value={data?.orders ?? 0} />
        <StatCard icon={DollarSign} label="Revenue" value={`$${(data?.revenue ?? 0).toFixed(2)}`} />
        <StatCard icon={Mail} label="Newsletter" value={data?.subscribers ?? 0} />
        <StatCard icon={Trophy} label="Leaderboard" value={data?.leaders ?? 0} />
        <StatCard icon={MessageSquare} label="Chat Msgs" value={data?.breakdown?.chat ?? 0} />
        <StatCard icon={Fish} label="Crew Shouts" value={data?.breakdown?.emoji_shout ?? 0} />
        <StatCard icon={Heart} label="Video Reactions" value={data?.breakdown?.video_reaction ?? 0} />
        <StatCard icon={ThumbsUp} label="Catch Votes" value={data?.breakdown?.catch_vote ?? 0} />
        <StatCard icon={CheckCircle} label="Check-ins" value={data?.breakdown?.checkin ?? 0} />
        <StatCard icon={Image} label="Catch Photos" value={data?.catches ?? 0} />
        <StatCard icon={Image} label="Gallery Photos" value={data?.gallery ?? 0} />
        <StatCard icon={Video} label="Videos" value={data?.videos ?? 0} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        <ChartCard title="New Signups — Last 14 Days">
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={data?.signupsByDay || []} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="signupGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#E10000" stopOpacity={0.7} />
                  <stop offset="100%" stopColor="#E10000" stopOpacity={0.05} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1C1010" />
              <XAxis dataKey="date" stroke="#7F1D1D" tick={{ fontSize: 10 }} />
              <YAxis stroke="#7F1D1D" tick={{ fontSize: 10 }} allowDecimals={false} />
              <Tooltip {...TOOLTIP_STYLE} />
              <Area type="monotone" dataKey="count" stroke="#E10000" strokeWidth={2} fill="url(#signupGrad)" name="Signups" />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Interactions — Last 14 Days">
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={data?.interactionsByDay || []} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1C1010" />
              <XAxis dataKey="date" stroke="#7F1D1D" tick={{ fontSize: 10 }} />
              <YAxis stroke="#7F1D1D" tick={{ fontSize: 10 }} allowDecimals={false} />
              <Tooltip {...TOOLTIP_STYLE} />
              <Bar dataKey="count" fill="#E10000" name="Interactions" radius={[2, 2, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {(data?.pieData?.length || 0) > 0 && (
        <ChartCard title="Interaction Breakdown">
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie data={data.pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90} label={{ fill: '#E2E8F0', fontSize: 11 }}>
                {data.pieData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
              </Pie>
              <Tooltip {...TOOLTIP_STYLE} />
              <Legend wrapperStyle={{ fontSize: 11, color: '#E2E8F0' }} />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <h4 className="text-sm uppercase tracking-wider text-[#E2E8F0]/60 mb-3">Newest Members</h4>
          {recentUsers.length === 0 ? (
            <p className="text-[#E2E8F0]/40 text-sm py-6 text-center border border-[#1C1010] rounded-sm">No members yet.</p>
          ) : (
            <div className="border border-[#1C1010] rounded-sm divide-y divide-[#1C1010]">
              {recentUsers.map(u => (
                <div key={u.id} className="flex items-center justify-between gap-3 px-4 py-3">
                  <div className="min-w-0">
                    <p className="text-sm text-[#E2E8F0] truncate">{u.full_name || u.email || 'Unknown'}</p>
                    <p className="text-[11px] text-[#E2E8F0]/40">{u.email || ''}</p>
                  </div>
                  <p className="text-[11px] text-[#E2E8F0]/40 whitespace-nowrap">{u.created_date ? new Date(u.created_date).toLocaleDateString() : ''}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        <div>
          <h4 className="text-sm uppercase tracking-wider text-[#E2E8F0]/60 mb-3">Recent Orders</h4>
          {orders.length === 0 ? (
            <p className="text-[#E2E8F0]/40 text-sm py-6 text-center border border-[#1C1010] rounded-sm">No orders yet.</p>
          ) : (
            <div className="border border-[#1C1010] rounded-sm divide-y divide-[#1C1010]">
              {orders.map(o => (
                <div key={o.id} className="flex items-center justify-between gap-3 px-4 py-3">
                  <div className="min-w-0">
                    <p className="text-sm text-[#E2E8F0] truncate">{o.buyer_name || o.buyer_email || 'Unknown buyer'}</p>
                    <p className="text-[11px] text-[#E2E8F0]/40">{(o.items || []).length} item(s) · {new Date(o.created_date).toLocaleDateString()}</p>
                  </div>
                  <p className="text-sm font-mono text-[#E10000]">${(o.total || 0).toFixed(2)}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}