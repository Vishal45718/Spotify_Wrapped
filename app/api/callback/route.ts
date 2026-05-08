import { NextRequest, NextResponse } from 'next/server';
import { getIronSession } from 'iron-session';
import { cookies } from 'next/headers';
import { SessionData, sessionOptions } from '@/lib/session';
import { prisma } from '@/lib/prisma';
import { SpotifyService } from '@/services/spotify';

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const code = url.searchParams.get('code');
  const state = url.searchParams.get('state');
  
  const storedState = req.cookies.get('spotify_auth_state')?.value;
  const isMockFlow = code === 'mock_code';

  // Skip CSRF state check for mock flow — the cookie set on the 307 redirect
  // from /api/auth doesn't survive the immediate redirect chain to /api/callback
  if (!code || !state || (!isMockFlow && state !== storedState)) {
    return NextResponse.redirect(new URL('/?error=invalid_state', req.url));
  }

  let userProfile;
  let access_token: string;
  let refresh_token: string;
  let expires_in: number;

  if (isMockFlow) {
    access_token = 'mock_token';
    refresh_token = 'mock_refresh_token';
    expires_in = 3600;
    userProfile = {
      id: 'mock_spotify_user',
      display_name: 'Mock User',
      email: 'mock@example.com',
      country: 'US',
    };
  } else {
    // Exchange code for tokens
    const tokenParams = new URLSearchParams({
      grant_type: 'authorization_code',
      code,
      redirect_uri: process.env.SPOTIFY_REDIRECT_URI || 'http://localhost:3000/api/callback',
    });

    const authHeader = Buffer.from(`${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`).toString('base64');
    
    const tokenResponse = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${authHeader}`
      },
      body: tokenParams.toString(),
    });

    if (!tokenResponse.ok) {
      return NextResponse.redirect(new URL('/?error=token_exchange_failed', req.url));
    }

    const tokenData = await tokenResponse.json();
    access_token = tokenData.access_token;
    refresh_token = tokenData.refresh_token;
    expires_in = tokenData.expires_in;

    // Get user profile to store in DB
    const spotify = new SpotifyService(access_token);
    userProfile = await spotify.getMe();
  }

  // Upsert user in Prisma
  const user = await prisma.user.upsert({
    where: { spotifyId: userProfile.id },
    update: {
      displayName: userProfile.display_name,
      email: userProfile.email,
      country: userProfile.country,
    },
    create: {
      spotifyId: userProfile.id,
      displayName: userProfile.display_name,
      email: userProfile.email,
      country: userProfile.country,
    },
  });

  // Create session using cookies() API — this is the correct way in App Router
  // Using req/res pattern with redirect responses causes Set-Cookie to be lost
  const cookieStore = await cookies();
  const session = await getIronSession<SessionData>(cookieStore, sessionOptions);
  
  session.userId = user.id;
  session.spotifyId = userProfile.id;
  session.accessToken = access_token;
  session.refreshToken = refresh_token;
  session.expiresAt = Date.now() + expires_in * 1000;
  session.isLoggedIn = true;
  
  await session.save();

  // Clear state cookie
  cookieStore.delete('spotify_auth_state');

  // Redirect to dashboard
  return NextResponse.redirect(new URL('/dashboard', req.url));
}
