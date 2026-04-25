import { NextResponse } from 'next/server';

export const runtime = 'edge';

export async function GET() {
  try {
    const res = await fetch(
      'https://sandbox.open-metadata.org/api/v1/system/version',
      { signal: AbortSignal.timeout(8000) },
    );
    return NextResponse.json({ status: res.ok ? 'live' : 'offline' });
  } catch {
    return NextResponse.json({ status: 'offline' });
  }
}
