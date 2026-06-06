import { NextResponse } from 'next/server';

export async function GET(req: Request) {
  const backendUrl = process.env.BACKEND_URL || 'http://127.0.0.1:8080';
  const secret = process.env.FRONTEND_SECRET || '';

  const { searchParams } = new URL(req.url);
  const queryString = searchParams.toString();
  const url = queryString ? `${backendUrl}/api/read?${queryString}` : `${backendUrl}/api/read`;

  try {
    const res = await fetch(url, {
      headers: {
        'X-App-Token': secret
      },
      next: { revalidate: 3600 } // Cache the backend response for 1 hour
    });
    const data = await res.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("API route fetch error:", error);
    return NextResponse.json({ error: 'Failed to fetch from backend' }, { status: 500 });
  }
}
