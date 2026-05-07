Here's your complete **Spotify Wrapped 2026** production roadmap.---

# **1\. Product Definition**

**One-liner**: A personalized, shareable Spotify Wrapped experience available year-round — not just December.

**Target users**: Spotify power users, music bloggers, playlist curators, social media sharers.

**MVP scope**: OAuth login → fetch top artists/tracks/genres → render animated dashboard → generate shareable PNG card.

**Viral hooks**:

* Share card designed for Instagram Stories (1080×1920 aspect)  
* "Personality type" label (e.g. *"Genre Tourist"*, *"Decade Nostalgist"*)  
* `/share/[userId]` public URL — no login required to view

**Differentiators from official Wrapped**:

* Available 365 days/year, any time range  
* Mood/energy score from audio features  
* Discovery score (% of tracks \< 6 months old)  
* Artist diversity index  
* Download-as-PNG at any time

---

# **2\. Technical Architecture**

**Frontend**: Next.js 14 App Router, TypeScript, Tailwind CSS, Framer Motion, Recharts. All chart pages are CSR via `"use client"` — data fetched client-side after auth.

**Backend/API**: Next.js Route Handlers (`app/api/`). No separate server. Stateless — all state in cookie \+ Vercel KV.

**OAuth flow**: PKCE with `state` param CSRF protection → callback exchanges code → tokens stored in HttpOnly `Secure` `SameSite=Lax` cookie (encrypted with `iron-session`).

**Token refresh**: Middleware checks token expiry on every request. If within 5 min of expiry, auto-refreshes using stored `refresh_token`. New tokens overwrite cookie.

**Data flow**: Client calls `/api/insights` → server reads access token from cookie → fans out Spotify requests in `Promise.all` → processes data → caches result in Vercel KV (TTL: 6h) → returns typed JSON.

**Caching strategy**: Vercel KV keyed by `userId:timeRange`. Cache-hit serves instantly. Cache-miss fetches all Spotify endpoints in parallel (\~800ms).

**Deployment**: Vercel. Edge Middleware for token refresh. Serverless functions for API routes.

**Security**: HttpOnly cookies, PKCE, CSRF state param, Spotify scope minimization, rate limiting via Upstash.

---

# **3\. Full Feature List**

**MVP** (ship in 14 days):

| Feature | Difficulty | Time |
| ----- | ----- | ----- |
| Spotify OAuth PKCE | Medium | 1 day |
| Top artists/tracks/genres | Easy | 1 day |
| Dashboard with 4 charts | Medium | 2 days |
| Personality type label | Easy | 0.5 days |
| Share card (PNG download) | Medium | 1.5 days |
| Mobile-first dark UI | Medium | 1 day |
| Vercel KV caching | Easy | 0.5 days |

**V2**:

| Feature | Difficulty | Time |
| ----- | ----- | ----- |
| Public share URLs | Easy | 0.5 days |
| Mood/energy score | Medium | 1 day |
| Audio features radar chart | Medium | 1 day |
| Time-range toggle (4w/6mo/1yr) | Easy | 0.5 days |
| Artist diversity index | Medium | 1 day |

**WOW** (if viral):

| Feature | Difficulty | Time |
| ----- | ----- | ----- |
| Friend comparison (`/compare/[a]/[b]`) | Hard | 3 days |
| Animated Wrapped-style story slides | Hard | 4 days |
| Listening clock (hourly heatmap) | Medium | 1.5 days |
| Genre travel map (world map overlay) | Hard | 3 days |

---

# **4\. Spotify API Planning**

| Endpoint | Data | Rate Limit |
| ----- | ----- | ----- |
| `GET /me` | User profile, country, display\_name, images | \~100 req/min |
| `GET /me/top/artists?limit=50&time_range=long_term` | Top 50 artists, genres, popularity | \~100 req/min |
| `GET /me/top/tracks?limit=50&time_range=long_term` | Top 50 tracks, duration, popularity | \~100 req/min |
| `GET /audio-features?ids=...` | Valence, energy, danceability, acousticness (100 IDs max per batch) | \~100 req/min |
| `GET /me/player/recently-played?limit=50` | Last 50 plays with timestamps | \~100 req/min |
| `GET /me/playlists?limit=50` | Playlist names, track counts | \~100 req/min |

