import { NextRequest, NextResponse } from 'next/server';
import { getIronSession } from 'iron-session';
import { SessionData, sessionOptions } from '@/lib/session';

export async function GET(req: NextRequest) {
  const res = NextResponse.json({ success: true });
  const session = await getIronSession<SessionData>(req as any, res as any, sessionOptions);

  if (!session.isLoggedIn || !session.refreshToken) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const tokenParams = new URLSearchParams({
    grant_type: 'refresh_token',
    refresh_token: session.refreshToken,
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
    // If refresh fails, log out
    session.destroy();
    return NextResponse.json({ error: 'Refresh failed' }, { status: 401 });
  }

  const tokenData = await tokenResponse.json();
  
  session.accessToken = tokenData.access_token;
  if (tokenData.refresh_token) {
    session.refreshToken = tokenData.refresh_token;
  }
  session.expiresAt = Date.now() + tokenData.expires_in * 1000;
  
  await session.save();

  return res;
}
