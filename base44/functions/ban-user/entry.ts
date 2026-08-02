import { createClientFromRequest } from 'npm:@base44/sdk@0.8.38';

// Server-side lockdown: ONLY Cade (owner) or an admin can ban a user from the crew feed.
// This is the emergency valve if harmful content ever slips past auto-moderation.
const OWNER_IDS = ['6a5139318a957c718bd166bc'];
const OWNER_EMAILS = ['wilbankscade@gmail.com'];
const BOT_USER_ID = 'wilbanks-bot';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ ok: false, reason: 'Login required.' }, { status: 401 });

    const isOwner = OWNER_IDS.includes(user.id) || OWNER_EMAILS.includes(String(user.email || '').toLowerCase());
    const isAdmin = user.role === 'admin';
    if (!isOwner && !isAdmin) {
      return Response.json({ ok: false, reason: 'Only the owner can ban users.' }, { status: 403 });
    }

    const body = await req.json().catch(() => ({}));
    const targetId = String(body.user_id || '');
    const reason = String(body.reason || 'Removed by admin for community violations');
    if (!targetId) return Response.json({ ok: false, reason: 'Missing user_id.' });

    // Never ban the bot, the owner, or yourself
    if (targetId === BOT_USER_ID || OWNER_IDS.includes(targetId) || targetId === user.id) {
      return Response.json({ ok: false, reason: 'Cannot ban this user.' });
    }

    await base44.asServiceRole.entities.User.update(targetId, { banned_shout: true, ban_reason: reason });
    return Response.json({ ok: true });
  } catch (error) {
    console.error('ban-user error', error?.message || error);
    return Response.json({ ok: false, reason: error?.message || 'Server error.' }, { status: 500 });
  }
});