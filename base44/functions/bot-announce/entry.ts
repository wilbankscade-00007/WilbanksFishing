import { createClientFromRequest } from 'npm:@base44/sdk@0.8.38';

const BOT_USER_ID = 'wilbanks-bot';
const BOT_NAME = 'WilbanksFishing Bot';
// Short cooldown so bulk-added items don't spam the feed
const ANNOUNCE_COOLDOWN_MS = 3 * 60 * 1000;

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    // Enforce admin-only access so attackers can't directly call this endpoint
    // to publish phishing links through the official bot.
    try {
      const me = await base44.auth.me();
      if (!me || me.role !== 'admin') {
        return Response.json({ ok: false, reason: 'Unauthorized' }, { status: 403 });
      }
    } catch (e) {
      return Response.json({ ok: false, reason: 'Unauthorized' }, { status: 403 });
    }

    const body = await req.json().catch(() => ({}));
    const type = String(body.type || '');        // 'video' | 'photo' | 'update'
    const title = String(body.title || '').trim();
    const url = String(body.url || '').trim();

    if (!title) return Response.json({ ok: false, reason: 'Missing title.' });

    const d = new Date();
    const monthKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;

    const recent = await base44.asServiceRole.entities.Reaction.filter(
      { target_type: 'emoji_shout', target_id: monthKey },
      '-created_date',
      30
    );
    const botPosts = (recent || []).filter((r) => r.user_id === BOT_USER_ID || r.author_name === BOT_NAME);

    // Dedupe: don't announce the same item twice
    const already = botPosts.find((r) => String(r.value || '').includes(title));
    if (already) return Response.json({ ok: true, skipped: true, reason: 'Already announced.' });

    // Cooldown: skip if the bot posted very recently (bulk adds)
    const lastBot = botPosts[0];
    if (lastBot && lastBot.created_date && (Date.now() - new Date(lastBot.created_date).getTime() < ANNOUNCE_COOLDOWN_MS)) {
      return Response.json({ ok: true, skipped: true, reason: 'Bot on cooldown.' });
    }

    const typeLabel =
      type === 'video' ? 'a new video' :
      type === 'photo' ? 'a new catch photo' :
      type === 'update' ? 'a new update' :
      'something new';

    const prompt = `You are the voice of the WilbanksFishing brand — a stoked, wholesome fishing community host. Cade just dropped ${typeLabel}: "${title}". Write ONE short announcement message (max 150 characters) for the crew feed to hype it up and tell the crew to go check it out${url ? ' (a link will be attached automatically)' : ''}. Keep it in Cade's casual, upbeat fishing voice. This is a broadcast announcement, NOT a reply — do NOT address or name any specific person. No profanity, no politics, no mention that you are a bot or AI. Respond with ONLY the message text — no quotes, no labels.`;

    let msg = '';
    try {
      const res = await base44.asServiceRole.integrations.Core.InvokeLLM({ prompt });
      msg = String(res || '').trim().replace(/^["'\s]+|["'\s]+$/g, '');
    } catch (e) {
      console.error('bot-announce LLM error', e?.message || e);
      return Response.json({ ok: false, reason: 'LLM unavailable.' }, { status: 500 });
    }
    if (!msg) return Response.json({ ok: false, reason: 'No message generated.' });

    msg = msg.slice(0, 150);
    if (url) msg = `${msg} ${url}`;

    await base44.asServiceRole.entities.Reaction.create({
      user_id: BOT_USER_ID,
      author_name: BOT_NAME,
      target_type: 'emoji_shout',
      target_id: monthKey,
      value: msg,
    });

    return Response.json({ ok: true, message: msg });
  } catch (error) {
    console.error('bot-announce error', error?.message || error);
    return Response.json({ ok: false, reason: error?.message || 'Server error.' }, { status: 500 });
  }
});