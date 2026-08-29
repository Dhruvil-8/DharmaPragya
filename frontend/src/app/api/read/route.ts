import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const DEFAULT_BACKEND_URL = 'https://dhruvil8-dharmapragya.hf.space';
const DEFAULT_SECRET = '5b8d2a4c7e91f34a8f2d6b7c1e9a4d3f6c8b1a2e7f9d4c5b3a8e6f1d2c7b9a4e';

export async function GET(req: Request) {
  const backendUrl = process.env.BACKEND_URL || DEFAULT_BACKEND_URL;
  const secret = process.env.FRONTEND_SECRET || DEFAULT_SECRET;

  const { searchParams } = new URL(req.url);
  const queryString = searchParams.toString();
  const url = queryString ? `${backendUrl}/api/read?${queryString}` : `${backendUrl}/api/read`;

  try {
    const res = await fetch(url, {
      headers: {
        'X-App-Token': secret
      },
      cache: 'no-store'
    });
    
    const data = await res.json();
    
    const headers = new Headers();
    const cacheControl = res.headers.get('cache-control');
    if (cacheControl) {
      headers.set('Cache-Control', cacheControl);
    }
    
    return NextResponse.json(data, { headers });
  } catch (error) {
    console.error("API route fetch error:", error);
    return NextResponse.json({ error: 'Failed to fetch from backend' }, { status: 500 });
  }
}
