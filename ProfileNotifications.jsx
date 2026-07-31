import React, { useState } from 'react';
import { Bell, Trophy, Video, Star, Gift, ExternalLink } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { Link } from 'react-router-dom';

const ICONS = { trophy: Trophy, video: Video, star: Star, gift: Gift, bell: Bell };

function timeAgo(iso) {
  if (!iso) return '';
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 60) return m <= 1 ? 'just now' : m + 'm';
  const h = Math.floor(m / 60);
  if (h < 24) return h + 'h';
  const d = Math.floor(h / 24);
  return d + 'd';
}

function Row({ n, children }) {
  const Icon = ICONS[n.icon] || Bell;
  const inner = (
    <div className={`flex items-start gap-3 border rounded-sm p-3 transition-colors ${n.read ? 'border-[#1C1010] bg-[#0A0A0A]/40' : 'border-[#E10000]/40 bg-[#E10000]/5'}`}>
      <div className="w-8 h-8 rounded-full bg-[#1C1010] flex items-center justify-center shrink-0">
        <Icon className="w-4 h-4 text-[#E10000]" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-bold text-[#E2E8F0]">{n.title}</p>
        <p className="text-xs text-[#E2E8F0]/60 mt-0.5">{n.body}</p>
        <p className="text-[10px] text-[#E2E8F0]/30 tracking-[0.15em] uppercase mt-1">{timeAgo(n.created_date)}</p>
      </div>
      {children}
    </div>
  );
  if (!n.link_url) return <div>{inner}</div>;
  return /^https?:/.test(n.link_url)
    ? <a href={n.link_url} target="_blank" rel="noopener noreferrer" className="block">{inner}</a>
    : <Link to={n.link_url} className="block">{inner}</Link>;
}

export default function ProfileNotifications({ notifications }) {
  const [items, setItems] = useState(notifications);
  const [marking, setMarking] = useState(false);
  const unread = items.filter((n) => !n.read).length;

  async function markAllRead() {
    setMarking(true);
    try {
      await base44.functions.invoke('mark-notifications-read', { all: true });
      setItems((prev) => prev.map((n) => ({ ...n, read: true })));
    } catch (_) {} finally { setMarking(false); }
  }

  return (
    <section className="mb-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-heading font-bold text-xl text-[#E2E8F0] uppercase flex items-center gap-2">
          <Bell className="w-4 h-4 text-[#E10000]" /> Notifications
          {unread > 0 && <span className="text-[10px] bg-[#E10000] text-white px-1.5 py-0.5 rounded-full">{unread}</span>}
        </h2>
        {unread > 0 && (
          <button onClick={markAllRead} disabled={marking} className="text-[10px] uppercase tracking-[0.2em] text-[#E10000] hover:underline disabled:opacity-40">
            {marking ? 'Marking…' : 'Mark all read'}
          </button>
        )}
      </div>
      {items.length === 0 ? (
        <div className="border border-dashed border-[#1C1010] rounded-sm p-8 text-center text-sm text-[#E2E8F0]/40">
          No notifications yet. As you climb the leaderboard and new content drops, alerts will appear here.
        </div>
      ) : (
        <div className="space-y-2">
          {items.map((n) => (
            <Row key={n.id} n={n}>
              {n.link_url && /^https?:/.test(n.link_url) && <ExternalLink className="w-3.5 h-3.5 text-[#E2E8F0]/30 shrink-0 mt-1" />}
            </Row>
          ))}
        </div>
      )}
    </section>
  );
}