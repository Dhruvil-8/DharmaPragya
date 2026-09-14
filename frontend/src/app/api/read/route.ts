import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const DEFAULT_BACKEND_URL = 'https://dhruvil8-dharmapragya.hf.space';

export async function GET(req: Request) {
  const backendUrl = process.env.BACKEND_URL || DEFAULT_BACKEND_URL;
  const secret = process.env.FRONTEND_SECRET || '';

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
    headers.set('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=86400');

    return NextResponse.json(data, { headers });
  } catch (error) {
    console.error("API route fetch error:", error);
    return NextResponse.json({ error: 'Failed to fetch from backend' }, { status: 500 });
  }
}
