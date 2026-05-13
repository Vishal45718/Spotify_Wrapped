import { NextRequest, NextResponse } from 'next/server';
import { getIronSession } from 'iron-session';
import { cookies } from 'next/headers';
import { SessionData, sessionOptions } from '@/lib/session';
import { SpotifyService } from '@/services/spotify';
import { processInsights } from '@/utils/scoring';
import { getGenreTravelData } from '@/utils/genreLocations';
import { kv } from '@/lib/kv';
import { TimeRange } from '@/types/spotify';

/** Attempt to refresh the access token if expired */
async function tryRefreshToken(session: SessionData): Promise<boolean> {
  if (!session.refreshToken || session.isDemo) return false;
  if (session.expiresAt && Date.now() < session.expiresAt - 60000) return false; // Still valid

  try {
    const tokenParams = new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: session.refreshToken,
    });
    const authHeader = Buffer.from(
      `${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`
    ).toString('base64');

    const res = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Authorization: `Basic ${authHeader}`,
      },
      body: tokenParams.toString(),
    });

    if (!res.ok) return false;

    const data = await res.json();
    session.accessToken = data.access_token;
    session.expiresAt = Date.now() + data.expires_in * 1000;
    if (data.refresh_token) session.refreshToken = data.refresh_token;

    return true;
  } catch {
    return false;
  }
}

export async function GET(req: NextRequest) {
  const cookieStore = await cookies();
  const session = await getIronSession<SessionData>(cookieStore, sessionOptions);

  if (!session.isLoggedIn || !session.accessToken) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Auto-refresh expired tokens
  const refreshed = await tryRefreshToken(session);
  if (refreshed) {
    await session.save();
  }

  const url = new URL(req.url);
  const timeRange = (url.searchParams.get('timeRange') as TimeRange) || 'long_term';
  const cacheKey = `insights:${session.userId}:${timeRange}`;

  try {
    const cached = await kv.get(cacheKey);
    if (cached) return NextResponse.json(cached);
  } catch (e) {
    // KV unavailable — proceed without cache
  }

  // Demo mode returns mock data
  if (session.isDemo || session.accessToken === 'demo_token' || session.accessToken === 'mock_token') {
    const demoTopGenres = [
      { genre: 'Pop', count: 42 },
      { genre: 'K-Pop', count: 38 },
      { genre: 'Reggaeton', count: 32 },
      { genre: 'Hip Hop', count: 25 },
      { genre: 'Indie Rock', count: 20 },
    ];
    const mockInsights = {
      topArtists: [
        { id: '1', name: 'Daft Punk', genres: ['electronic', 'french house'], images: [], popularity: 82, external_urls: { spotify: '#' } },
        { id: '2', name: 'The Weeknd', genres: ['canadian pop', 'r&b'], images: [], popularity: 95, external_urls: { spotify: '#' } },
        { id: '3', name: 'Radiohead', genres: ['alternative rock', 'art rock'], images: [], popularity: 78, external_urls: { spotify: '#' } },
        { id: '4', name: 'Kendrick Lamar', genres: ['conscious hip hop', 'west coast rap'], images: [], popularity: 90, external_urls: { spotify: '#' } },
        { id: '5', name: 'Tame Impala', genres: ['neo-psychedelic', 'indie pop'], images: [], popularity: 85, external_urls: { spotify: '#' } },
      ],
      topTracks: [
        { id: '1', name: 'One More Time', duration_ms: 320000, popularity: 88, artists: [{ name: 'Daft Punk' }], album: { name: 'Discovery', images: [{ url: 'https://i.scdn.co/image/ab67616d0000b273b0fcdd53958eeefba821e25e' }] }, external_urls: { spotify: '#' } },
        { id: '2', name: 'Blinding Lights', duration_ms: 200000, popularity: 96, artists: [{ name: 'The Weeknd' }], album: { name: 'After Hours', images: [{ url: 'https://i.scdn.co/image/ab67616d0000b273881d8d8378cd01099babcd44' }] }, external_urls: { spotify: '#' } },
        { id: '3', name: 'Creep', duration_ms: 237000, popularity: 80, artists: [{ name: 'Radiohead' }], album: { name: 'Pablo Honey', images: [{ url: 'https://i.scdn.co/image/ab67616d0000b273df55e326ed144ab4f5cecf95' }] }, external_urls: { spotify: '#' } },
        { id: '4', name: 'Alright', duration_ms: 219000, popularity: 85, artists: [{ name: 'Kendrick Lamar' }], album: { name: 'To Pimp a Butterfly', images: [{ url: 'https://i.scdn.co/image/ab67616d0000b273cdb645498cd3d8a2bf170cb6' }] }, external_urls: { spotify: '#' } },
        { id: '5', name: 'The Less I Know The Better', duration_ms: 216000, popularity: 92, artists: [{ name: 'Tame Impala' }], album: { name: 'Currents', images: [{ url: 'https://i.scdn.co/image/ab67616d0000b2739e1cfc756886ac782e363d79' }] }, external_urls: { spotify: '#' } },
      ],
      topGenres: demoTopGenres,
      scores: { mood: 82, energy: 76, discovery: 65, diversity: 90 },
      personality: 'Genre Tourist',
      listeningHours: Array.from({ length: 24 }).map((_, i) => ({ hour: i, count: Math.floor(Math.random() * 50) })),
      totalListeningMinutes: 42350,
      locationData: getGenreTravelData(demoTopGenres, 'US'),
    };

    try { await kv.set(cacheKey, mockInsights, { ex: 21600 }); } catch {}
    return NextResponse.json(mockInsights);
  }

  // Real Spotify data fetch
  try {
    const spotify = new SpotifyService(session.accessToken);
    const [me, artists, tracks, recent] = await Promise.all([
      spotify.getMe(),
      spotify.getTopArtists(timeRange),
      spotify.getTopTracks(timeRange),
      spotify.getRecentlyPlayed(),
    ]);

    const audioFeatures = await spotify.getAudioFeatures(tracks.map(t => t.id));
    const insights = processInsights({
      artists,
      tracks,
      recent,
      audioFeatures,
      userCountryCode: me.country,
    });

    try { await kv.set(cacheKey, insights, { ex: 21600 }); } catch {}

    return NextResponse.json(insights);
  } catch (error: any) {
    if (error?.status === 401) {
      return NextResponse.json({ error: 'Session expired. Please re-login.' }, { status: 401 });
    }
    console.error('Insights error:', error);
    return NextResponse.json({ error: 'Failed to process insights' }, { status: 500 });
  }
}
