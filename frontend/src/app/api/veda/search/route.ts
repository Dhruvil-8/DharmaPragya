import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.BACKEND_URL || 'https://dhruvil8-dharmapragya.hf.space';
const FRONTEND_SECRET = process.env.FRONTEND_SECRET || '5b8d2a4c7e91f34a8f2d6b7c1e9a4d3f6c8b1a2e7f9d4c5b3a8e6f1d2c7b9a4e';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const queryString = searchParams.toString();
    const url = `${BACKEND_URL}/api/veda/search${queryString ? `?${queryString}` : ''}`;

    const res = await fetch(url, {
      headers: {
        'X-App-Token': FRONTEND_SECRET,
      },
    });

    if (!res.ok) {
      return NextResponse.json({ error: `Backend returned ${res.status}` }, { status: res.status });
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal Server Error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
