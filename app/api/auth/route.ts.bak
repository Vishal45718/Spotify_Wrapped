import { NextRequest, NextResponse } from 'next/server';

// Legacy route — redirect to new auth/login endpoint
export async function GET(req: NextRequest) {
  return NextResponse.redirect(new URL('/api/auth/login', req.url));
}
