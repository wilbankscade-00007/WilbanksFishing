import { createClientFromRequest } from 'npm:@base44/sdk@0.8.38';

const TIERS = [
  { min: 35, name: 'Legend of the Lake' },
  { min: 18, name: 'Captain' },
  { min: 8, name: 'Deckhand' },
  { min: 3, name: 'Angler' },
  { min: 0, name: 'Rookie' },
];

function getTier(points) {
  for (const t of TIERS) if ((points || 0) >= t.min) return t.name;
  return 'Rookie';
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const me = await base44.auth.me();
    if (!me) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const userId = me.id;

    // Leaderboard entry for the user's claimed channel
    let entry = null, rank = null, total = 0;
    try {
      const entries = await base44.asServiceRole.entities.LeaderboardEntry.list('-points', 50);
      const sorted = entries.sort((a, b) => (b.points || 0) - (a.points || 0));
      total = sorted.length;
      if (me.claimed_channel_id) {
        const idx = sorted.findIndex((e) => e.youtube_channel_id === me.claimed_channel_id);
        if (idx >= 0) { entry = sorted[idx]; rank = idx + 1; }
      }
    } catch (_) {}

    // Existing notifications for dedup
    let existing = [];
    try {
      existing = await base44.asServiceRole.entities.Notification.filter({ user_id: userId });
    } catch (_) {}
    const has = (type, ref) => existing.some((n) => n.type === type && n.ref === ref);
    const toCreate = [];

    // Tier reached
    if (entry) {
      const tierName = getTier(entry.points);
      if (!has('tier', tierName)) {
        toCreate.push({ user_id: userId, type: 'tier', ref: tierName, title: 'Tier Reached', body: `You climbed to ${tierName} tier on the leaderboard!`, icon: 'trophy', link_url: '/Leaderboard' });
      }
      if (rank > 0 && rank <= 3 && !has('top3', 'top3')) {
        toCreate.push({ user_id: userId, type: 'top3', ref: 'top3', title: 'Top 3 Angler', body: `You're ranked #${rank} on the leaderboard — keep it up!`, icon: 'star', link_url: '/Leaderboard' });
      }
    }

    // New videos released since the user joined
    try {
      const videos = await base44.asServiceRole.entities.Video.list('-created_date', 20);
      const joined = me.created_date ? new Date(me.created_date).getTime() : 0;
      for (const v of videos) {
        const created = v.created_date ? new Date(v.created_date).getTime() : 0;
        if (created > joined && !has('new_video', v.id)) {
          toCreate.push({ user_id: userId, type: 'new_video', ref: v.id, title: 'New Video', body: v.title || 'A new video dropped — check it out.', icon: 'video', link_url: v.youtube_url || '/YouTube' });
        }
      }
    } catch (_) {}

    // Membership-time milestones
    if (me.created_date) {
      const days = Math.floor((Date.now() - new Date(me.created_date).getTime()) / 86400000);
      const milestones = [
        { d: 1, title: 'Welcome to the Family', body: 'Thanks for joining WilbanksFishing — comment on videos to climb the leaderboard.' },
        { d: 7, title: 'One Week In', body: "You've been part of the crew for a week. Keep commenting to earn badges!" },
        { d: 30, title: 'One Month Strong', body: 'A full month on the water with us — you\'re a regular now.' },
      ];
      for (const m of milestones) {
        if (days >= m.d && !has('milestone', 'd' + m.d)) {
          toCreate.push({ user_id: userId, type: 'milestone', ref: 'd' + m.d, title: m.title, body: m.body, icon: 'gift' });
        }
      }
    }

    if (toCreate.length) {
      try { await base44.asServiceRole.entities.Notification.bulkCreate(toCreate); }
      catch (e) { console.error('notif create', e.message); }
    }

    // Return all notifications for the user (newest first)
    let notifications = existing;
    if (toCreate.length) {
      try {
        notifications = await base44.asServiceRole.entities.Notification.filter({ user_id: userId });
      } catch (_) { notifications = [...existing, ...toCreate]; }
    }
    notifications = notifications.sort((a, b) => new Date(b.created_date || 0).getTime() - new Date(a.created_date || 0).getTime());

    // Purchases: orders whose buyer email matches this user
    let orders = [];
    try {
      if (me.email) orders = await base44.asServiceRole.entities.Order.filter({ buyer_email: me.email });
      orders = orders.sort((a, b) => new Date(b.created_date || 0).getTime() - new Date(a.created_date || 0).getTime());
    } catch (_) {}

    return Response.json({
      user: {
        id: me.id, full_name: me.full_name, email: me.email, role: me.role,
        created_date: me.created_date,
        claimed_channel_id: me.claimed_channel_id || '',
        claimed_display_name: me.claimed_display_name || '',
        claimed_avatar_url: me.claimed_avatar_url || '',
      },
      leaderboard: { entry, rank, total, tier: entry ? getTier(entry.points) : null },
      orders,
      notifications,
    });
  } catch (error) {
    console.error('profile-data error', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});