**Batching strategy**: Audio features accepts 100 track IDs per call — batch top 50 tracks in 1 call. Fan out artists \+ tracks \+ recently-played in `Promise.all` (3 parallel calls). Total cold fetch: \~3 API calls \+ 1 audio features batch \= 4 requests.

**Optimization**: Cache entire processed result in Vercel KV. Serve from cache for 6h. Stale-while-revalidate pattern for background refresh.

**Scopes needed**: `user-top-read user-read-recently-played user-read-private playlist-read-private`

---

# **5\. Database Decision**

**MVP: No database. Vercel KV only.**

Rationale:

* No user persistence needed — data always fetched fresh from Spotify  
* KV suffices for caching processed insights (TTL 6h)  
* Public share cards: store serialized JSON in KV under `/share/[id]`  
* Zero infra overhead, zero cost at MVP scale

**When to add PostgreSQL/Supabase**: If you add friend comparison, leaderboards, or historical trend tracking across weeks. That's V3+.

**Redis/Upstash**: Use Upstash (Vercel-native) for both KV caching and rate limiting. One integration.

---

# **6\. File/Folder Structure**

```
app/
├── (auth)/
│   └── login/page.tsx
├── (dashboard)/
│   ├── dashboard/page.tsx
│   └── share/[id]/page.tsx
├── api/
│   ├── auth/route.ts          # Initiate OAuth
│   ├── callback/route.ts      # Handle OAuth callback
│   ├── insights/route.ts      # Main data endpoint
│   ├── share/route.ts         # Generate share card
│   └── refresh/route.ts       # Token refresh (called by middleware)
├── layout.tsx
├── page.tsx                   # Landing / login
└── middleware.ts              # Token expiry check + refresh

components/
├── charts/
│   ├── GenreDonut.tsx
│   ├── ListeningTrend.tsx
│   ├── TopArtistsBar.tsx
│   ├── MoodRadar.tsx
│   └── EnergyGauge.tsx
├── ui/
│   ├── ShareCard.tsx          # html-to-image target
│   ├── PersonalityBadge.tsx
│   ├── TrackRow.tsx
│   ├── ArtistCard.tsx
│   ├── SkeletonDashboard.tsx
│   └── TimeRangeToggle.tsx
└── providers/
    └── SessionProvider.tsx

services/
├── spotify.ts                 # All Spotify API calls
├── insights.ts                # Data processing logic
└── cache.ts                   # Vercel KV wrapper

hooks/
├── useInsights.ts             # SWR wrapper for /api/insights
├── useTimeRange.ts
└── useShare.ts

types/
├── spotify.ts                 # Typed Spotify API responses
├── insights.ts                # Processed insight types
└── session.ts                 # iron-session types

utils/
├── scoring.ts                 # Personality, mood, diversity scores
├── format.ts                  # Duration, number formatters
└── color.ts                   # Genre → color mapping

lib/
├── session.ts                 # iron-session config
└── kv.ts                      # Upstash KV client

styles/
└── globals.css
```

---

# **7\. UI/UX Plan**

**Pages**:

* `/` — Landing: Spotify green CTA, animated waveform background, social proof  
* `/dashboard` — Main experience: time-range toggle at top, scrollable card sections, sticky share button  
* `/share/[id]` — Public view: read-only share card, "Make your own" CTA

**Component hierarchy**:

```
DashboardPage
├── TimeRangeToggle
├── PersonalityBadge
├── StatsGrid (4 metric cards: tracks, artists, genres, hours)
├── GenreDonut
├── TopArtistsBar
├── TopTracksList
├── MoodRadar
└── ShareCard (portal-rendered for PNG export)
```

**Onboarding**: Single-screen login with "What you'll see" preview cards (blurred/mocked). No multi-step wizard.

**Mobile-first**: All charts responsive via `ResponsiveContainer`. Share card fixed-aspect for Stories. Bottom-sheet for share options on mobile.

**Loading states**: Full `SkeletonDashboard` replaces content during fetch. Charts animate in on mount with Framer Motion `staggerChildren`.

**Dark mode**: Default dark. Spotify palette: `#191414` background, `#1DB954` accent, `#FFFFFF` primary text. Tailwind `dark:` classes throughout.

