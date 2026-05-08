import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getIronSession } from 'iron-session';
import { SessionData, sessionOptions } from '@/lib/session';

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const session = await getIronSession<SessionData>(req as any, res as any, sessionOptions);

  // If going to dashboard or story, ensure auth
  if (req.nextUrl.pathname.startsWith('/dashboard') || req.nextUrl.pathname.startsWith('/story')) {
    if (!session.isLoggedIn) {
      return NextResponse.redirect(new URL('/', req.url));
    }
    // Check if token needs refresh
    if (session.expiresAt && Date.now() > session.expiresAt - 300000) {
      // In middleware, we can't easily perform fetch and modify cookies using iron-session if we await fetch.
      // Alternatively, we redirect to a silent refresh page or let the client/API route handle it.
      // Since iron-session doesn't easily let you fetch + rewrite cookie inside edge middleware
      // We will let the client components trigger `/api/session` or `/api/insights` which handles refresh
      // Oh wait, iron-session v8 works in edge. We could fetch `/api/refresh` here.
      // For simplicity, we just pass through and let client API calls hit 401 and handle it or have a background process.
    }
  }

  // If going to login page while logged in, redirect to dashboard
  if (req.nextUrl.pathname === '/' && session.isLoggedIn) {
    return NextResponse.redirect(new URL('/dashboard', req.url));
  }

  return res;
}

export const config = {
  matcher: ['/dashboard/:path*', '/story/:path*', '/'],
};
