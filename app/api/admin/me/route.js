import { NextResponse } from 'next/server';
import { SESSION_COOKIE, verifySessionToken } from '@/lib/adminSession';

export async function GET(req) {
  const token = req.cookies?.get(SESSION_COOKIE)?.value;
  return NextResponse.json({ ok: verifySessionToken(token) });
}