**Animation strategy**: Page load → stagger card reveals (0.1s delay each). Chart mount → draw animation via Recharts `isAnimationActive`. Share card → pulse effect on hover.

---

# **8\. Recharts Planning**

| Chart | Type | Data Mapping | Notes |
| ----- | ----- | ----- | ----- |
| Genre distribution | `PieChart` \+ `Cell` | `genre → listenCount` | Custom legend with color per genre |
| Top artists | `BarChart` horizontal | `artistName → playCount` | Clickable bars → Spotify link |
| Listening trend | `AreaChart` | `week → minutesListened` | From recently-played timestamps |
| Mood/valence | `RadarChart` | `{energy, valence, danceability, acousticness, instrumentalness}` | Avg across top 50 tracks |
| Listening hours | `BarChart` | `hour → trackCount` | From `played_at` timestamps, 24-bin |

**Performance**: All charts inside `React.memo`. `ResponsiveContainer` with fixed height. Limit data points to 20 for bar charts. Disable animation on low-power devices via `useReducedMotion`.

---

# **9\. OAuth Implementation Plan**

```ts
// /api/auth/route.ts
const state = crypto.randomUUID();
const params = new URLSearchParams({
  client_id: process.env.SPOTIFY_CLIENT_ID!,
  response_type: 'code',
  redirect_uri: process.env.SPOTIFY_REDIRECT_URI!,
  scope: 'user-top-read user-read-recently-played user-read-private',
  state,
});
// Store state in cookie, redirect to Spotify

// /api/callback/route.ts
// Verify state matches cookie
// POST to https://accounts.spotify.com/api/token
// Store { accessToken, refreshToken, expiresAt } in iron-session cookie

// middleware.ts
// On every /dashboard/* request:
// Check session.expiresAt — if within 300s, call /api/refresh
// Transparently swap tokens

// Env vars needed:
SPOTIFY_CLIENT_ID=
SPOTIFY_CLIENT_SECRET=
SPOTIFY_REDIRECT_URI=https://yourapp.com/api/callback
SESSION_SECRET=        # 32+ char random string for iron-session
KV_REST_API_URL=
KV_REST_API_TOKEN=
```

**Token storage**: `iron-session` encrypts and signs the cookie server-side. Never expose tokens to client JS.

---

# **10\. API Layer Design**

```ts
// services/spotify.ts
class SpotifyService {
  constructor(private accessToken: string) {}

  private async fetch<T>(path: string, params?: Record<string, string>): Promise<T> {
    const url = new URL(`https://api.spotify.com/v1${path}`);
    if (params) Object.entries(params).forEach(([k,v]) => url.searchParams.set(k, v));
    
    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${this.accessToken}` },
      next: { revalidate: 0 },
    });
    
    if (res.status === 401) throw new SpotifyAuthError();
    if (res.status === 429) {
      const retryAfter = res.headers.get('Retry-After') ?? '1';
      await sleep(parseInt(retryAfter) * 1000);
      return this.fetch(path, params); // retry once
    }
    if (!res.ok) throw new SpotifyAPIError(res.status);
    return res.json();
  }

  async getTopArtists(range: TimeRange) { /* ... */ }
  async getTopTracks(range: TimeRange) { /* ... */ }
  async getAudioFeatures(ids: string[]) { /* batch 100 max */ }
  async getRecentlyPlayed() { /* ... */ }
}
```

**Route handler pattern**:

```ts
// /api/insights/route.ts
export async function GET(req: Request) {
  const session = await getIronSession(req);
  if (!session.accessToken) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const cacheKey = `insights:${session.userId}:${timeRange}`;
  const cached = await kv.get(cacheKey);
  if (cached) return NextResponse.json(cached);

  const spotify = new SpotifyService(session.accessToken);
  const [artists, tracks, recent] = await Promise.all([
    spotify.getTopArtists(timeRange),
    spotify.getTopTracks(timeRange),
    spotify.getRecentlyPlayed(),
  ]);
  const audioFeatures = await spotify.getAudioFeatures(tracks.map(t => t.id));
  const insights = processInsights({ artists, tracks, recent, audioFeatures });

  await kv.set(cacheKey, insights, { ex: 21600 }); // 6h TTL
  return NextResponse.json(insights);
}
```

