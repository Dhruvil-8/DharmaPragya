import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const DEFAULT_BACKEND_URL = 'https://dhruvil8-dharmapragya.hf.space';
const DEFAULT_SECRET = '5b8d2a4c7e91f34a8f2d6b7c1e9a4d3f6c8b1a2e7f9d4c5b3a8e6f1d2c7b9a4e';

export async function POST(req: Request) {
  const backendUrl = process.env.BACKEND_URL || DEFAULT_BACKEND_URL;
  const secret = process.env.FRONTEND_SECRET || DEFAULT_SECRET;

  try {
    const body = await req.json();
    const isStreamRequested = body.stream === true || req.headers.get('accept')?.includes('text/event-stream');

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'X-App-Token': secret,
    };

    if (isStreamRequested) {
      headers['Accept'] = 'text/event-stream';
      body.stream = true;
    }

    const res = await fetch(`${backendUrl}/api/ask`, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const errorText = await res.text();
      return new Response(errorText, {
        status: res.status,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    if (isStreamRequested && res.body) {
      return new Response(res.body, {
        status: res.status,
        headers: {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache, no-transform',
          'Connection': 'keep-alive',
          'X-Accel-Buffering': 'no',
        },
      });
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Ask API proxy error:', error);
    return NextResponse.json({ error: 'Failed to fetch from backend' }, { status: 500 });
  }
}

