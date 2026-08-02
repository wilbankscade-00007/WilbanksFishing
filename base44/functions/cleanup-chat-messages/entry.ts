import { createClientFromRequest } from 'npm:@base44/sdk@0.8.38';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    // Enforce admin-only access — this performs an RLS-bypassing bulk delete
    // and must not be triggerable by unauthenticated callers.
    try {
      const me = await base44.auth.me();
      if (!me || me.role !== 'admin') {
        return Response.json({ error: 'Unauthorized' }, { status: 403 });
      }
    } catch (e) {
      return Response.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const cutoff = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
    const res = await base44.asServiceRole.entities.ChatMessage.deleteMany({ created_date: { $lt: cutoff } });
    return Response.json({ ok: true, cutoff, result: res });
  } catch (error) {
    console.error('cleanup-chat-messages error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});