---

# **11\. Data Processing Logic**

```ts
// utils/scoring.ts

// Top genres: flatten artist.genres[], count frequency
const topGenres = artists
  .flatMap(a => a.genres)
  .reduce((acc, g) => ({ ...acc, [g]: (acc[g] ?? 0) + 1 }), {})
  // sort by count, take top 5

// Mood score (0–100): avg valence × 100
const moodScore = avg(audioFeatures.map(f => f.valence)) * 100;

// Energy score: avg energy × 100
const energyScore = avg(audioFeatures.map(f => f.energy)) * 100;

// Artist diversity index: # unique genres / total genres (Shannon entropy)
const uniqueGenres = new Set(artists.flatMap(a => a.genres)).size;
const diversityScore = Math.min(uniqueGenres / 30, 1) * 100; // normalize to 30 genres = 100

// Discovery score: % of top tracks released in last 12 months
const discoveryScore = tracks.filter(t => {
  const age = Date.now() - new Date(t.album.release_date).getTime();
  return age < 365 * 24 * 60 * 60 * 1000;
}).length / tracks.length * 100;

// Listening personality (rule-based):
function getPersonality(scores: Scores): string {
  if (scores.discovery > 70) return 'Trendsetter';
  if (scores.diversity > 70) return 'Genre Tourist';
  if (scores.mood > 75 && scores.energy > 70) return 'Euphoric Listener';
  if (scores.mood < 35) return 'Dark Romantic';
  if (scores.energy < 30) return 'Ambient Dreamer';
  return 'Balanced Explorer';
}

// Listening consistency: stddev of daily play counts from recently-played
// Low stddev = consistent listener; high = binge listener
```

---

# **12\. Performance Optimization**

* **API caching**: Vercel KV with 6h TTL. Never hit Spotify twice for same user+range.  
* **Parallel fetching**: `Promise.all` for artists \+ tracks \+ recent. Audio features batched.  
* **Dynamic imports**: All chart components lazy-loaded. `next/dynamic` with `ssr: false`.  
* **Image optimization**: Artist images via `next/image` with `sizes` prop. Spotify CDN URLs.  
* **Chart rendering**: `React.memo` on all chart components. `isAnimationActive={!prefersReducedMotion}`.  
* **SSR/CSR split**: Landing page SSR. Dashboard CSR (token-gated, no SEO value). Share page SSR (public, crawlable OG tags).  
* **Share card PNG**: `html-to-image` runs client-side. Render hidden `ShareCard` div, call `toPng()`, trigger download.  
* **Bundle**: `recharts` tree-shakes well. `framer-motion` use `LazyMotion` \+ `domAnimation` feature set only.

---

# **13\. Security Checklist**

* **PKCE**: Use `code_verifier` \+ `code_challenge` — no client secret exposed in redirect.  
* **CSRF**: Validate `state` param on OAuth callback against cookie value.  
* **Tokens**: Stored only in HttpOnly, Secure, SameSite=Lax cookies via `iron-session`. Never in localStorage.  
* **Env vars**: `SPOTIFY_CLIENT_SECRET` server-only. Never prefixed with `NEXT_PUBLIC_`.  
* **Scope minimization**: Request only `user-top-read user-read-recently-played user-read-private`.  
* **Rate limiting**: Upstash `@upstash/ratelimit` on `/api/insights` — 10 req/min per IP.  
* **Share URLs**: Share card IDs are UUIDs. No user PII in URL. Stored data in KV is non-sensitive (top tracks/artists only).  
* **Cookie expiry**: Session TTL \= Spotify token expiry (1h). Refresh token extends session.

---

# **14\. Deployment Guide**

**Vercel setup**:

```
vercel env add SPOTIFY_CLIENT_ID
vercel env add SPOTIFY_CLIENT_SECRET
vercel env add SPOTIFY_REDIRECT_URI    # https://yourapp.vercel.app/api/callback
vercel env add SESSION_SECRET
vercel env add KV_REST_API_URL         # from Vercel KV dashboard
vercel env add KV_REST_API_TOKEN
```

**Spotify Dashboard config**:

