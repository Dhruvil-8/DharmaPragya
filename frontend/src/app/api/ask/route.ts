import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

const DEFAULT_BACKEND_URL = 'https://dhruvil8-dharmapragya.hf.space';

export async function POST(req: Request) {
  const backendUrl = process.env.BACKEND_URL || DEFAULT_BACKEND_URL;
  const secret = process.env.FRONTEND_SECRET || '';

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
      let safeMessage = 'AI assistant service temporarily unavailable';
      try {
        const parsed = JSON.parse(errorText);
        if (parsed.error && typeof parsed.error === 'string') {
          safeMessage = parsed.error;
        }
      } catch {
        if (errorText && errorText.length < 120 && !errorText.includes('key=') && !errorText.includes('AIza')) {
          safeMessage = errorText.trim();
        }
      }
      return NextResponse.json({ error: safeMessage }, { status: res.status });
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
  } catch {
    return NextResponse.json({ error: 'Failed to connect to AI service' }, { status: 500 });
  }
}

