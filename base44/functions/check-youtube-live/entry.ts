const CHANNEL_HANDLE = 'WilbanksFishing';
const CACHE_MS = 15 * 1000; // 15s — near-instant detection; coalesces all visitors into cheap API calls

let cache = { ts: 0, data: null, channelId: null, uploadsPlaylist: null };

Deno.serve(async (req) => {
  try {
    const apiKey = Deno.env.get('YOUTUBE_API_KEY');
    if (!apiKey) return Response.json({ error: 'YouTube API key not configured' }, { status: 500 });

    if (cache.data && (Date.now() - cache.ts) < CACHE_MS) {
      return Response.json({ ...cache.data, cached: true });
    }

    // Resolve channel id + uploads playlist once and reuse
    let channelId = cache.channelId;
    let uploadsPlaylist = cache.uploadsPlaylist;
    if (!channelId || !uploadsPlaylist) {
      const chanRes = await fetch(
        `https://www.googleapis.com/youtube/v3/channels?part=contentDetails&forHandle=${encodeURIComponent(CHANNEL_HANDLE)}&key=${apiKey}`
      );
      if (!chanRes.ok) {
        console.error('channels API error', chanRes.status, await chanRes.text());
        return Response.json({ error: 'YouTube channels API ' + chanRes.status }, { status: 502 });
      }
      const channel = (await chanRes.json()).items?.[0];
      if (!channel?.id) return Response.json({ is_live: false, cached: false });
      channelId = channel.id;
      uploadsPlaylist = channel.contentDetails?.relatedPlaylists?.uploads;
      if (!uploadsPlaylist) return Response.json({ is_live: false, cached: false });
      cache.channelId = channelId;
      cache.uploadsPlaylist = uploadsPlaylist;
    }

    // Recent uploads — live streams appear here once the broadcast starts.
    // Cheaper than search.list (1 unit vs 100), so we can poll frequently.
    const plRes = await fetch(
      `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&playlistId=${uploadsPlaylist}&maxResults=10&key=${apiKey}`
    );
    if (!plRes.ok) {
      console.error('playlistItems error', plRes.status, await plRes.text());
      return Response.json({ error: 'YouTube playlistItems API ' + plRes.status }, { status: 502 });
    }
    const videoIds = ((await plRes.json()).items || [])
      .map((it) => it.snippet?.resourceId?.videoId)
      .filter(Boolean);

    let data = { is_live: false };
    if (videoIds.length) {
      const vdRes = await fetch(
        `https://www.googleapis.com/youtube/v3/videos?part=snippet,liveStreamingDetails&id=${videoIds.join(',')}&key=${apiKey}`
      );
      if (vdRes.ok) {
        const items = (await vdRes.json()).items || [];
        // A stream is live if it has started but not ended
        const live = items.find((v) => {
          const lsd = v.liveStreamingDetails;
          return lsd && lsd.actualStartTime && !lsd.actualEndTime;
        });
        if (live) {
          const lsd = live.liveStreamingDetails;
          data = {
            is_live: true,
            video_id: live.id,
            title: live.snippet?.title || 'Live now',
            thumbnail: live.snippet?.thumbnails?.high?.url || '',
            watch_url: `https://www.youtube.com/watch?v=${live.id}`,
            concurrent_viewers: lsd.concurrentViewers != null ? Number(lsd.concurrentViewers) : null,
            started_at: lsd.actualStartTime || null,
          };
        }
      } else {
        console.error('videos.list error', vdRes.status, await vdRes.text());
      }
    }

    cache = { ts: Date.now(), data, channelId, uploadsPlaylist };
    return Response.json({ ...data, cached: false });
  } catch (error) {
    console.error('check-youtube-live error', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});