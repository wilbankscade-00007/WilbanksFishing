import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';

export default function ActiveUsersCounter() {
  const [count, setCount] = useState(null);
  const { user } = useAuth();

  useEffect(() => {
    let sid = localStorage.getItem('wf_session_id');
    if (!sid) {
      sid = (typeof crypto !== 'undefined' && crypto.randomUUID)
        ? crypto.randomUUID()
        : String(Date.now()) + Math.random().toString(36).slice(2);
      localStorage.setItem('wf_session_id', sid);
    }
    const session_id = sid;
    const ping = async () => {
      try {
        const res = await base44.functions.invoke('active-users', { session_id });
        const total = res?.data?.count ?? res?.count ?? 0;
        setCount(Math.max(0, Number(total) || 0));
      } catch (e) {
        /* fail silently */
      }
    };
    ping();
    const interval = setInterval(ping, 20000);
    return () => clearInterval(interval);
  }, [user]);

  if (count == null || count < 1) return null;

  return (
    <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 border border-[#1C1010] rounded-sm" title={`${count} viewer${count === 1 ? '' : 's'} on the site right now`}>
      <span className="relative flex h-2 w-2">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#E10000] opacity-75" />
        <span className="relative inline-flex rounded-full h-2 w-2 bg-[#E10000]" />
      </span>
      <span className="text-[10px] uppercase tracking-wider text-[#E2E8F0]/70">{count} live</span>
    </div>
  );
}