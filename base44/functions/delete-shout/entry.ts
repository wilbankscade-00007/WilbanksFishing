import { createClientFromRequest } from 'npm:@base44/sdk@0.8.38';

// Server-side lockdown: ONLY Cade (the owner) can delete crew feed text/image messages.
// This is enforced here (not just in the UI), so client-side tampering cannot delete others' posts.
const OWNER_IDS = ['6a5139318a957c718bd166bc'];
const OWNER_EMAILS = ['wilbankscade@gmail.com'];

function isImageUrl(v) {
  return typeof v === 'string' && /^https?:\/\//i.test(v) && /\.(png|jpe?g|gif|webp|avif|bmp|svg)$/i.test(v);
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ ok: false, reason: 'Login required.' }, { status: 401 });

    const isOwner = OWNER_IDS.includes(user.id) || OWNER_EMAILS.includes(String(user.email || '').toLowerCase());
    if (!isOwner) {
      return Response.json({ ok: false, reason: 'Only Cade can delete messages.' }, { status: 403 });
    }

    const body = await req.json().catch(() => ({}));
    const id = String(body.id || '');
    if (!id) return Response.json({ ok: false, reason: 'Missing message id.' });

    const rec = await base44.asServiceRole.entities.Reaction.get(id);
    if (!rec) return Response.json({ ok: false, reason: 'Message not found.' });

    // Only crew feed messages (emoji taps, text, images) can be deleted — never votes or check-ins
    if (rec.target_type !== 'emoji_shout') {
      return Response.json({ ok: false, reason: 'Only crew feed messages can be deleted.' });
    }

    await base44.asServiceRole.entities.Reaction.delete(id);
    return Response.json({ ok: true });
  } catch (error) {
    console.error('delete-shout error', error?.message || error);
    return Response.json({ ok: false, reason: error?.message || 'Server error.' }, { status: 500 });
  }
});