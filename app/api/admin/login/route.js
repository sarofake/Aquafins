import { NextResponse } from 'next/server';
import { createHash, timingSafeEqual } from 'crypto';
import { createSessionToken, sessionCookieOptions, SESSION_COOKIE } from '@/lib/adminSession';

function safeEqual(a, b) {
  const ha = createHash('sha256').update(String(a)).digest();
  const hb = createHash('sha256').update(String(b)).digest();
  return timingSafeEqual(ha, hb);
}

export async function POST(req) {
  const body = await req.json().catch(() => ({}));
  const { password } = body;

  const expectedId = process.env.AQUAFINS_ADMIN_ID;
  const expectedPassword = process.env.AQUAFINS_ADMIN_PASSWORD;
  const expectedPassword2 = process.env.AQUAFINS_ADMIN_PASSWORD_2;

  if (!expectedId || !expectedPassword) {
    return NextResponse.json(
      { error: 'Admin credentials are not configured in .env.local' },
      { status: 503 }
    );
  }

  const passwordMatches =
    safeEqual(password, expectedPassword) ||
    (expectedPassword2 && safeEqual(password, expectedPassword2));

  if (!passwordMatches) {
    return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
  }

  const res = NextResponse.json({ ok: true });
  res.cookies.set(SESSION_COOKIE, createSessionToken(), sessionCookieOptions());
  return res;
}