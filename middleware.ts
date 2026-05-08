import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getIronSession } from 'iron-session';
import { SessionData, sessionOptions } from '@/lib/session';

const PROTECTED_PATHS = ['/dashboard', '/story', '/compare'];
const AUTH_PATHS = ['/login'];

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  // Middleware runs in Edge — must use req/res pattern (cookies() not available here)
  const session = await getIronSession<SessionData>(req as any, res as any, sessionOptions);

  const { pathname } = req.nextUrl;

  // Protect private routes
  const isProtected = PROTECTED_PATHS.some(p => pathname.startsWith(p));
  if (isProtected && !session.isLoggedIn) {
    return NextResponse.redirect(new URL('/login', req.url));
  }

  // Redirect logged-in users away from auth pages
  const isAuthPage = AUTH_PATHS.some(p => pathname === p) || pathname === '/';
  if (isAuthPage && session.isLoggedIn) {
    return NextResponse.redirect(new URL('/dashboard', req.url));
  }

  return res;
}

export const config = {
  matcher: ['/', '/login', '/dashboard/:path*', '/story/:path*', '/compare/:path*'],
};
