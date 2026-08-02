import { createClientFromRequest } from 'npm:@base44/sdk@0.8.38';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const me = await base44.auth.me();
    if (!me) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    let payload = {};
    try { payload = await req.json(); } catch (_) {}
    const ids = Array.isArray(payload.ids) ? payload.ids : [];
    const all = payload.all === true;

    if (all) {
      const mine = await base44.asServiceRole.entities.Notification.filter({ user_id: me.id, read: false });
      if (mine.length) {
        await Promise.all(mine.map((n) => base44.asServiceRole.entities.Notification.update(n.id, { read: true })));
      }
      return Response.json({ updated: mine.length });
    }

    if (ids.length) {
      const mine = await base44.asServiceRole.entities.Notification.filter({ user_id: me.id });
      const owned = new Set(mine.map((n) => n.id));
      const valid = ids.filter((id) => owned.has(id));
      if (valid.length) {
        await Promise.all(valid.map((id) => base44.asServiceRole.entities.Notification.update(id, { read: true })));
      }
      return Response.json({ updated: valid.length });
    }

    return Response.json({ updated: 0 });
  } catch (error) {
    console.error('mark-read error', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});