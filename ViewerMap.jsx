import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, CircleMarker, Tooltip } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { motion } from 'framer-motion';
import { Globe, Eye, Clock, TrendingUp } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { COUNTRY_CENTROIDS } from '@/lib/countryCentroids';

function formatNum(n) {
  if (n == null) return '0';
  if (n >= 1000000) return (n / 1000000).toFixed(1) + 'M';
  if (n >= 1000) return (n / 1000).toFixed(1) + 'K';
  return String(n);
}

function countryName(code) {
  try {
    return new Intl.DisplayNames(['en'], { type: 'region' }).of(code) || code;
  } catch (_) {
    return code;
  }
}

export default function ViewerMap() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    base44.functions.invoke('youtube-viewer-geography', {})
      .then((res) => setData(res?.data || res))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const countries = data?.countries || [];
  const totalViews = data?.total_views || 0;
  const maxViews = Math.max(1, ...countries.map((c) => c.views));
  const top = [...countries].sort((a, b) => b.views - a.views).slice(0, 8);

  const markers = countries
    .map((c) => {
      const ll = COUNTRY_CENTROIDS[c.code];
      if (!ll) return null;
      const r = 5 + Math.sqrt(c.views / maxViews) * 28;
      return (
        <CircleMarker
          key={c.code}
          center={ll}
          radius={r}
          pathOptions={{ color: '#E10000', weight: 1, fillColor: '#E10000', fillOpacity: 0.55 }}
        >
          <Tooltip direction="top" offset={[0, -4]} opacity={1} className="viewer-tooltip">
            <span style={{ fontWeight: 700 }}>{countryName(c.code)}</span>
            <br />
            {formatNum(c.views)} views
          </Tooltip>
        </CircleMarker>
      );
    })
    .filter(Boolean);

  return (
    <div className="mb-16">
      <div className="flex items-center gap-2 mb-6">
        <Globe className="w-4 h-4 text-[#E10000]" />
        <span className="text-[10px] tracking-[0.4em] text-[#E10000] uppercase">Where the World Watches From</span>
      </div>

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
              <span className="text-[10px] tracking-[0.3em] uppercase text-[#E2E8F0]/50">Mapping viewers…</span>
            </div>
          )}
          {!loading && countries.length === 0 && (
            <div className="absolute inset-0 flex items-center justify-center bg-[#0A0A0A]/70 pointer-events-none">
              <span className="text-[10px] tracking-[0.3em] uppercase text-[#E2E8F0]/40 text-center px-6">
                {data?.configured === false
                  ? 'Viewer map connecting — channel owner authorization needed'
                  : 'No viewer geography data yet'}
              </span>
            </div>
          )}
          <div className="absolute bottom-2 right-2 z-[400] flex items-center gap-2 px-2 py-1 bg-[#0A0A0A]/80 border border-[#1C1010] rounded-sm">
            <span className="w-2.5 h-2.5 rounded-full bg-[#E10000]/40" />
            <span className="w-3.5 h-3.5 rounded-full bg-[#E10000]/70" />
            <span className="w-5 h-5 rounded-full bg-[#E10000]" />
            <span className="text-[9px] uppercase tracking-wider text-[#E2E8F0]/40 ml-1">More views</span>
          </div>
        </div>

        {/* Side panel */}
        <div className="border border-[#1C1010] rounded-sm bg-[#1C1010]/20 p-5">
          <div className="grid grid-cols-2 gap-3 mb-5">
            <div>
              <p className="text-[10px] uppercase tracking-wider text-[#E2E8F0]/50">Views (All Time)</p>
              <p className="font-heading font-extrabold text-2xl text-[#E2E8F0] flex items-center gap-1">
                <Eye className="w-4 h-4 text-[#E10000]" />{formatNum(totalViews)}
              </p>
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-wider text-[#E2E8F0]/50">Countries</p>
              <p className="font-heading font-extrabold text-2xl text-[#E2E8F0] flex items-center gap-1">
                <TrendingUp className="w-4 h-4 text-[#E10000]" />{countries.length}
              </p>
            </div>
          </div>

          <p className="text-[10px] tracking-[0.3em] uppercase text-[#E2E8F0]/50 mb-3">Top Regions</p>
          {top.length === 0 ? (
            <p className="text-xs text-[#E2E8F0]/40 italic">Awaiting viewer data.</p>
          ) : (
            <div className="space-y-2.5">
              {top.map((c) => (
                <div key={c.code}>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-[#E2E8F0] truncate pr-2">{countryName(c.code)}</span>
                    <span className="text-[#E2E8F0]/60 shrink-0">{formatNum(c.views)}</span>
                  </div>
                  <div className="h-1.5 bg-[#1C1010] rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${(c.views / maxViews) * 100}%` }}
                      transition={{ duration: 0.6 }}
                      className="h-full bg-[#E10000]"
                    />
                  </div>
                </div>
              ))}
            </div>
          )}

          {data?.end_date && (
            <p className="text-[9px] text-[#E2E8F0]/30 mt-4 flex items-center gap-1">
              <Clock className="w-3 h-3" /> All time through {data.end_date}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}