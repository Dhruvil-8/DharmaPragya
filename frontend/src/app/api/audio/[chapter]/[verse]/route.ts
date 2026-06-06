import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(req: Request, { params }: { params: Promise<{ chapter: string, verse: string }> }) {
  const backendUrl = process.env.BACKEND_URL || 'http://127.0.0.1:8080';
  const secret = process.env.FRONTEND_SECRET || 'dev-secret';
  const { chapter, verse } = await params;

  // Clean the verse to remove any trailing .mp3 to avoid duplicate extensions
  const cleanVerse = verse.endsWith('.mp3') ? verse.slice(0, -4) : verse;

  // Forward the Range header from the client to the backend to support HTML5 audio streaming
  const rangeHeader = req.headers.get('range');
  const headers: HeadersInit = {
    'X-App-Token': secret,
  };
  if (rangeHeader) {
    headers['Range'] = rangeHeader;
  }

  try {
    const res = await fetch(`${backendUrl}/api/audio/${chapter}/${cleanVerse}.mp3`, {
      headers,
      cache: 'no-store'
    });

    if (!res.ok && res.status !== 206) {
      return new NextResponse('Audio not found', { status: res.status });
    }

    // Forward backend headers relevant to partial content / streaming
    const responseHeaders = new Headers();
    responseHeaders.set('Content-Type', 'audio/mpeg');
    
    const contentRange = res.headers.get('content-range');
    if (contentRange) {
      responseHeaders.set('Content-Range', contentRange);
    }
    
    const acceptRanges = res.headers.get('accept-ranges');
    if (acceptRanges) {
      responseHeaders.set('Accept-Ranges', acceptRanges);
    }

    const contentLength = res.headers.get('content-length');
    if (contentLength) {
      responseHeaders.set('Content-Length', contentLength);
    }

    return new NextResponse(res.body, {
      status: res.status,
      headers: responseHeaders
    });
  } catch (error) {
    console.error('Failed to proxy audio:', error);
    return NextResponse.json({ error: 'Failed to fetch audio' }, { status: 500 });
  }
}

