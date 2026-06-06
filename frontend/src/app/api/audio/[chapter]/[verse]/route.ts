import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(req: Request, { params }: { params: Promise<{ chapter: string, verse: string }> }) {
  const backendUrl = process.env.BACKEND_URL || 'http://127.0.0.1:8080';
  const secret = process.env.FRONTEND_SECRET || 'dev-secret';
  const { chapter, verse } = await params;

  try {
    const res = await fetch(`${backendUrl}/api/audio/${chapter}/${verse}.mp3`, {
      headers: {
        'X-App-Token': secret
      }
    });

    if (!res.ok) {
      return new NextResponse('Audio not found', { status: 404 });
    }
    
    // Return the audio stream
    return new NextResponse(res.body, {
      headers: {
        'Content-Type': 'audio/mpeg'
      }
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch audio' }, { status: 500 });
  }
}
