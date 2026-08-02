import { createClientFromRequest } from 'npm:@base44/sdk@0.8.38';

// Only allow well-formed IPv4 / IPv6 literals before interpolating into a URL,
// preventing path traversal or SSRF via a spoofed X-Forwarded-For header.
const IP_RE = /^(?:(?:25[0-5]|2[0-4]\d|1?\d?\d)\.){3}(?:25[0-5]|2[0-4]\d|1?\d?\d)$|^(?:[0-9a-fA-F]{1,4}:){2,7}[0-9a-fA-F]{1,4}$|^::1$|^::$$/;
function isValidIp(ip) {
  return typeof ip === 'string' && IP_RE.test(ip);
}

function isPrivateIp(ip) {
  if (!ip) return true;
  if (ip === '::1' || ip === 'localhost' || ip === '0.0.0.0') return true;
  if (ip.startsWith('127.') || ip.startsWith('10.') || ip.startsWith('192.168.') ||
      ip.startsWith('169.254.') || ip.startsWith('100.64.')) return true;
  // 172.16.0.0 – 172.31.255.255 is private
  if (ip.startsWith('172.')) {
    const second = parseInt(ip.split('.')[1], 10);
    if (second >= 16 && second <= 31) return true;
  }
  return false;
}

// Try every common client-IP header so the real visitor IP is found regardless
// of the edge/proxy in front of Deno Deploy (Cloudflare, Fly, nginx, etc.).
function detectIp(req) {
  const headers = ['x-forwarded-for', 'cf-connecting-ip', 'x-real-ip', 'true-client-ip', 'fly-client-ip'];
  for (const h of headers) {
    const v = req.headers.get(h);
    if (!v) continue;
    const first = v.split(',')[0].trim();
    if (isValidIp(first) && !isPrivateIp(first)) return first;
  }
  return '';
}

function applyGeo(j) {
  if (!j || !j.latitude || !j.longitude) return null;
  const lat = Number(j.latitude);
  const lon = Number(j.longitude);
  if (!isFinite(lat) || !isFinite(lon)) return null;
  return {
    country: j.country || '',
    country_code: j.country_code || '',
    region: j.region || '',
    city: j.city || '',
    latitude: lat,
    longitude: lon,
  };
}

// Two providers for accuracy: ipwho.is (city/region precise) with geojs as a
// fallback if the first call fails or returns incomplete data.
async function geolocate(ip) {
  if (!isValidIp(ip) || isPrivateIp(ip)) return null;
  try {
    const r = await fetch(`https://ipwho.is/${ip}`, { headers: { accept: 'application/json' } });
    if (r.ok) {
      const j = await r.json();
      if (j && j.success !== false) {
        const m = applyGeo(j);
        if (m) return m;
      }
    }
  } catch (_) {}
  try {
    const r = await fetch(`https://get.geojs.io/v1/ip/geo/${ip}.json`);
    if (r.ok) {
      const j = await r.json();
      const m = applyGeo(j);
      if (m) return m;
    }
  } catch (_) {}
  return null;
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    let body = {};
    try { body = await req.json(); } catch (e) {}
    const session_id = (body && body.session_id) ? String(body.session_id) : '';
    const now = Date.now();
    // Keep a window slightly longer than the 20s ping interval so a single
    // missed ping doesn't drop a still-present visitor.
    const cutoff = now - 45000;
    const nowIso = new Date(now).toISOString();

    const ip = detectIp(req);

    // Resolve the logged-in member (if any) so we can attach their name/email
    // to the session the moment they log in — not just for admins.
    let me = null;
    try { me = await base44.auth.me(); } catch (_) {}
    const isAdmin = !!(me && me.role === 'admin');
    const memberName = me ? (me.full_name || me.email || '') : '';
    const memberEmail = me ? (me.email || '') : '';

    // Upsert this visitor's heartbeat. Geolocate on first creation; if the
    // first attempt had no usable IP, re-geolocate on a later ping so the
    // location becomes accurate as soon as a public IP is visible.
    if (session_id) {
      const found = await base44.asServiceRole.entities.ActiveSession.filter({ session_id });
      if (found && found.length > 0) {
        const existing = found[0];
        const updates = { last_seen: nowIso };
        if (memberName) updates.member_name = memberName;
        if (memberEmail) updates.member_email = memberEmail;
        if ((!existing.latitude || !existing.country) && isValidIp(ip) && !isPrivateIp(ip)) {
          const loc = await geolocate(ip);
          if (loc) {
            updates.country = loc.country;
            updates.country_code = loc.country_code;
            updates.region = loc.region;
            updates.city = loc.city;
            updates.latitude = loc.latitude;
            updates.longitude = loc.longitude;
          }
        }
        await base44.asServiceRole.entities.ActiveSession.update(existing.id, updates);
      } else {
        let loc = null;
        if (isValidIp(ip) && !isPrivateIp(ip)) loc = await geolocate(ip);
        await base44.asServiceRole.entities.ActiveSession.create({
          session_id,
          last_seen: nowIso,
          country: loc?.country || '',
          country_code: loc?.country_code || '',
          region: loc?.region || '',
          city: loc?.city || '',
          latitude: loc?.latitude ?? null,
          longitude: loc?.longitude ?? null,
          member_name: memberName,
          member_email: memberEmail,
        });
      }
    }

    // Group by session_id so multiple tabs on the same device (shared localStorage
    // session_id) count as one person. Also collapses race-condition duplicates.
    const all = await base44.asServiceRole.entities.ActiveSession.list('-created_date', 1000);
    const ts = (s) => s.last_seen instanceof Date ? s.last_seen.getTime() : new Date(s.last_seen).getTime();
    const bySession = new Map();
    for (const s of all) {
      const key = s.session_id || s.id;
      if (!bySession.has(key)) bySession.set(key, []);
      bySession.get(key).push(s);
    }

    let activeCount = 0;
    const active = [];
    const toDelete = [];
    for (const recs of bySession.values()) {
      recs.sort((a, b) => ts(b) - ts(a));
      const latest = recs[0];
      const latestT = ts(latest);
      const isActive = Number.isFinite(latestT) && latestT >= cutoff;
      if (isActive) {
        activeCount++; // one person per device, regardless of tab count
        if (isAdmin) active.push({
          country: latest.country || '',
          country_code: latest.country_code || '',
          region: latest.region || '',
          city: latest.city || '',
          latitude: latest.latitude,
          longitude: latest.longitude,
          last_seen: latest.last_seen,
          member_name: latest.member_name || '',
          member_email: latest.member_email || '',
        });
      }
      // Keep only the latest record per session_id; drop duplicates and any
      // fully-expired session.
      for (let i = 0; i < recs.length; i++) {
        const r = recs[i];
        const keepThis = (i === 0) && Number.isFinite(ts(r)) && ts(r) >= cutoff;
        if (!keepThis) toDelete.push(r);
      }
    }

    // Best-effort cleanup of duplicates and expired sessions
    if (toDelete.length && Math.random() < 0.25) {
      try {
        await base44.asServiceRole.entities.ActiveSession.deleteMany({ id: { $in: toDelete.map((s) => s.id) } });
      } catch (e) {}
    }

    return Response.json(isAdmin ? { count: activeCount, active } : { count: activeCount });
  } catch (error) {
    console.error('active-users error', error?.message || error);
    return Response.json({ count: 0 }, { status: 200 });
  }
});