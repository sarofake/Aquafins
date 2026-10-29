import { NextResponse } from 'next/server';
import { authed } from '@/lib/adminHelpers';

export async function GET(req) {
  const ok = await authed(req);
  return NextResponse.json(
    { ok },
    { headers: { 'Cache-Control': 'no-store, max-age=0' } }
  );
}
