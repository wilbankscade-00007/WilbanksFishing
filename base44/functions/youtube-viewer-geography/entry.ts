import { createClientFromRequest } from 'npm:@base44/sdk@0.8.38';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    // Enforce admin-only access — this exposes channel analytics and must
    // not be reachable by unauthenticated callers.
    try {
      const me = await base44.auth.me();
      if (!me || me.role !== 'admin') {
        return Response.json({ configured: false, error: 'Unauthorized', countries: [] }, { status: 403 });
      }
    } catch (e) {
      return Response.json({ configured: false, error: 'Unauthorized', countries: [] }, { status: 403 });
    }

    const clientId = Deno.env.get('GOOGLE_CLIENT_ID');
    const clientSecret = Deno.env.get('GOOGLE_CLIENT_SECRET');
    const refreshToken = Deno.env.get('GOOGLE_REFRESH_TOKEN');

    if (!clientId || !clientSecret || !refreshToken) {
      return Response.json({
        configured: false,
        error: 'Google OAuth not configured.',
        countries: [],
      }, { status: 200 });
    }

    // Exchange refresh token for a fresh access token
    const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        refresh_token: refreshToken,
        grant_type: 'refresh_token',
      }),
    });
    if (!tokenRes.ok) {
      const err = await tokenRes.text();
      console.error('Google token refresh failed', tokenRes.status, err);
      return Response.json({ configured: true, error: 'Google token refresh failed', countries: [] }, { status: 200 });
    }
    const tokenJson = await tokenRes.json();
    const accessToken = tokenJson.access_token;

    // Date range: all time (YouTube returns data only where it exists)
    const end = new Date();
    const start = new Date('2005-01-01T00:00:00Z');
    const fmt = (d) => d.toISOString().slice(0, 10);

    const params = new URLSearchParams({
      startDate: fmt(start),
      endDate: fmt(end),
      metrics: 'views,estimatedMinutesWatched,subscribersGained',
      dimensions: 'country',
      ids: 'channel==MINE',
      sort: '-views',
      maxResults: '250',
    });
    const url = 'https://youtubeanalytics.googleapis.com/v2/reports?' + params.toString();
    const repRes = await fetch(url, { headers: { Authorization: 'Bearer ' + accessToken } });
    if (!repRes.ok) {
      const err = await repRes.text();
      console.error('YouTube Analytics error', repRes.status, err);
      return Response.json({ configured: true, error: 'YouTube Analytics request failed: ' + repRes.status, countries: [] }, { status: 200 });
    }
    const repJson = await repRes.json();
    // Columns by position: [country, views, estimatedMinutesWatched, subscribersGained]
    const rows = repJson.rows || [];
    let totalViews = 0;
    const countries = rows.map((r) => {
      const views = Number(r[1]) || 0;
      totalViews += views;
      return {
        code: String(r[0] || '').toUpperCase(),
        views,
        watch_minutes: Number(r[2]) || 0,
        subscribers: Number(r[3]) || 0,
      };
    }).filter((c) => c.code);

    // Use the channel's real lifetime view count (matches the channel page total) when available,
    // falling back to the sum of country views otherwise.
    const ytApiKey = Deno.env.get('YOUTUBE_API_KEY');
    if (ytApiKey) {
      try {
        const chRes = await fetch(
          `https://www.googleapis.com/youtube/v3/channels?part=statistics&forHandle=WilbanksFishing&key=${ytApiKey}`
        );
        if (chRes.ok) {
          const chJson = await chRes.json();
          const ch = chJson.items && chJson.items[0];
          const v = parseInt(ch?.statistics?.viewCount || '0', 10);
          if (v) totalViews = v;
        } else {
          console.error('channel stats fetch failed', chRes.status, await chRes.text());
        }
      } catch (e) {
        console.error('channel stats error', e);
      }
    }

    return Response.json({
      configured: true,
      countries,
      total_views: totalViews,
      start_date: fmt(start),
      end_date: fmt(end),
    });
  } catch (error) {
    console.error('youtube-viewer-geography error', error);
    return Response.json({ configured: true, error: error.message, countries: [] }, { status: 200 });
  }
});