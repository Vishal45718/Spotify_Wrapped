import { NextRequest, NextResponse } from 'next/server';
import { getIronSession } from 'iron-session';
import { cookies } from 'next/headers';
import { SessionData, sessionOptions } from '@/lib/session';
import { SpotifyService } from '@/services/spotify';
import { processInsights } from '@/utils/scoring';
import { kv } from '@/lib/kv';
import { TimeRange } from '@/types/spotify';

export async function GET(req: NextRequest) {
  const cookieStore = await cookies();
  const session = await getIronSession<SessionData>(cookieStore, sessionOptions);

  if (!session.isLoggedIn || !session.accessToken) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const url = new URL(req.url);
  const timeRange = (url.searchParams.get('timeRange') as TimeRange) || 'long_term';

  const cacheKey = `insights:${session.userId}:${timeRange}`;
  
  try {
    const cached = await kv.get(cacheKey);
    if (cached) {
      return NextResponse.json(cached);
    }
  } catch (e) {
    console.warn('KV GET error', e);
  }

  // Return mock data when using mock authentication
  if (session.accessToken === 'mock_token') {
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
      topGenres: [
        { genre: 'Pop', count: 42 },
        { genre: 'Electronic', count: 38 },
        { genre: 'Hip Hop', count: 25 },
        { genre: 'Indie Rock', count: 20 },
        { genre: 'R&B', count: 15 },
      ],
      scores: {
        mood: 82,
        energy: 76,
        discovery: 65,
        diversity: 90,
      },
      personality: 'Genre Tourist',
      listeningHours: Array.from({ length: 24 }).map((_, i) => ({ hour: i, count: Math.floor(Math.random() * 50) })),
      totalListeningMinutes: 42350,
    };

    try {
      await kv.set(cacheKey, mockInsights, { ex: 21600 });
    } catch (e) {
      console.warn('KV SET error', e);
    }
    return NextResponse.json(mockInsights);
  }

  try {
    const spotify = new SpotifyService(session.accessToken);
    const [artists, tracks, recent] = await Promise.all([
      spotify.getTopArtists(timeRange),
      spotify.getTopTracks(timeRange),
      spotify.getRecentlyPlayed(),
    ]);

    const audioFeatures = await spotify.getAudioFeatures(tracks.map(t => t.id));
    const insights = processInsights({ artists, tracks, recent, audioFeatures });

    try {
      await kv.set(cacheKey, insights, { ex: 21600 }); // 6h TTL
    } catch (e) {
      console.warn('KV SET error', e);
    }

    return NextResponse.json(insights);
  } catch (error: any) {
    console.error('Insights error:', error);
    return NextResponse.json({ error: 'Failed to process insights' }, { status: 500 });
  }
}
