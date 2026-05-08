import { NextRequest, NextResponse } from 'next/server';
import { isSpotifyConfigured, getRedirectUri } from '@/lib/env';

const SPOTIFY_SCOPES = 'user-top-read user-read-recently-played user-read-private user-read-email';

export async function GET(req: NextRequest) {
  const state = crypto.randomUUID();
  const configured = isSpotifyConfigured();

  if (!configured) {
    // Demo mode — bypass Spotify, go straight to demo callback
    const response = NextResponse.redirect(
      new URL('/api/auth/callback?code=demo_code&state=' + state, req.url)
    );
    response.cookies.set('spotify_auth_state', state, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 10,
    });
    return response;
  }

  const params = new URLSearchParams({
    client_id: process.env.SPOTIFY_CLIENT_ID!,
    response_type: 'code',
    redirect_uri: getRedirectUri(),
    scope: SPOTIFY_SCOPES,
    state,
    show_dialog: 'false',
  });

  const response = NextResponse.redirect(
    `https://accounts.spotify.com/authorize?${params.toString()}`
  );

  response.cookies.set('spotify_auth_state', state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 10,
  });

  return response;
}
