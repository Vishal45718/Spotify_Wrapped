'use client';

import { memo, useMemo, useState, useCallback } from 'react';
import {
  ComposableMap,
  Geographies,
  Geography,
  Line,
  Marker,
  ZoomableGroup,
} from 'react-simple-maps';
import { m, AnimatePresence } from 'framer-motion';
import type { GenreLocation, InsightsLocationData } from '@/types/insights';
import { getGenreTravelData, greatCircleCoordinates } from '@/utils/genreLocations';

const WORLD_TOPOLOGY =
  'https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json';

const SPOTIFY_GREEN = '#1DB954';

type GeoName = string;

function countryFill(_name: GeoName, heat: number, isDim: boolean) {
  const coldR = isDim ? 8 : 14;
  const coldG = isDim ? 8 : 14;
  const coldB = isDim ? 11 : 18;
  if (heat <= 0) return `rgb(${coldR},${coldG},${coldB})`;
  const t = 0.12 + heat * 0.62;
  const r = Math.round(coldR + (29 - coldR) * t);
  const g = Math.round(coldG + (185 - coldG) * t);
  const b = Math.round(coldB + (84 - coldB) * t);
  return `rgb(${r},${g},${b})`;
}

const MapCanvas = memo(function MapCanvas({
  data,
  active,
  onSelect,
}: {
  data: InsightsLocationData;
  active: GenreLocation | null;
  onSelect: (g: GenreLocation | null) => void;
}) {
  const { hotspots, userOrigin } = data;
  const heatByGeo = useMemo(() => {
    const m = new Map<GeoName, number>();
    for (const h of hotspots) {
      const key = (h.geoName || h.country) as GeoName;
      m.set(key, Math.max(m.get(key) || 0, h.intensity ?? 0));
    }
    return m;
  }, [hotspots]);

  const userCoord = useMemo(
    () => [userOrigin.lng, userOrigin.lat] as [number, number],
    [userOrigin.lat, userOrigin.lng]
  );

  return (
    <div className="relative w-full aspect-[16/9] min-h-[220px] max-h-[520px] rounded-2xl overflow-hidden border border-white/10 bg-gradient-to-b from-[#050508] via-[#0a0a0c] to-black shadow-[inset_0_0_80px_rgba(29,185,84,0.06)]">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_50%_120%,rgba(29,185,84,0.18),transparent_55%)]" />
      <ComposableMap
        projection="geoMercator"
        projectionConfig={{ scale: 128, center: [15, 18] }}
        className="w-full h-full text-[#1DB954]"
        width={960}
        height={520}
      >
        <defs>
          <filter id="travel-glow" x="-40%" y="-40%" width="180%" height="180%">
            <feGaussianBlur stdDeviation="2.2" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <linearGradient id="arc-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor={SPOTIFY_GREEN} stopOpacity="0.05" />
            <stop offset="45%" stopColor={SPOTIFY_GREEN} stopOpacity="0.85" />
            <stop offset="100%" stopColor="#1ed760" stopOpacity="0.35" />
          </linearGradient>
        </defs>
        <ZoomableGroup zoom={1} minZoom={1} maxZoom={1} center={[15, 18]}>
          <Geographies geography={WORLD_TOPOLOGY}>
            {({ geographies }) =>
              geographies.map(geo => {
                const name = (geo.properties as { name?: string }).name ?? '';
                const heat = heatByGeo.get(name) ?? 0;
                const isHot = heat > 0;
                const dim = hotspots.length > 0 && !isHot;
                return (
                  <Geography
                    key={geo.rsmKey}
                    geography={geo}
                    style={{
                      default: {
                        fill: countryFill(name, heat, dim),
                        stroke: 'rgba(255,255,255,0.06)',
                        strokeWidth: 0.35,
                        outline: 'none',
                        transition: 'fill 0.35s ease',
                      },
                      hover: {
                        fill: countryFill(name, Math.max(heat, 0.35), false),
                        stroke: 'rgba(29,185,84,0.35)',
                        strokeWidth: 0.6,
                        outline: 'none',
                      },
                      pressed: {
                        fill: countryFill(name, heat, dim),
                        outline: 'none',
                      },
                    }}
                  />
                );
              })
            }
          </Geographies>

          {hotspots.map(h => {
            const dest: [number, number] = [h.lng, h.lat];
            const coords = greatCircleCoordinates(userCoord, dest, 56);
            const isActive = active?.lat === h.lat && active?.lng === h.lng && active.genre === h.genre;
            return (
              <Line
                key={`${h.genre}-${h.lat}-${h.lng}`}
                coordinates={coords}
                stroke="url(#arc-gradient)"
                strokeWidth={1.1 + (h.intensity ?? 0.35) * 2.2}
                strokeLinecap="round"
                strokeOpacity={isActive ? 0.95 : 0.35 + (h.intensity ?? 0.2) * 0.45}
                filter="url(#travel-glow)"
              />
            );
          })}

          <Marker coordinates={userCoord}>
            <g className="cursor-default">
              <circle r={10} fill="rgba(255,255,255,0.12)" stroke="rgba(255,255,255,0.5)" strokeWidth={1.2} />
              <circle r={4} fill="#fff" className="drop-shadow-[0_0_8px_rgba(255,255,255,0.8)]" />
            </g>
          </Marker>

          {hotspots.map(h => (
            <Marker key={`m-${h.genre}-${h.lat}`} coordinates={[h.lng, h.lat]}>
              <g
                role="button"
                tabIndex={0}
                className="cursor-pointer outline-none"
                onMouseEnter={() => onSelect(h)}
                onMouseLeave={() => onSelect(null)}
                onFocus={() => onSelect(h)}
                onBlur={() => onSelect(null)}
                onKeyDown={e => {
                  if (e.key === 'Enter' || e.key === ' ') onSelect(h);
                }}
              >
                <circle
                  r={18}
                  fill="rgba(29,185,84,0.12)"
                  className="animate-genre-marker-pulse origin-center"
                  style={{ transformBox: 'fill-box', transformOrigin: 'center' }}
                />
                <circle
                  r={7}
                  fill={SPOTIFY_GREEN}
                  stroke="#050508"
                  strokeWidth={2}
                  filter="url(#travel-glow)"
                />
              </g>
            </Marker>
          ))}
        </ZoomableGroup>
      </ComposableMap>

      <AnimatePresence>
        {active && (
          <m.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 4 }}
            transition={{ duration: 0.18 }}
            className="absolute left-3 right-3 bottom-3 md:left-auto md:right-4 md:bottom-4 md:max-w-sm pointer-events-none"
          >
            <div className="rounded-xl border border-[#1DB954]/35 bg-black/85 backdrop-blur-md px-4 py-3 text-sm text-white shadow-lg shadow-black/50">
              <p className="text-[#1DB954] font-semibold text-xs uppercase tracking-wider mb-1">Passport stamp</p>
              <p className="leading-snug">
                Your ears traveled{' '}
                <span className="font-bold text-[#1ed760]">
                  {(active.milesFromUser ?? 0).toLocaleString()} miles
                </span>{' '}
                to {active.city ? `${active.city}, ` : ''}
                {active.country} for <span className="font-semibold capitalize">{active.genre}</span> this year.
              </p>
            </div>
          </m.div>
        )}
      </AnimatePresence>
    </div>
  );
});

