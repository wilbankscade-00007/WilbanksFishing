import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, X, Trophy, Video, Star, Gift } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { fetchWhatsNewFeed } from '@/lib/whatsNewFeed';
import { base44 } from '@/api/base44Client';
import { Link } from 'react-router-dom';

const ICON_MAP = { trophy: Trophy, video: Video, star: Star, gift: Gift, bell: Bell };

export default function NotificationBell() {
  const [open, setOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [newCount, setNewCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const ref = useRef(null);

  const loadPersonal = useCallback(async (u) => {
    const mine = await base44.entities.Notification.filter({ user_id: u.id }, '-created_date', 20);
    setNotifications(mine || []);
    setNewCount((mine || []).filter((n) => !n.read).length);
  }, []);

  const loadGuest = useCallback(async () => {
    const all = await fetchWhatsNewFeed();
    setNotifications(all.slice(0, 10));
    let lastSeen = localStorage.getItem('wf_notifications_last_seen');
    if (!lastSeen) {
      const newest = all.length ? new Date(all[0].date) : new Date();
      lastSeen = newest.toISOString();
      localStorage.setItem('wf_notifications_last_seen', lastSeen);
    }
    setNewCount(all.filter((n) => new Date(n.date) > new Date(lastSeen)).length);
  }, []);

  useEffect(() => {
    let unsub = null;
    (async () => {
      try {
        const me = await base44.auth.me().catch(() => null);
        setUser(me);
        if (me) {
          await loadPersonal(me);
          unsub = base44.entities.Notification.subscribe(() => loadPersonal(me));
        } else {
          await loadGuest();
        }
      } catch (e) {
        console.error('Failed to fetch notifications', e);
      } finally {
        setLoading(false);
      }
    })();
    return () => { if (unsub) unsub(); };
  }, [loadPersonal, loadGuest]);

  useEffect(() => {
    const handleClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const handleOpen = async () => {
    if (!open) {
      if (user) {
        setNewCount(0);
        try {
          await base44.functions.invoke('mark-notifications-read', { all: true });
          setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
        } catch (e) {
          console.error('Failed to mark notifications read', e);
        }
      } else {
        localStorage.setItem('wf_notifications_last_seen', new Date().toISOString());
        setNewCount(0);
      }
    }
    setOpen(!open);
  };

  const renderPersonal = (n) => {
    const Icon = ICON_MAP[n.icon] || Bell;
    const isInternal = typeof n.link_url === 'string' && n.link_url.startsWith('/');
    const isExternal = typeof n.link_url === 'string' && /^https?:\/\//i.test(n.link_url);
    const Wrapper = isInternal ? Link : isExternal ? 'a' : 'div';
    const wrapperProps = isInternal ? { to: n.link_url } : isExternal ? { href: n.link_url, target: '_blank', rel: 'noopener noreferrer' } : {};
    return (
      <Wrapper
        key={n.id}
        {...wrapperProps}
        onClick={() => setOpen(false)}
        className={`flex items-start gap-3 p-3 hover:bg-[#1C1010]/30 transition-colors ${!n.read ? 'bg-[#E10000]/5' : ''}`}
      >
        <div className="w-8 h-8 rounded-full bg-[#E10000]/10 flex items-center justify-center flex-shrink-0">
          <Icon className="w-4 h-4 text-[#E10000]" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm text-[#E2E8F0] truncate">{n.title}</p>
          {n.body && <p className="text-xs text-[#E2E8F0]/50 mt-1 line-clamp-2">{n.body}</p>}
          {n.created_date && <p className="text-xs text-[#E2E8F0]/40 mt-1">{formatDistanceToNow(new Date(n.created_date), { addSuffix: true })}</p>}
        </div>
        {!n.read && <span className="w-2 h-2 rounded-full bg-[#E10000] mt-2 flex-shrink-0 bio-glow" />}
      </Wrapper>
    );
  };

  const renderGuest = (n, i) => {
    const Icon = n.icon;
    const Wrapper = n.to ? Link : n.url ? 'a' : 'div';
    const wrapperProps = n.to ? { to: n.to } : n.url ? { href: n.url, target: '_blank', rel: 'noopener noreferrer' } : {};
    return (
      <Wrapper
        key={`${n.type}-${i}`}
        {...wrapperProps}
        onClick={() => setOpen(false)}
        className="flex items-start gap-3 p-3 hover:bg-[#1C1010]/30 transition-colors"
      >
        <div className="w-8 h-8 rounded-full bg-[#E10000]/10 flex items-center justify-center flex-shrink-0">
          <Icon className="w-4 h-4 text-[#E10000]" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs text-[#E10000] uppercase tracking-wider">{n.type}</p>
          <p className="text-sm text-[#E2E8F0] truncate">{n.title}</p>
          {n.desc && <p className="text-xs text-[#E2E8F0]/50 mt-1 line-clamp-2">{n.desc}</p>}
          <p className="text-xs text-[#E2E8F0]/40 mt-1">{formatDistanceToNow(new Date(n.date), { addSuffix: true })}</p>
        </div>
      </Wrapper>
    );
  };

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={handleOpen}
        className="relative p-2 text-[#E2E8F0]/80 hover:text-[#E10000] transition-colors"
        aria-label="Notifications"
      >
        <Bell className="w-5 h-5" />
        {newCount > 0 && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#E10000] text-white text-[9px] font-bold flex items-center justify-center bio-glow"
          >
            {newCount > 9 ? '9+' : newCount}
          </motion.span>
        )}
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute right-0 top-full mt-2 w-80 glass border border-[#1C1010] rounded-sm shadow-xl z-[70] max-h-96 overflow-y-auto"
          >
            <div className="p-3 border-b border-[#1C1010] flex items-center justify-between sticky top-0 glass">
              <span className="text-xs uppercase tracking-wider text-[#E2E8F0]/80 font-bold">{user ? 'Notifications' : "What's New"}</span>
              <button onClick={() => setOpen(false)} className="text-[#E2E8F0]/50 hover:text-[#E10000]">
                <X className="w-4 h-4" />
              </button>
            </div>
            {loading ? (
              <div className="p-4 text-center text-sm text-[#E2E8F0]/40">Loading...</div>
            ) : notifications.length === 0 ? (
              <div className="p-4 text-center text-sm text-[#E2E8F0]/40">{user ? 'No notifications yet.' : 'No updates yet.'}</div>
            ) : (
              <div className="divide-y divide-[#1C1010]">
                {user ? notifications.map(renderPersonal) : notifications.map(renderGuest)}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}