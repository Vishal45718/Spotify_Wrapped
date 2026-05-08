import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const state = crypto.randomUUID();
  
  const clientId = process.env.SPOTIFY_CLIENT_ID || '';

  if (clientId === 'your_client_id_here') {
    const response = NextResponse.redirect(new URL('/api/callback?code=mock_code&state=' + state, req.url));
    response.cookies.set('spotify_auth_state', state, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 10,
    });
    return response;
  }

  const params = new URLSearchParams({
    client_id: clientId,
    response_type: 'code',
    redirect_uri: process.env.SPOTIFY_REDIRECT_URI || 'http://localhost:3000/api/callback',
    scope: 'user-top-read user-read-recently-played user-read-private user-read-email',
    state,
  });

  const response = NextResponse.redirect(`https://accounts.spotify.com/authorize?${params.toString()}`);
  
  // Store state in cookie for CSRF check
  response.cookies.set('spotify_auth_state', state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 10, // 10 minutes
  });

  return response;
}
