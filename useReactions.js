import { useState, useEffect, useCallback } from 'react';
import { base44 } from '@/api/base44Client';

/**
 * Shared hook for all community engagement (votes, reactions, emoji shouts, check-ins).
 * unique=true  -> one reaction per user per target (voting / episode reaction / check-in); re-submitting replaces.
 * unique=false -> allow multiple posts per user (emoji feed).
 */
export function useReactions(targetType, targetId, { unique = true } = {}) {
  const [reactions, setReactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  const load = useCallback(async () => {
    try {
      const all = await base44.entities.Reaction.filter(
        { target_type: targetType, target_id: targetId },
        '-created_date',
        300
      );
      setReactions(all || []);
    } catch (e) {
      setReactions([]);
    } finally {
      setLoading(false);
    }
  }, [targetType, targetId]);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    (async () => {
      try {
        const u = await base44.auth.me();
        if (mounted) setUser(u);
      } catch (e) { /* not logged in */ }
      load();
    })();
    const unsub = base44.entities.Reaction.subscribe(() => load());
    return () => { mounted = false; if (unsub) unsub(); };
  }, [load]);

  const myReaction = unique && user ? reactions.find((r) => r.user_id === user.id) : null;

  const submit = useCallback(async (value) => {
    const u = user || (await base44.auth.me().catch(() => null));
    if (!u) throw new Error('not_authed');
    if (unique) {
      const mine = reactions.find((r) => r.user_id === u.id);
      if (mine) {
        if (mine.value === value) return; // same choice -> no-op
        await base44.entities.Reaction.delete(mine.id);
      }
    }
    await base44.entities.Reaction.create({
      user_id: u.id,
      author_name: u.full_name || u.email || 'Fan',
      target_type: targetType,
      target_id: targetId,
      value,
    });
    await load();
  }, [reactions, user, unique, targetType, targetId, load]);

  return { reactions, myReaction, loading, user, submit };
}