import { createClientFromRequest } from 'npm:@base44/sdk@0.8.38';

// Resolves a YouTube channel URL / handle / ID to its canonical channel id + display info.
// Used by the "claim your channel" flow on the leaderboard.
Deno.serve(async (req) => {
  try {
    const apiKey = Deno.env.get('YOUTUBE_API_KEY');
    if (!apiKey) return Response.json({ error: 'YouTube API key not configured' }, { status: 500 });

    let payload = {};
    try { payload = await req.json(); } catch (_) {}
    const raw = String(payload.url || '').trim();
    if (!raw) return Response.json({ error: 'No channel URL or handle provided' }, { status: 400 });

    let candidate = raw;
    let useId = false;
    let useUsername = false;

    const chanMatch = raw.match(/channel\/(UC[\w-]+)/);
    const handleMatch = raw.match(/@([\w.\-]+)/);
    const userMatch = raw.match(/user\/([\w.\-]+)/);

    if (chanMatch) { candidate = chanMatch[1]; useId = true; }
    else if (handleMatch) { candidate = handleMatch[1]; }
    else if (userMatch) { candidate = userMatch[1]; useUsername = true; }
    else if (/^UC[\w-]{20,}$/.test(raw)) { candidate = raw; useId = true; }
    else if (raw.startsWith('@')) { candidate = raw.slice(1); }
    // else treat the whole string as a handle

    const part = 'snippet';
    let apiUrl;
    if (useId) apiUrl = `https://www.googleapis.com/youtube/v3/channels?part=${part}&id=${encodeURIComponent(candidate)}&key=${apiKey}`;
    else if (useUsername) apiUrl = `https://www.googleapis.com/youtube/v3/channels?part=${part}&forUsername=${encodeURIComponent(candidate)}&key=${apiKey}`;
    else apiUrl = `https://www.googleapis.com/youtube/v3/channels?part=${part}&forHandle=${encodeURIComponent(candidate)}&key=${apiKey}`;

    let res = await fetch(apiUrl);
    let json = await res.json();
    let channel = json.items && json.items[0];

    // Fallback: if forHandle/forUsername found nothing, try the alternate lookup
    if (!channel && !useId) {
      const fallbackUrl = useUsername
        ? `https://www.googleapis.com/youtube/v3/channels?part=${part}&forHandle=${encodeURIComponent(candidate)}&key=${apiKey}`
        : `https://www.googleapis.com/youtube/v3/channels?part=${part}&forUsername=${encodeURIComponent(candidate)}&key=${apiKey}`;
      const fbRes = await fetch(fallbackUrl);
      if (fbRes.ok) {
        const fbJson = await fbRes.json();
        channel = fbJson.items && fbJson.items[0];
      }
    }

    if (!channel) return Response.json({ error: 'Channel not found. Check the URL or handle and try again.' }, { status: 404 });

    const snippet = channel.snippet || {};
    return Response.json({
      channel_id: channel.id,
      display_name: snippet.title || '',
      avatar_url: snippet.thumbnails?.default?.url || snippet.thumbnails?.medium?.url || '',
      channel_url: 'https://www.youtube.com/channel/' + channel.id,
    });
  } catch (error) {
    console.error('resolve-youtube-channel error', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});