import { NextRequest, NextResponse } from 'next/server';
import { getIronSession } from 'iron-session';
import { SessionData, sessionOptions } from '@/lib/session';
import { prisma } from '@/lib/prisma';
import { kv } from '@/lib/kv';
import { TimeRange } from '@/types/spotify';

export async function POST(req: NextRequest) {
  const res = NextResponse.json({});
  const session = await getIronSession<SessionData>(req as any, res as any, sessionOptions);

  if (!session.isLoggedIn || !session.userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await req.json();
  const timeRange: TimeRange = body.timeRange || 'long_term';
  const insightsData = body.insights;

  if (!insightsData) {
    return NextResponse.json({ error: 'Missing insights data' }, { status: 400 });
  }

  try {
    const shareCard = await prisma.shareCard.create({
      data: {
        userId: session.userId,
        timeRange,
        insightsData,
      },
    });

    // Optionally cache it to KV for faster public read
    const cacheKey = `share:${shareCard.id}`;
    await kv.set(cacheKey, { ...insightsData, shareId: shareCard.id }, { ex: 604800 }); // 7 days

    return NextResponse.json({ id: shareCard.id });
  } catch (error) {
    console.error('Share route error:', error);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const id = url.searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'Missing ID' }, { status: 400 });

  const cacheKey = `share:${id}`;
  const cached = await kv.get(cacheKey);
  if (cached) return NextResponse.json(cached);

  const shareCard = await prisma.shareCard.findUnique({
    where: { id },
  });

  if (!shareCard) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  await kv.set(cacheKey, { ...(shareCard.insightsData as object), shareId: id }, { ex: 604800 });
  
  return NextResponse.json({ ...(shareCard.insightsData as object), shareId: id });
}