* Add `https://yourapp.vercel.app/api/callback` to Redirect URIs  
* For development: also add `http://localhost:3000/api/callback`  
* Set quota extension request if expecting \>25 users (Spotify dev quota is 25 users until approved)

**Vercel KV**: Create via Vercel dashboard → Storage → KV. Env vars auto-populated.

**Analytics**: Enable Vercel Analytics (`@vercel/analytics`) — one import in `layout.tsx`.

**Monitoring**: Vercel Functions logs. Add Sentry (`@sentry/nextjs`) for error tracking in production.

**Preview deployments**: Each PR gets a preview URL. Add preview callback URLs to Spotify or use a single dev app with `localhost` only.

---

# **15\. 14-Day Execution Plan---**

# **16\. Common Pitfalls**

**Spotify OAuth**:

* Forgetting to request Spotify quota extension — app stays in "development mode" with 25 user cap  
* Not validating `state` param → CSRF vulnerability  
* Using implicit flow instead of PKCE → deprecated, insecure

**Refresh token issues**:

* Not storing `refresh_token` — Spotify only returns it on first auth, never on refresh calls  
* Race condition: two simultaneous requests both try to refresh, one fails with stale token → add mutex or check `expiresAt` with buffer

**Rate limits**:

* Not handling 429 responses → app crashes for active users  
* Forgetting `Retry-After` header — wait that many seconds, not a fixed 1s

**Next.js mistakes**:

* Using `cookies()` in Client Components → server-only, use API route instead  
* Forgetting `export const dynamic = 'force-dynamic'` on token-gated routes → Vercel caches them  
* Shipping `SPOTIFY_CLIENT_SECRET` in a `NEXT_PUBLIC_` env var

**Deployment**:

* Callback URI mismatch (trailing slash, http vs https) → OAuth fails silently  
* Preview deployment URLs not added to Spotify redirect URIs  
* `iron-session` `SESSION_SECRET` not set in production → sessions break

**Chart performance**:

* Rendering Recharts on server → SSR mismatch, always use `dynamic({ ssr: false })`  
* Not memoizing chart data transformations → re-renders on every parent update

---

# **17\. Resume/LinkedIn Positioning**

**Resume bullets**:

* Built full-stack Spotify analytics platform with Next.js 14 App Router, TypeScript, and Spotify Web API; processes 150+ data points per user via parallel API calls with 6h Vercel KV caching  
* Implemented Spotify OAuth 2.0 PKCE flow with iron-session encrypted HttpOnly cookies, CSRF state validation, and automatic token refresh middleware  
* Engineered custom listening personality scoring algorithm (mood, energy, discovery, diversity indices) from audio feature vectors across users' top 50 tracks  
* Designed mobile-first dark dashboard with Recharts animated data visualizations and client-side PNG export via html-to-image

**Portfolio description**: "Year-round Spotify Wrapped — a shareable personal music analytics dashboard. OAuth-secured, server-cached, mobile-first. Built to production quality on Vercel with live data from the Spotify Web API."

**LinkedIn launch post angle**: Frame it as a technical build log — "I reverse-engineered what Spotify Wrapped does and built it in 14 days. Here's the OAuth flow, data processing, and chart architecture." Developer audience engages with the process, not just the product. End with a live link and "open to feedback."

---

# **18\. Final Recommended Stack**

| Concern | Choice | Reason |
| ----- | ----- | ----- |
| Auth | `iron-session` | Server-only, encrypted HttpOnly cookie, zero client exposure |
| Animation | `framer-motion` (LazyMotion) | Best React animation DX, tree-shakeable |
| State management | SWR (`useSWR`) | Minimal, built-in cache/revalidate, perfect for API data |
| Utility | `clsx` \+ `tailwind-merge` | Standard Tailwind composition |
| Image export | `html-to-image` | Best browser PNG quality, no canvas hacks |
| Charting | Recharts | React-native, SSR-safe with dynamic import, good TypeScript support |
| Caching | Upstash Redis (`@upstash/redis`) | Vercel-native KV, free tier sufficient for MVP |
| Rate limiting | `@upstash/ratelimit` | Same Redis instance, sliding window, dead simple |
| Linting | ESLint \+ Prettier \+ `@typescript-eslint` | Standard, non-negotiable |
| Deployment | Vercel | Optimized for Next.js, KV native, preview deploys free |

