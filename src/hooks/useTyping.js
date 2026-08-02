import { useState, useEffect, useCallback, useRef } from 'react';
import { base44 } from '@/api/base44Client';

// How long a user is considered "typing" after their last keystroke
const TYPING_WINDOW_MS = 3500;

/**
 * Lightweight cross-user typing indicator.
 * - reportTyping(): call on each keystroke (debounced internally) to broadcast "I'm typing".
 * - typingUsers: other users who typed within the last few seconds.
 */
export function useTyping(user) {
  const [typingUsers, setTypingUsers] = useState([]);
  const myStatusRef = useRef(null);
  const lastReportRef = useRef(0);

  const load = useCallback(async () => {
    try {
      const all = await base44.entities.TypingStatus.list('-last_typed', 50);
      const now = Date.now();
      const active = (all || [])
        .filter((t) => t.last_typed && now - new Date(t.last_typed).getTime() < TYPING_WINDOW_MS)
        .filter((t) => !user || t.user_id !== user.id);
      setTypingUsers(active);
    } catch (e) {
      /* ignore */
    }
  }, [user]);

  useEffect(() => {
    load();
    const unsub = base44.entities.TypingStatus.subscribe(() => load());
    const interval = setInterval(load, 1500);
    return () => {
      if (unsub) unsub();
      clearInterval(interval);
    };
  }, [load]);

  const reportTyping = useCallback(async () => {
    if (!user) return;
    const now = Date.now();
    if (now - lastReportRef.current < 1200) return; // debounce
    lastReportRef.current = now;
    try {
      const ts = new Date().toISOString();
      if (myStatusRef.current) {
        await base44.entities.TypingStatus.update(myStatusRef.current, { last_typed: ts });
      } else {
        const mine = await base44.entities.TypingStatus.filter({ user_id: user.id });
        if (mine && mine[0]) {
          myStatusRef.current = mine[0].id;
          await base44.entities.TypingStatus.update(mine[0].id, { last_typed: ts });
        } else {
          const created = await base44.entities.TypingStatus.create({
            user_id: user.id,
            author_name: user.full_name || user.email || 'Fan',
            last_typed: ts,
          });
          if (created && created.id) myStatusRef.current = created.id;
        }
      }
    } catch (e) {
      /* ignore */
    }
  }, [user]);

  return { typingUsers, reportTyping };
}