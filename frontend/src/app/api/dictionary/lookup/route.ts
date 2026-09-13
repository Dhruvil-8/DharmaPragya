import { NextResponse } from 'next/server';

export const revalidate = 86400;

const DEFAULT_BACKEND_URL = 'https://dhruvil8-dharmapragya.hf.space';

export async function GET(req: Request) {
  const backendUrl = process.env.BACKEND_URL || DEFAULT_BACKEND_URL;
  const secret = process.env.FRONTEND_SECRET || '';

  const { searchParams } = new URL(req.url);
  const queryString = searchParams.toString();
  const url = queryString ? `${backendUrl}/api/dictionary/lookup?${queryString}` : `${backendUrl}/api/dictionary/lookup`;

  try {
    const res = await fetch(url, {
      headers: {
        'X-App-Token': secret
      },
      next: { revalidate: 86400 }
    });
    
    const data = await res.json();
    
    const headers = new Headers();
    const cacheControl = res.headers.get('cache-control');
    if (cacheControl) {
      headers.set('Cache-Control', cacheControl);
    } else {
      headers.set('Cache-Control', 'public, s-maxage=86400, stale-while-revalidate=604800');
    }
    
    return NextResponse.json(data, { headers });
  } catch (error) {
    console.error("Dictionary API route fetch error:", error);
    return NextResponse.json({ error: 'Failed to fetch from backend' }, { status: 500 });
  }
}
