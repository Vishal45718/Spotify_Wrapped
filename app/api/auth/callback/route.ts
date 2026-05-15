import { NextRequest, NextResponse } from 'next/server';
import { getIronSession } from 'iron-session';
import { cookies } from 'next/headers';
import { SessionData, sessionOptions } from '@/lib/session';
import { prisma } from '@/lib/prisma';
import { SpotifyService } from '@/services/spotify';
import { isSpotifyConfigured, getRedirectUri } from '@/lib/env';

export async function GET(req: NextRequest) {
  console.log("CALLBACK ROUTE HIT");
  const url = new URL(req.url);
  const code = url.searchParams.get('code');
  const state = url.searchParams.get('state');
  const errorParam = url.searchParams.get('error');

  console.log('--- Spotify Callback ---');
  console.log('Incoming code:', code ? 'present' : 'missing');
  console.log('Incoming state:', state);

  // Spotify may redirect back with ?error=access_denied if user cancels
  if (errorParam) {
    return NextResponse.redirect(new URL('/login?error=access_denied', req.url));
  }

  const storedState = req.cookies.get('spotify_auth_state')?.value;
  console.log('Stored state:', storedState);
  
  const isDemoFlow = code === 'demo_code';

  // CSRF validation — skip for demo flow (cookie doesn't survive same-origin redirect chain)
  if (!code || !state || (!isDemoFlow && state !== storedState)) {
    console.log('CSRF Validation Failed. Code or state mismatch.');
    return NextResponse.redirect(new URL('/login?error=invalid_state', req.url));
  }

  let userProfile: { id: string; display_name: string; email?: string; country?: string; images?: { url: string }[] };
  let access_token: string;
  let refresh_token: string;
  let expires_in: number;

  if (isDemoFlow) {
    access_token = 'demo_token';
    refresh_token = 'demo_refresh_token';
    expires_in = 3600;
    userProfile = {
      id: 'demo_user',
      display_name: 'Demo User',
      email: 'demo@spotifywrapped.app',
      country: 'US',
      images: [],
    };
  } else {
    // Exchange authorization code for tokens
    const tokenParams = new URLSearchParams({
      grant_type: 'authorization_code',
      code,
      redirect_uri: getRedirectUri(),
    });

    const authHeader = Buffer.from(
      `${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`
    ).toString('base64');

    const tokenResponse = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Authorization: `Basic ${authHeader}`,
      },
      body: tokenParams.toString(),
    });

    if (!tokenResponse.ok) {
      const errBody = await tokenResponse.text();
      console.error('Token exchange failed:', errBody);
      return NextResponse.redirect(new URL('/login?error=token_exchange_failed', req.url));
    }

    const tokenData = await tokenResponse.json();
    console.log('Token exchange result: Success', { 
      hasAccessToken: !!tokenData.access_token, 
      hasRefreshToken: !!tokenData.refresh_token, 
      expires_in: tokenData.expires_in 
    });

    access_token = tokenData.access_token;
    refresh_token = tokenData.refresh_token;
    expires_in = tokenData.expires_in;

    const spotify = new SpotifyService(access_token);
    userProfile = await spotify.getMe();
  }

  // Extract avatar URL from Spotify profile
  const avatarUrl = userProfile.images?.[0]?.url || null;

  // Persist user in database
  const user = await prisma.user.upsert({
    where: { spotifyId: userProfile.id },
    update: {
      displayName: userProfile.display_name,
      email: userProfile.email || null,
      country: userProfile.country || null,
      avatarUrl,
      refreshToken: isDemoFlow ? null : refresh_token,
      lastSyncAt: new Date(),
    },
    create: {
      spotifyId: userProfile.id,
      displayName: userProfile.display_name,
      email: userProfile.email || null,
      country: userProfile.country || null,
      avatarUrl,
      refreshToken: isDemoFlow ? null : refresh_token,
      lastSyncAt: new Date(),
    },
  });

  // Create encrypted session via cookies() API (NOT req/res pattern)
  const cookieStore = await cookies();
  const session = await getIronSession<SessionData>(cookieStore, sessionOptions);

  session.userId = user.id;
  session.spotifyId = userProfile.id;
  session.displayName = userProfile.display_name;
  session.avatarUrl = avatarUrl || undefined;
  session.accessToken = access_token;
  session.refreshToken = refresh_token;
  session.expiresAt = Date.now() + expires_in * 1000;
  session.isLoggedIn = true;
  session.isDemo = isDemoFlow;

  await session.save();

  // Clean up CSRF state cookie
  cookieStore.delete('spotify_auth_state');

  const redirectDest = new URL('/dashboard', req.url).toString();
  console.log('Session saved successfully. Redirecting to:', redirectDest);

  return NextResponse.redirect(redirectDest);
}
