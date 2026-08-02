import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, CircleMarker, Tooltip } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { motion } from 'framer-motion';
import { Radio, Loader2, MapPin, Globe, Users } from 'lucide-react';
import { base44 } from '@/api/base44Client';

function countryName(code) {
  try {
    return new Intl.DisplayNames(['en'], { type: 'region' }).of(code) || code;
  } catch (_) {
    return code;
  }
}

export default function ActiveUsersTab() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchActive = async () => {
    try {
      const res = await base44.functions.invoke('active-users', {});
      setData(res?.data || res);
    } catch (e) {}
    setLoading(false);
  };

  useEffect(() => {
    fetchActive();
    const id = setInterval(fetchActive, 15000);
    return () => clearInterval(id);
  }, []);

  const count = data?.count ?? 0;
  const active = data?.active || [];
  const pins = active.filter((a) => a.latitude != null && a.longitude != null);

  // Group by city, country
  const groups = {};
  for (const a of active) {
    const loc = [a.city, a.country_code ? countryName(a.country_code) : a.country].filter(Boolean).join(', ');
    const key = loc || 'Unknown location';
    if (!groups[key]) groups[key] = { count: 0, country_code: a.country_code };
    groups[key].count++;
  }
  const groupList = Object.entries(groups).sort((a, b) => b[1].count - a[1].count);
  const members = active.filter((a) => a.member_name || a.member_email);

  const markers = pins.map((a, i) => {
    const label = [a.city, a.country_code ? countryName(a.country_code) : a.country].filter(Boolean).join(', ') || 'Unknown';
    return (
      <CircleMarker
        key={i}
        center={[a.latitude, a.longitude]}
        radius={6}
        pathOptions={{ color: '#E10000', weight: 1, fillColor: '#E10000', fillOpacity: 0.7 }}
      >
        <Tooltip direction="top" offset={[0, -4]} opacity={1}>
          <span style={{ fontWeight: 700 }}>{a.member_name ? `${a.member_name} · ` : ''}{label}</span>
        </Tooltip>
      </CircleMarker>
    );
  });

  return (
    <div>
      <div className="flex items-center gap-2 mb-1">
        <Radio className="w-5 h-5 text-[#E10000]" />
        <h2 className="font-heading font-bold text-2xl text-[#E2E8F0] uppercase">Active Right Now</h2>
      </div>
      <p className="text-sm text-[#E2E8F0]/50 mb-6 flex items-center gap-2">
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#E10000] opacity-75" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-[#E10000]" />
        </span>
        {count} {count === 1 ? 'visitor' : 'visitors'} on the site · refreshes every 15s
      </p>

      <div className="grid lg:grid-cols-3 gap-4">
        {/* Map */}
        <div className="lg:col-span-2 relative rounded-sm border border-[#1C1010] overflow-hidden">
          <div className="h-[360px] md:h-[460px] w-full bg-[#0A0A0A]">
            <MapContainer
              center={[20, 0]}
              zoom={2}
              minZoom={2}
              worldCopyJump
              scrollWheelZoom={false}
              className="h-full w-full"
              style={{ background: '#0A0A0A' }}
            >
              <TileLayer
                url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                attribution='&copy; OpenStreetMap &copy; CARTO'
                subdomains="abcd"
                maxZoom={19}
              />
              {markers}
            </MapContainer>
          </div>
          {loading && (
            <div className="absolute inset-0 flex items-center justify-center bg-[#0A0A0A]/70 pointer-events-none">
              <Loader2 className="w-5 h-5 animate-spin text-[#E10000]" />
            </div>
          )}
          {!loading && pins.length === 0 && (
            <div className="absolute inset-0 flex items-center justify-center bg-[#0A0A0A]/70 pointer-events-none">
              <span className="text-[10px] tracking-[0.3em] uppercase text-[#E2E8F0]/40 text-center px-6">
                {count > 0 ? 'Locating active visitors…' : 'No active visitors right now'}
              </span>
            </div>
          )}
        </div>

        {/* Location list */}
        <div className="border border-[#1C1010] rounded-sm bg-[#1C1010]/20 p-5">
          <div className="flex items-center gap-2 mb-4">
            <Globe className="w-4 h-4 text-[#E10000]" />
            <p className="text-[10px] tracking-[0.3em] uppercase text-[#E2E8F0]/50">Locations</p>
          </div>
          {groupList.length === 0 ? (
            <p className="text-xs text-[#E2E8F0]/40 italic">No active visitors right now.</p>
          ) : (
            <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1">
              {groupList.map(([loc, info]) => (
                <div key={loc}>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-[#E2E8F0] truncate pr-2 inline-flex items-center gap-1.5">
                      <MapPin className="w-3 h-3 text-[#E10000] shrink-0" />{loc}
                    </span>
                    <span className="text-[#E10000] font-semibold shrink-0">{info.count}</span>
                  </div>
                  <div className="h-1.5 bg-[#1C1010] rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${(info.count / Math.max(1, groupList[0][1].count)) * 100}%` }}
                      transition={{ duration: 0.5 }}
                      className="h-full bg-[#E10000]"
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {members.length > 0 && (
        <div className="mt-4 border border-[#1C1010] rounded-sm bg-[#1C1010]/20 p-5">
          <div className="flex items-center gap-2 mb-4">
            <Users className="w-4 h-4 text-[#E10000]" />
            <p className="text-[10px] tracking-[0.3em] uppercase text-[#E2E8F0]/50">Members Online</p>
          </div>
          <div className="space-y-2 max-h-[260px] overflow-y-auto pr-1">
            {members.map((m, i) => (
              <div key={i} className="flex items-center justify-between gap-3 text-xs">
                <span className="text-[#E2E8F0] truncate">{m.member_name || 'Member'}</span>
                <span className="text-[#E2E8F0]/40 truncate">{m.member_email || ''}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}