export default function GenreTravelMap({
  locationData,
  topGenres,
  userCountryCode,
}: {
  locationData?: InsightsLocationData;
  topGenres: { genre: string; count: number }[];
  userCountryCode?: string;
}) {
  const resolved = useMemo(
    () => locationData ?? getGenreTravelData(topGenres, userCountryCode),
    [locationData, topGenres, userCountryCode]
  );

  const [active, setActive] = useState<GenreLocation | null>(null);
  const onSelect = useCallback((g: GenreLocation | null) => setActive(g), []);

  const hasPins = resolved.hotspots.length > 0;

  return (
    <m.div
      initial="hidden"
      animate="show"
      variants={{
        hidden: { opacity: 0 },
        show: {
          opacity: 1,
          transition: { staggerChildren: 0.08, delayChildren: 0.05 },
        },
      }}
      className="space-y-6"
    >
      <m.div
        variants={{ hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0 } }}
        className="grid grid-cols-1 lg:grid-cols-3 gap-6"
      >
        <div className="lg:col-span-2">
          {!hasPins ? (
            <div className="flex aspect-[16/9] min-h-[200px] items-center justify-center rounded-2xl border border-white/10 bg-black/60 p-8 text-center text-gray-400">
              <p className="max-w-md text-sm">
                Add a few more global genres to your rotation — we could not place this time range on the map yet.
              </p>
            </div>
          ) : (
            <MapCanvas data={resolved} active={active} onSelect={onSelect} />
          )}
        </div>

        <m.div
          variants={{ hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0 } }}
          className="rounded-2xl border border-[#1DB954]/25 bg-gradient-to-br from-white/[0.07] to-black/40 p-5 shadow-[0_0_40px_rgba(29,185,84,0.12)] flex flex-col justify-between gap-4"
        >
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#1DB954]/90 mb-1">Genre passport</p>
            <h3 className="text-lg font-bold text-white leading-tight">Your year in sonic miles</h3>
          </div>
          <dl className="space-y-3 text-sm">
            <div className="flex justify-between gap-3 border-b border-white/10 pb-3">
              <dt className="text-gray-400">Total miles</dt>
              <dd className="font-bold text-white tabular-nums">{resolved.totalMiles.toLocaleString()} mi</dd>
            </div>
            <div className="flex justify-between gap-3 border-b border-white/10 pb-3">
              <dt className="text-gray-400">Countries explored</dt>
              <dd className="font-bold text-white tabular-nums">{resolved.countriesVisited}</dd>
            </div>
            <div className="flex justify-between gap-3 border-b border-white/10 pb-3">
              <dt className="text-gray-400">Intl. favorite</dt>
              <dd className="font-semibold text-right text-white capitalize">
                {resolved.favoriteInternationalGenre ?? '—'}
              </dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt className="text-gray-400">Farthest origin</dt>
              <dd className="text-right">
                <span className="font-semibold text-white capitalize block">
                  {resolved.mostDistantGenre ?? '—'}
                </span>
                {resolved.mostDistantMiles > 0 && (
                  <span className="text-xs text-gray-500">{resolved.mostDistantMiles.toLocaleString()} mi away</span>
                )}
              </dd>
            </div>
          </dl>
          <p className="text-[11px] text-gray-500 leading-relaxed">
            Lines arc from your Spotify profile country hub toward each mapped genre origin — a playful geography, not
            GPS telemetry.
          </p>
        </m.div>
      </m.div>
    </m.div>
  );
}
