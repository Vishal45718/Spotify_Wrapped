import { NextRequest, NextResponse } from 'next/server';
import { getIronSession } from 'iron-session';
import { SessionData, sessionOptions } from '@/lib/session';
import { SpotifyService } from '@/services/spotify';
import { processInsights } from '@/utils/scoring';
import { kv } from '@/lib/kv';
import { TimeRange } from '@/types/spotify';
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

// Only init ratelimit if KV URL is present
const ratelimit = process.env.KV_REST_API_URL 
  ? new Ratelimit({
      redis: Redis.fromEnv(),
      limiter: Ratelimit.slidingWindow(10, '1 m'),
      analytics: true,
    })
  : null;

export async function GET(req: NextRequest) {
  const ip = req.ip || '127.0.0.1';
  if (ratelimit) {
    const { success } = await ratelimit.limit(`ratelimit_${ip}`);
    if (!success) {
      return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
    }
  }

  const res = NextResponse.json({});
  const session = await getIronSession<SessionData>(req as any, res as any, sessionOptions);

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
