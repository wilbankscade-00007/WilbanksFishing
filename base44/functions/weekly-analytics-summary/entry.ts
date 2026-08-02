import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';

const ADMIN_EMAIL = 'wilbankscade@gmail.com';
const WEEK_MS = 7 * 24 * 60 * 60 * 1000;
const LIVE_MS = 45 * 1000;

function num(n) {
  const v = Number(n);
  if (!isFinite(v)) return '0';
  return Math.round(v).toLocaleString('en-US');
}
function money(n) {
  const v = Number(n);
  if (!isFinite(v) || v === 0) return '$0';
  return '$' + v.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}
function esc(s) {
  return String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}
function isWithin(iso, sinceMs) {
  if (!iso) return false;
  const t = new Date(iso).getTime();
  if (!isFinite(t)) return false;
  return Date.now() - t < sinceMs;
}
function prettyDay(iso) {
  if (!iso) return '';
  return new Date(iso).toLocaleDateString('en-US', { weekday: 'short', month: 'numeric', day: 'numeric', timeZone: 'America/Chicago' });
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    // Admin-only: this function aggregates sensitive business metrics and emails
    // them to the admin. Block unauthenticated direct calls.
    try {
      const me = await base44.auth.me();
      if (!me || me.role !== 'admin') {
        return Response.json({ error: 'Unauthorized' }, { status: 403 });
      }
    } catch (e) {
      return Response.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const [sessions, users, orders, subscribers, reactions, messages, leaders] = await Promise.all([
      base44.asServiceRole.entities.ActiveSession.list('-last_seen', 1000),
      base44.asServiceRole.entities.User.list('-created_date', 1000),
      base44.asServiceRole.entities.Order.list('-created_date', 1000),
      base44.asServiceRole.entities.NewsletterSubscriber.list('-created_date', 1000),
      base44.asServiceRole.entities.Reaction.list('-created_date', 1000),
      base44.asServiceRole.entities.ChatMessage.list('-created_date', 1000),
      base44.asServiceRole.entities.LeaderboardEntry.list('-points', 10),
    ]);

    const weekSessions = (sessions || []).filter(s => isWithin(s.last_seen, WEEK_MS));
    const liveNow = (sessions || []).filter(s => isWithin(s.last_seen, LIVE_MS));
    const newUsers = (users || []).filter(u => isWithin(u.created_date, WEEK_MS));
    const newSubs = (subscribers || []).filter(n => isWithin(n.created_date, WEEK_MS));
    const weekOrders = (orders || []).filter(o => isWithin(o.created_date, WEEK_MS));
    const weekRevenue = weekOrders.reduce((sum, o) => sum + (o.total || 0), 0);
    const weekReactions = (reactions || []).filter(r => isWithin(r.created_date, WEEK_MS));
    const weekMessages = (messages || []).filter(m => isWithin(m.created_date, WEEK_MS));

    // New signups by day (last 7)
    const byDay = {};
    newUsers.forEach(u => {
      if (!u.created_date) return;
      const key = new Date(u.created_date).toLocaleDateString('en-US', { weekday: 'short', month: 'numeric', day: 'numeric', timeZone: 'America/Chicago' });
      byDay[key] = (byDay[key] || 0) + 1;
    });

    // Top countries from this week's visitors
    const byCountry = {};
    weekSessions.forEach(s => {
      const c = s.country || 'Unknown';
      byCountry[c] = (byCountry[c] || 0) + 1;
    });
    const topCountries = Object.entries(byCountry).sort((a, b) => b[1] - a[1]).slice(0, 8);

    // Top leaderboard members (all-time points)
    const topLeaders = (leaders || []).slice(0, 5).map(l => ({ name: l.display_name, points: l.points || 0 }));

    const dayKeys = Object.keys(byDay);
    const dayRows = dayKeys.length
      ? dayKeys.map(d => `<tr><td style="padding:6px 10px;border-bottom:1px solid #2a1010">${esc(d)}</td><td style="text-align:right;padding:6px 10px;border-bottom:1px solid #2a1010">${byDay[d]}</td></tr>`).join('')
      : '<tr><td colspan="2" style="padding:10px;color:#888">No signups this week</td></tr>';
    const countryRows = topCountries.length
      ? topCountries.map(([c, n]) => `<tr><td style="padding:6px 10px;border-bottom:1px solid #2a1010">${esc(c)}</td><td style="text-align:right;padding:6px 10px;border-bottom:1px solid #2a1010">${n}</td></tr>`).join('')
      : '<tr><td colspan="2" style="padding:10px;color:#888">No visits this week</td></tr>';
    const leaderRows = topLeaders.length
      ? topLeaders.map((l, i) => `<tr><td style="padding:6px 10px;border-bottom:1px solid #2a1010">${i + 1}. ${esc(l.name)}</td><td style="text-align:right;padding:6px 10px;border-bottom:1px solid #2a1010">${num(l.points)}</td></tr>`).join('')
      : '<tr><td colspan="2" style="padding:10px;color:#888">No leaderboard data</td></tr>';

    const dateLabel = `${prettyDay(new Date(Date.now() - WEEK_MS).toISOString())} – ${prettyDay(new Date().toISOString())}`;

    const html = `<!doctype html><html><body style="margin:0;padding:0;background:#0A0A0A;font-family:Inter,Arial,sans-serif;color:#E2E8F0">
  <div style="max-width:600px;margin:0 auto;padding:24px">
    <div style="text-align:center;padding:20px 16px;border:1px solid #E10000;border-radius:4px;background:linear-gradient(135deg,#1C1010,#0A0A0A)">
      <p style="margin:0;font-size:11px;letter-spacing:3px;text-transform:uppercase;color:#E10000">Weekly Site Summary</p>
      <h1 style="margin:6px 0 2px;font-size:26px;font-weight:800;text-transform:uppercase;letter-spacing:1px">WilbanksFishing</h1>
      <p style="margin:0;font-size:13px;color:#E2E8F0">${esc(dateLabel)}</p>
    </div>

    <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-top:18px">
      <div style="border:1px solid #2a1010;border-radius:4px;padding:12px;background:#111">
        <p style="margin:0;font-size:10px;letter-spacing:1px;text-transform:uppercase;color:#888">Visitors (7d)</p>
        <p style="margin:4px 0 0;font-size:24px;font-weight:700;color:#E10000">${num(weekSessions.length)}</p>
      </div>
      <div style="border:1px solid #2a1010;border-radius:4px;padding:12px;background:#111">
        <p style="margin:0;font-size:10px;letter-spacing:1px;text-transform:uppercase;color:#888">Live Now</p>
        <p style="margin:4px 0 0;font-size:24px;font-weight:700">${num(liveNow.length)}</p>
      </div>
      <div style="border:1px solid #2a1010;border-radius:4px;padding:12px;background:#111">
        <p style="margin:0;font-size:10px;letter-spacing:1px;text-transform:uppercase;color:#888">New Members</p>
        <p style="margin:4px 0 0;font-size:24px;font-weight:700">${num(newUsers.length)}</p>
      </div>
      <div style="border:1px solid #2a1010;border-radius:4px;padding:12px;background:#111">
        <p style="margin:0;font-size:10px;letter-spacing:1px;text-transform:uppercase;color:#888">Newsletter Subs</p>
        <p style="margin:4px 0 0;font-size:24px;font-weight:700">${num(newSubs.length)}</p>
      </div>
      <div style="border:1px solid #2a1010;border-radius:4px;padding:12px;background:#111">
        <p style="margin:0;font-size:10px;letter-spacing:1px;text-transform:uppercase;color:#888">Crew Posts (7d)</p>
        <p style="margin:4px 0 0;font-size:20px;font-weight:700">${num(weekReactions.length + weekMessages.length)}</p>
      </div>
      <div style="border:1px solid #2a1010;border-radius:4px;padding:12px;background:#111">
        <p style="margin:0;font-size:10px;letter-spacing:1px;text-transform:uppercase;color:#888">Orders / Revenue</p>
        <p style="margin:4px 0 0;font-size:20px;font-weight:700">${num(weekOrders.length)} · ${money(weekRevenue)}</p>
      </div>
    </div>

    <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-top:18px">
      <div>
        <h3 style="margin:0 0 8px;font-size:13px;letter-spacing:1px;text-transform:uppercase;color:#E10000">New Members by Day</h3>
        <table width="100%" style="border-collapse:collapse;font-size:12px"><thead><tr style="color:#888">
          <th style="text-align:left;padding:6px 10px;border-bottom:1px solid #2a1010">Day</th>
          <th style="text-align:right;padding:6px 10px;border-bottom:1px solid #2a1010">Signups</th>
        </tr></thead><tbody>${dayRows}</tbody></table>
      </div>
      <div>
        <h3 style="margin:0 0 8px;font-size:13px;letter-spacing:1px;text-transform:uppercase;color:#E10000">Top Visitor Countries</h3>
        <table width="100%" style="border-collapse:collapse;font-size:12px"><thead><tr style="color:#888">
          <th style="text-align:left;padding:6px 10px;border-bottom:1px solid #2a1010">Country</th>
          <th style="text-align:right;padding:6px 10px;border-bottom:1px solid #2a1010">Visits</th>
        </tr></thead><tbody>${countryRows}</tbody></table>
      </div>
    </div>

    <h3 style="margin:22px 0 8px;font-size:13px;letter-spacing:1px;text-transform:uppercase;color:#E10000">Leaderboard Top 5</h3>
    <table width="100%" style="border-collapse:collapse;font-size:13px"><thead><tr style="color:#888">
      <th style="text-align:left;padding:6px 10px;border-bottom:1px solid #2a1010">Member</th>
      <th style="text-align:right;padding:6px 10px;border-bottom:1px solid #2a1010">Points</th>
    </tr></thead><tbody>${leaderRows}</tbody></table>

    <p style="margin:24px 0 0;font-size:11px;color:#555;text-align:center">Total members: ${num(users.length)} · Total sessions tracked: ${num(sessions.length)} · Delivered automatically by Base44</p>
  </div></body></html>`;

    await base44.asServiceRole.integrations.Core.SendEmail({
      to: ADMIN_EMAIL,
      subject: `WilbanksFishing — Weekly Site Summary (${dateLabel})`,
      body: html,
    });

    return Response.json({
      ok: true,
      range: dateLabel,
      stats: {
        weekVisitors: weekSessions.length,
        liveNow: liveNow.length,
        newMembers: newUsers.length,
        newSubscribers: newSubs.length,
        weekOrders: weekOrders.length,
        weekRevenue,
        weekPosts: weekReactions.length + weekMessages.length,
        totalMembers: users.length,
      },
      sent: true,
    });
  } catch (error) {
    console.error('weekly-analytics-summary error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});