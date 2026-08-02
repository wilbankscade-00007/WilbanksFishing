import { createClientFromRequest } from 'npm:@base44/sdk@0.8.38';

const BOT_USER_ID = 'wilbanks-bot';
const BOT_NAME = 'WilbanksFishing Bot';
// Cooldown so the bot never spams — skip if it already posted in the last 2 hours
const BOT_COOLDOWN_MS = 2 * 60 * 60 * 1000;

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const d = new Date();
    const monthKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;

    const recent = await base44.asServiceRole.entities.Reaction.filter(
      { target_type: 'emoji_shout', target_id: monthKey },
      '-created_date',
      20
    );

    // Skip if the bot already posted recently
    const lastBot = (recent || []).find((r) => r.user_id === BOT_USER_ID || r.author_name === BOT_NAME);
    if (lastBot && lastBot.created_date && (Date.now() - new Date(lastBot.created_date).getTime() < BOT_COOLDOWN_MS)) {
      return Response.json({ ok: true, skipped: true, reason: 'Bot posted recently.' });
    }

    // Don't spam into a dead room — only chime in if a real crew member posted recently
    const ACTIVITY_WINDOW_MS = 4 * 60 * 60 * 1000;
    const lastCrew = (recent || []).find((r) => r.user_id !== BOT_USER_ID && r.author_name !== BOT_NAME);
    if (!lastCrew || !lastCrew.created_date || (Date.now() - new Date(lastCrew.created_date).getTime() > ACTIVITY_WINDOW_MS)) {
      return Response.json({ ok: true, skipped: true, reason: 'No recent crew activity — skipping to avoid spam.' });
    }

    // Build context from the crew (exclude the bot's own posts)
    const crew = (recent || []).filter((r) => r.user_id !== BOT_USER_ID && r.author_name !== BOT_NAME).slice(0, 10);
    const summary = crew.map((r) => `${r.author_name || 'Fan'}: ${String(r.value).slice(0, 60)}`).join(' | ');

    // Heuristic: does the crew sound heated?
    const heatRegex = /\b(argue|stupid|idiot|dumb|hate|shut ?up|loser|trash|garbage|fight|lame|sucks|worst)\b/i;
    const heated = summary && heatRegex.test(summary);

    const prompt = `You are the voice of the WilbanksFishing brand — a friendly, stoked, wholesome fishing community host. Cade (the channel owner) is busy right now, so you step in to keep the crew engaged and the vibe positive.

${summary ? `Recent crew messages: """${summary}"""` : 'The crew feed is quiet right now.'}

Write ONE short message (max 160 characters) to post in the chat. It must:
- Be warm, upbeat and in Cade's casual, stoked-on-fishing voice.
- Do ONE of: hype the crew up, ask a fun fishing question, share a quick fishing tip, celebrate a catch, or welcome new members.
${heated ? '- The crew seems a little heated — post a calm, unifying, positive message that gently defuses tension and steers everyone back to fishing. Do not call anyone out.' : ''}
- Do NOT address or name any specific person — you are broadcasting to the whole crew, not replying to someone.
- NOT mention that you are a bot, AI, or automated.
- Have NO profanity, controversy, politics, or off-topic content.
- Read naturally as something Cade might type.

Respond with ONLY the message text — no quotes, no labels, no emojis-only.`;

    let msg = '';
    try {
      const res = await base44.asServiceRole.integrations.Core.InvokeLLM({ prompt });
      msg = String(res || '').trim().replace(/^["'\s]+|["'\s]+$/g, '');
    } catch (e) {
      console.error('wilbanks-bot LLM error', e?.message || e);
      return Response.json({ ok: false, reason: 'LLM unavailable.' }, { status: 500 });
    }

    if (!msg) return Response.json({ ok: false, reason: 'No message generated.' });
    msg = msg.slice(0, 160);

    await base44.asServiceRole.entities.Reaction.create({
      user_id: BOT_USER_ID,
      author_name: BOT_NAME,
      target_type: 'emoji_shout',
      target_id: monthKey,
      value: msg,
    });

    return Response.json({ ok: true, message: msg });
  } catch (error) {
    console.error('wilbanks-bot-post error', error?.message || error);
    return Response.json({ ok: false, reason: error?.message || 'Server error.' }, { status: 500 });
  }
});