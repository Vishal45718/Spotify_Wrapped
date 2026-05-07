import { NextRequest, NextResponse } from 'next/server';
import { getIronSession } from 'iron-session';
import { SessionData, sessionOptions } from '@/lib/session';
import { prisma } from '@/lib/prisma';
import { SpotifyService } from '@/services/spotify';

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const code = url.searchParams.get('code');
  const state = url.searchParams.get('state');
  
  const storedState = req.cookies.get('spotify_auth_state')?.value;

  if (!code || !state || state !== storedState) {
    return NextResponse.redirect(new URL('/?error=invalid_state', req.url));
  }

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
  const { access_token, refresh_token, expires_in } = tokenData;

  // Get user profile to store in DB
  const spotify = new SpotifyService(access_token);
  const userProfile = await spotify.getMe();

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

  // Create session
  const res = NextResponse.redirect(new URL('/dashboard', req.url));
  const session = await getIronSession<SessionData>(req as any, res as any, sessionOptions);
  
  session.userId = user.id;
  session.spotifyId = userProfile.id;
  session.accessToken = access_token;
  session.refreshToken = refresh_token;
  session.expiresAt = Date.now() + expires_in * 1000;
  session.isLoggedIn = true;
  
  await session.save();

  // Clear state cookie
  res.cookies.delete('spotify_auth_state');

  return res;
}
