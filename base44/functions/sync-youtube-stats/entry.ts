import { createClientFromRequest } from 'npm:@base44/sdk@0.8.38';

const CHANNEL_HANDLE = 'WilbanksFishing';
const CACHE_MS = 30 * 1000; // 30s — keeps latest upload stats live; deduplicates concurrent callers to protect quota
let syncInProgress = false; // guard against concurrent full-syncs (thundering herd)
const LONG_FORM_MIN_SECONDS = 181; // exclude Shorts (≤180s / 3 min) — only track long-form uploads

// Parse an ISO-8601 duration (e.g. "PT1H2M10S") into total seconds.
function parseDuration(iso) {
  if (!iso) return 0;
  const m = iso.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!m) return 0;
  const h = parseInt(m[1] || '0', 10) || 0;
  const min = parseInt(m[2] || '0', 10) || 0;
  const s = parseInt(m[3] || '0', 10) || 0;
  return h * 3600 + min * 60 + s;
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const apiKey = Deno.env.get('YOUTUBE_API_KEY');
    if (!apiKey) return Response.json({ error: 'YouTube API key not configured' }, { status: 500 });

    let payload = {};
    try { payload = await req.json(); } catch (_) {}
    const wantForce = payload.force === true;

    // Admin callers may bypass the throttle (manual "Sync Now")
    let isAdmin = false;
    try {
      const me = await base44.auth.me();
      isAdmin = !!me && me.role === 'admin';
    } catch (_) {}
    const force = wantForce && isAdmin;

    const existing = await base44.asServiceRole.entities.YouTubeStats.list();
    const sorted = existing.sort((a, b) => (a.display_order || 0) - (b.display_order || 0));
    const record = sorted[0];

    if (!force && record && record.updated_date) {
      const age = Date.now() - new Date(record.updated_date).getTime();
      if (age < CACHE_MS) {
        return Response.json({ synced: false, cached: true, stats: record });
      }
    }

    // Prevent thundering herd: if a sync is already running on this isolate,
    // serve the previous record (even if stale) rather than launching a second API scan.
    if (!force && syncInProgress && record) {
      return Response.json({ synced: false, cached: true, stale: true, stats: record });
    }
    syncInProgress = true;

    const chanRes = await fetch(
      `https://www.googleapis.com/youtube/v3/channels?part=snippet,statistics,contentDetails&forHandle=${encodeURIComponent(CHANNEL_HANDLE)}&key=${apiKey}`
    );
    if (!chanRes.ok) {
      const errBody = await chanRes.text();
      console.error('YouTube channels API error', chanRes.status, errBody);
      return Response.json({ error: 'YouTube API ' + chanRes.status + ': ' + errBody.slice(0, 300) }, { status: 502 });
    }
    const chanJson = await chanRes.json();
    const channel = chanJson.items && chanJson.items[0];
    if (!channel) {
      return Response.json({ error: 'Channel not found for handle ' + CHANNEL_HANDLE }, { status: 404 });
    }
    const stats = channel.statistics || {};
    const snippet = channel.snippet || {};
    const uploadsPlaylist = channel.contentDetails?.relatedPlaylists?.uploads;

    // Fetch recent uploads (titles + ids from playlistItems), enriched with per-video stats from videos.list
    let recentVideos = [];
    let latestVideo = null;
    if (uploadsPlaylist) {
      const plRes = await fetch(
        `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&playlistId=${uploadsPlaylist}&maxResults=15&key=${apiKey}`
      );
      let plItems = [];
      if (plRes.ok) {
        const plJson = await plRes.json();
        plItems = plJson.items || [];
      } else {
        console.error('playlistItems error', plRes.status, await plRes.text());
      }

      const videoIds = plItems.map((it) => it.snippet?.resourceId?.videoId).filter(Boolean);
      const statsMap = {};
      if (videoIds.length) {
        const vidRes = await fetch(
          `https://www.googleapis.com/youtube/v3/videos?part=snippet,statistics,contentDetails&id=${videoIds.join(',')}&key=${apiKey}`
        );
        if (vidRes.ok) {
          const vidJson = await vidRes.json();
          for (const v of (vidJson.items || [])) {
            statsMap[v.id] = {
              views: parseInt(v.statistics?.viewCount || '0', 10) || 0,
              likes: parseInt(v.statistics?.likeCount || '0', 10) || 0,
              comments: parseInt(v.statistics?.commentCount || '0', 10) || 0,
              duration: parseDuration(v.contentDetails?.duration),
            };
          }
        } else {
          console.error('videos.list error', vidRes.status, await vidRes.text());
        }
      }

      recentVideos = plItems
        .map((it) => {
          const id = it.snippet?.resourceId?.videoId;
          const st = statsMap[id] || {};
          return {
            title: it.snippet?.title || '',
            video_id: id || '',
            views: st.views || 0,
            likes: st.likes || 0,
            comments: st.comments || 0,
            published_date: it.snippet?.videoPublishedAt || it.snippet?.publishedAt || '',
            _dur: st.duration || 0,
          };
        })
        .filter((v) => v.video_id && v._dur >= LONG_FORM_MIN_SECONDS) // long-form only — drops Shorts
        .map(({ _dur, ...rest }) => rest);
    }
    if (recentVideos.length > 0) latestVideo = recentVideos[0];

    const data = {
      subscribers: parseInt(stats.subscriberCount || '0', 10) || 0,
      total_views: parseInt(stats.viewCount || '0', 10) || 0,
      video_count: parseInt(stats.videoCount || '0', 10) || 0,
      channel_title: snippet.title || '',
      channel_created_date: snippet.publishedAt || '',
      country: snippet.country || '',
      custom_url: snippet.customUrl || '',
      latest_video_title: latestVideo?.title || '',
      latest_video_url: latestVideo?.video_id ? 'https://www.youtube.com/watch?v=' + latestVideo.video_id : '',
      latest_video_views: latestVideo?.views || 0,
      latest_video_likes: latestVideo?.likes || 0,
      latest_video_comments: latestVideo?.comments || 0,
      recent_videos: recentVideos,
      display_order: record ? (record.display_order || 0) : 0,
    };

    let saved;
    if (record) {
      saved = await base44.asServiceRole.entities.YouTubeStats.update(record.id, data);
    } else {
      saved = await base44.asServiceRole.entities.YouTubeStats.create(data);
    }

    // --- Notification: broadcast a new video to all users when the latest upload changes ---
    try {
      const prevVideoUrl = record?.latest_video_url || '';
      const newVideoUrl = data.latest_video_url || '';
      if (record && latestVideo && newVideoUrl && newVideoUrl !== prevVideoUrl) {
        const ref = `new_video-${latestVideo.video_id}`;
        const existing = await base44.asServiceRole.entities.Notification.filter({ ref });
        if (!existing.length) {
          const users = await base44.asServiceRole.entities.User.list();
          if (users.length) {
            await base44.asServiceRole.entities.Notification.bulkCreate(
              users.map((u) => ({
                user_id: u.id, type: 'new_video', ref,
                title: `New video: ${latestVideo.title}`.slice(0, 120),
                body: 'Cade just dropped a new video — go check it out!',
                link_url: newVideoUrl, icon: 'video', read: false,
              }))
            );
          }
        }
      }
    } catch (notifErr) {
      console.error('youtube-stats notifications error', notifErr?.message || notifErr);
    }

    return Response.json({ synced: true, cached: false, stats: saved });
  } catch (error) {
    console.error('sync-youtube-stats error', error);
    return Response.json({ error: error.message }, { status: 500 });
  } finally {
    syncInProgress = false;
  }
});