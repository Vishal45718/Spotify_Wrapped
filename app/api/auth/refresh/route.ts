import { NextResponse } from 'next/server';
import { getIronSession } from 'iron-session';
import { cookies } from 'next/headers';
import { SessionData, sessionOptions } from '@/lib/session';
import { prisma } from '@/lib/prisma';

export async function POST() {
  const cookieStore = await cookies();
  const session = await getIronSession<SessionData>(cookieStore, sessionOptions);

  if (!session.isLoggedIn || !session.refreshToken || session.isDemo) {
    return NextResponse.json({ error: 'Cannot refresh' }, { status: 401 });
  }

  const tokenParams = new URLSearchParams({
    grant_type: 'refresh_token',
    refresh_token: session.refreshToken,
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
    // Refresh token revoked or expired — force re-login
    session.destroy();
    return NextResponse.json({ error: 'Refresh failed, please re-login' }, { status: 401 });
  }

  const tokenData = await tokenResponse.json();

  session.accessToken = tokenData.access_token;
  session.expiresAt = Date.now() + tokenData.expires_in * 1000;

  // Spotify may rotate refresh tokens
  if (tokenData.refresh_token) {
    session.refreshToken = tokenData.refresh_token;
    // Also update in database
    if (session.userId) {
      await prisma.user.update({
        where: { id: session.userId },
        data: { refreshToken: tokenData.refresh_token },
      });
    }
  }

  await session.save();

  return NextResponse.json({
    success: true,
    expiresAt: session.expiresAt,
  });
}
