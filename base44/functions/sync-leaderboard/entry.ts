import { createClientFromRequest } from 'npm:@base44/sdk@0.8.38';

const CHANNEL_HANDLE = 'WilbanksFishing';
const CACHE_MS = 60 * 60 * 1000; // 1 hour — leaderboard shifts slowly; protects quota
let syncInProgress = false; // guard against concurrent full-syncs (thundering herd)
const VIDEOS_TO_SCAN = 10;
const TOP_COMMENT_LIKES = 5;     // a comment with >= this many likes earns the "top comment" bonus
const EARLY_BIRD_HOURS = 6;       // comment within this window of upload earns an early-bird bonus
// Monthly cycle: only comments published in the current calendar month count toward the monthly board
const nowDate = new Date();
const isSameMonth = (iso) => {
  if (!iso) return false;
  const d = new Date(iso);
  return d.getUTCFullYear() === nowDate.getUTCFullYear() && d.getUTCMonth() === nowDate.getUTCMonth();
};

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const apiKey = Deno.env.get('YOUTUBE_API_KEY');
    if (!apiKey) return Response.json({ error: 'YouTube API key not configured' }, { status: 500 });

    let payload = {};
    try { payload = await req.json(); } catch (_) {}
    const wantForce = payload.force === true;

    let isAdmin = false;
    try {
      const me = await base44.auth.me();
      isAdmin = !!me && me.role === 'admin';
    } catch (_) {}
    const force = wantForce && isAdmin;

    const existing = await base44.asServiceRole.entities.LeaderboardEntry.list();

    if (!force && existing.length) {
      const newest = existing.reduce((a, b) => (new Date(a.updated_date || 0) > new Date(b.updated_date || 0) ? a : b));
      if (newest.updated_date) {
        const age = Date.now() - new Date(newest.updated_date).getTime();
        if (age < CACHE_MS) {
          const sorted = existing.sort((a, b) => (b.points || 0) - (a.points || 0)).slice(0, 50);
          const activity = await buildActivityFromEntries(base44, sorted);
          return Response.json({ synced: false, cached: true, entries: sorted, recent_activity: activity });
        }
      }
    }

    // Prevent thundering herd: if a sync is already running on this isolate,
    // serve the previous data (even if stale) rather than launching a second heavy scan.
    if (!force && syncInProgress && existing.length) {
      const sorted = existing.sort((a, b) => (b.points || 0) - (a.points || 0)).slice(0, 50);
      const activity = await buildActivityFromEntries(base44, sorted);
      return Response.json({ synced: false, cached: true, stale: true, entries: sorted, recent_activity: activity });
    }
    syncInProgress = true;

    // 1. Resolve channel + uploads playlist
    const chanRes = await fetch(
      `https://www.googleapis.com/youtube/v3/channels?part=contentDetails,snippet&forHandle=${encodeURIComponent(CHANNEL_HANDLE)}&key=${apiKey}`
    );
    if (!chanRes.ok) {
      console.error('channels API error', chanRes.status, await chanRes.text());
      return Response.json({ error: 'YouTube channels API ' + chanRes.status }, { status: 502 });
    }
    const ownerChannel = (await chanRes.json()).items?.[0];
    const uploadsPlaylist = ownerChannel?.contentDetails?.relatedPlaylists?.uploads;
    if (!uploadsPlaylist) return Response.json({ error: 'Uploads playlist not found' }, { status: 404 });
    const ownerId = ownerChannel?.id || '';
    const ownerName = (ownerChannel?.snippet?.title || '').toLowerCase();

    // 2. Recent uploads with publish dates + titles (most-recent-first)
    const plRes = await fetch(
      `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&playlistId=${uploadsPlaylist}&maxResults=${VIDEOS_TO_SCAN}&key=${apiKey}`
    );
    if (!plRes.ok) {
      console.error('playlistItems error', plRes.status, await plRes.text());
      return Response.json({ error: 'YouTube playlistItems API ' + plRes.status }, { status: 502 });
    }
    const plItems = (await plRes.json()).items || [];
    const videos = plItems
      .map((it) => ({
        id: it.snippet?.resourceId?.videoId,
        title: it.snippet?.title || 'a recent video',
        publishedAt: it.snippet?.videoPublishedAt || it.snippet?.publishedAt,
      }))
      .filter((v) => v.id);

    if (!videos.length) return Response.json({ synced: true, entries: [], recent_activity: [] });

    // 3. Pull comments per video and aggregate points per author
    const cycleId = String(Date.now());
    const authors = {}; // channelKey -> aggregate
    const activityRaw = []; // {author, video_title, ts}
    const authorSeenTexts = {}; // key -> Set of normalized texts (duplicate self-comment detection)
    const globalTextCount = {}; // normalized text -> count (copypasta detection)
    const normText = (t) => (t || '').trim().toLowerCase().replace(/\s+/g, ' ');

    for (const video of videos) {
      let pageToken = '';
      let pages = 0;
      while (pages < 3) { // cap at 300 comments per video to protect quota
        pages++;
        const url = `https://www.googleapis.com/youtube/v3/commentThreads?part=snippet&videoId=${video.id}&maxResults=100&order=time&key=${apiKey}` + (pageToken ? `&pageToken=${pageToken}` : '');
        const cRes = await fetch(url);
        if (!cRes.ok) {
          if (cRes.status === 403 || cRes.status === 404) break; // comments disabled / video gone
          console.error('commentThreads error', cRes.status, await cRes.text());
          break;
        }
        const cJson = await cRes.json();
        const threads = cJson.items || [];
        for (const t of threads) {
          const c = t.snippet?.topLevelComment?.snippet;
          if (!c) continue;
          const key = c.authorChannelId?.value || c.authorChannelId || c.authorDisplayName;
          if (!key) continue;
          // exclude the channel owner from the leaderboard
          if (ownerId && String(key) === ownerId) continue;
          const authorName = (c.authorDisplayName || '').toLowerCase();
          if (ownerName && (authorName === ownerName || authorName.includes('wilbanksfishing'))) continue;
          const isMonthly = isSameMonth(c.publishedAt);
          const likes = c.likeCount || 0;
          if (!authors[key]) {
            authors[key] = {
              youtube_channel_id: String(key),
              display_name: c.authorDisplayName || 'Anonymous',
              avatar_url: c.authorProfileImageUrl || '',
              channel_url: c.authorChannelId?.value ? 'https://www.youtube.com/channel/' + c.authorChannelId.value : '',
              points: 0,
              comment_count: 0,
              videoSet: new Set(),
              top_comments: 0,
              last_active: c.publishedAt || '',
              monthly_points: 0,
              monthly_comment_count: 0,
              monthly_videos: new Set(),
              early: false,
              owl: false,
              best: { text: '', video_id: '', likes: -1 },
            };
          }
          const a = authors[key];
          // anti-spam: skip only repetitive comments — copy-pasted spam or the same user repeating themselves
          const norm = normText(c.textOriginal);
          globalTextCount[norm] = (globalTextCount[norm] || 0) + 1;
          if (globalTextCount[norm] >= 3 || (authorSeenTexts[key] && authorSeenTexts[key].has(norm))) continue;
          if (!authorSeenTexts[key]) authorSeenTexts[key] = new Set();
          authorSeenTexts[key].add(norm);
          a.comment_count++;
          a.points += 1;
          let monthlyGain = 1;
          if (likes >= TOP_COMMENT_LIKES) {
            a.top_comments++;
            a.points += 3;
            monthlyGain += 3;
          }
          a.videoSet.add(video.id);
          if (!a.last_active || c.publishedAt > a.last_active) a.last_active = c.publishedAt;
          // early bird
          if (video.publishedAt && c.publishedAt) {
            const diffH = (new Date(c.publishedAt).getTime() - new Date(video.publishedAt).getTime()) / 3.6e6;
            if (diffH >= 0 && diffH <= EARLY_BIRD_HOURS) { a.points += 1; monthlyGain += 1; a.early = true; }
          }
          // night owl (UTC 0–4)
          if (c.publishedAt) {
            const hr = new Date(c.publishedAt).getUTCHours();
            if (hr >= 0 && hr < 5) a.owl = true;
          }
          // best comment by likes
          if (likes > a.best.likes && c.textOriginal) {
            a.best = { text: c.textOriginal.slice(0, 280), video_id: video.id, likes };
          }
          // monthly aggregation
          if (isMonthly) {
            a.monthly_comment_count++;
            a.monthly_points += monthlyGain;
            a.monthly_videos.add(video.id);
          }
          // activity feed (most recent comments globally)
          if (c.publishedAt) activityRaw.push({ author: c.authorDisplayName || 'Someone', video_title: video.title, ts: c.publishedAt });
        }
        pageToken = cJson.nextPageToken;
        if (!pageToken) break;
      }
    }

    // bonus for commenting on multiple distinct videos (+2 per unique video); mirror monthly
    for (const a of Object.values(authors)) {
      a.videos_commented = a.videoSet.size;
      if (a.videoSet.size >= 2) {
        a.points += 2 * a.videoSet.size;
        if (a.monthly_videos.size >= 2) a.monthly_points += 2 * a.monthly_videos.size;
      }
      // streak: consecutive most-recent videos commented on
      let streak = 0;
      for (const v of videos) { if (a.videoSet.has(v.id)) streak++; else break; }
      a.streak = streak;
      // badges
      const badges = [];
      if (a.videoSet.has(videos[0].id)) badges.push('first');
      if (a.early) badges.push('early');
      if (a.owl) badges.push('owl');
      if (streak >= 3) badges.push('streak3');
      if (streak >= 5) badges.push('streak5');
      a.badges = badges;
    }

    // 4. Upsert + prune stale entries
    const list = await base44.asServiceRole.entities.LeaderboardEntry.list();
    const byKey = {};
    for (const e of list) byKey[e.youtube_channel_id] = e;

    const upserts = Object.values(authors).map((a) => {
      const data = {
        youtube_channel_id: a.youtube_channel_id,
        display_name: a.display_name,
        avatar_url: a.avatar_url,
        channel_url: a.channel_url,
        points: a.points,
        comment_count: a.comment_count,
        videos_commented: a.videos_commented,
        top_comments: a.top_comments,
        streak: a.streak,
        badges: a.badges,
        best_comment_text: a.best.likes >= 0 ? a.best.text : '',
        best_comment_video_id: a.best.likes >= 0 ? a.best.video_id : '',
        best_comment_likes: a.best.likes >= 0 ? a.best.likes : 0,
        monthly_points: a.monthly_points,
        monthly_comment_count: a.monthly_comment_count,
        last_active: a.last_active,
        last_synced: cycleId,
      };
      const existingRec = byKey[a.youtube_channel_id];
      if (existingRec) return base44.asServiceRole.entities.LeaderboardEntry.update(existingRec.id, data);
      return base44.asServiceRole.entities.LeaderboardEntry.create(data);
    });
    await Promise.all(upserts);

    // delete entries not seen this cycle
    const refreshed = await base44.asServiceRole.entities.LeaderboardEntry.list();
    const stale = refreshed.filter((e) => e.last_synced !== cycleId).map((e) => e.id);
    if (stale.length) await base44.asServiceRole.entities.LeaderboardEntry.deleteMany({ id: { $in: stale } });

    const sorted = refreshed
      .filter((e) => e.last_synced === cycleId)
      .sort((a, b) => (b.points || 0) - (a.points || 0))
      .slice(0, 50);

    const recent_activity = activityRaw
      .sort((x, y) => new Date(y.ts).getTime() - new Date(x.ts).getTime())
      .slice(0, 12)
      .map((it) => ({ author: it.author, action: 'commented on', target: it.video_title, ts: it.ts }));

    // --- Notifications: tier-ups + top-3 for users who claimed a channel ---
    try {
      const users = await base44.asServiceRole.entities.User.list();
      const channelToUser = {};
      for (const u of users) {
        if (u.claimed_channel_id) channelToUser[u.claimed_channel_id] = u;
      }
      const tierRank = (p) => (p >= 35 ? 4 : p >= 18 ? 3 : p >= 8 ? 2 : p >= 3 ? 1 : 0);
      const tierName = (p) => (p >= 35 ? 'Legend of the Lake' : p >= 18 ? 'Captain' : p >= 8 ? 'Deckhand' : p >= 3 ? 'Angler' : 'Rookie');
      const mk = `${nowDate.getFullYear()}-${String(nowDate.getMonth() + 1).padStart(2, '0')}`;

      const toCreate = [];
      const seenRefs = new Set();
      for (const e of sorted) {
        const u = channelToUser[e.youtube_channel_id];
        if (!u) continue;
        const old = byKey[e.youtube_channel_id];
        const oldRank = old ? tierRank(old.points || 0) : 0;
        const newRank = tierRank(e.points || 0);
        if (newRank > oldRank) {
          const ref = `tier-${newRank}-${u.id}`;
          seenRefs.add(ref);
          toCreate.push({ user_id: u.id, type: 'tier', ref, title: `You ranked up to ${tierName(e.points)}!`, body: `You're now at ${e.points} pts on the WilbanksFishing leaderboard.`, link_url: '/Leaderboard', icon: 'trophy', read: false });
        }
      }
      sorted.slice(0, 3).forEach((e, i) => {
        const u = channelToUser[e.youtube_channel_id];
        if (!u) return;
        const ref = `top3-${mk}-${u.id}`;
        if (seenRefs.has(ref)) return;
        seenRefs.add(ref);
        toCreate.push({ user_id: u.id, type: 'top3', ref, title: `You're #${i + 1} on the leaderboard!`, body: `${e.display_name} is in the top 3 this month — keep it up!`, link_url: '/Leaderboard', icon: 'star', read: false });
      });

      if (toCreate.length) {
        const userIds = [...new Set(toCreate.map((n) => n.user_id))];
        const existingNotifs = await base44.asServiceRole.entities.Notification.filter({ user_id: { $in: userIds } });
        const existingRefs = new Set((existingNotifs || []).map((n) => n.ref).filter(Boolean));
        const fresh = toCreate.filter((n) => !existingRefs.has(n.ref));
        if (fresh.length) await base44.asServiceRole.entities.Notification.bulkCreate(fresh);
      }
    } catch (notifErr) {
      console.error('leaderboard notifications error', notifErr?.message || notifErr);
    }

    return Response.json({ synced: true, cached: false, entries: sorted, recent_activity, scanned_videos: videos.length });
  } catch (error) {
    console.error('sync-leaderboard error', error);
    return Response.json({ error: error.message }, { status: 500 });
  } finally {
    syncInProgress = false;
  }
});

// When serving from cache we don't have raw comments, so build a light activity feed
// from the entries' last_active timestamps.
async function buildActivityFromEntries(base44, entries) {
  return entries
    .filter((e) => e.last_active)
    .sort((a, b) => new Date(b.last_active).getTime() - new Date(a.last_active).getTime())
    .slice(0, 12)
    .map((e) => ({ author: e.display_name, action: 'was active', target: '', ts: e.last_active }));
}