import { NextResponse } from 'next/server';
import { createHash, timingSafeEqual } from 'crypto';
import { createSessionToken, sessionCookieOptions, SESSION_COOKIE } from '@/lib/adminSession';
import { loginAllowed, recordLoginAttempt, getIpHash, LOGIN_LOCK_HINT } from '@/lib/loginGuard';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

function safeEqual(a, b) {
  const ha = createHash('sha256').update(String(a)).digest();
  const hb = createHash('sha256').update(String(b)).digest();
  return timingSafeEqual(ha, hb);
}

const NO_STORE = { 'Cache-Control': 'no-store, max-age=0' };

export async function POST(req) {
  const body = await req.json().catch(() => ({}));
  const { password } = body;
  const ipHash = getIpHash(req);

  const expectedId = process.env.AQUAFINS_ADMIN_ID;
  const expectedPassword = process.env.AQUAFINS_ADMIN_PASSWORD;
  const expectedPassword2 = process.env.AQUAFINS_ADMIN_PASSWORD_2;

  if (!expectedId || !expectedPassword) {
    return NextResponse.json(
      { error: 'Admin credentials are not configured in .env.local' },
      { status: 503, headers: NO_STORE }
    );
  }

  // Durable lockout (survives serverless cold starts, unlike the middleware limiter)
  if (!(await loginAllowed(ipHash))) {
    return NextResponse.json({ error: LOGIN_LOCK_HINT }, { status: 429, headers: NO_STORE });
  }

  const passwordMatches =
    safeEqual(password, expectedPassword) ||
    (expectedPassword2 && safeEqual(password, expectedPassword2));

  if (!passwordMatches) {
    await recordLoginAttempt(ipHash, 'failed');
    return NextResponse.json(
      { error: 'Invalid credentials' },
      { status: 401, headers: NO_STORE }
    );
  }

  // Mint a revocable session: the JWT carries a jti recorded in admin_sessions.
  const sessionToken = createSessionToken();
  const jti = sessionToken.split('#')[1];
  const expiresAt = new Date(Date.now() + 8 * 60 * 60 * 1000).toISOString();

  try {
    if (supabaseAdmin && jti) {
      await supabaseAdmin
        .from('admin_sessions')
        .insert([{ jti, expires_at: expiresAt }]);
    }
  } catch {
    // Session row is best-effort; without it revocation is skipped (fail open)
  }

  await recordLoginAttempt(ipHash, 'success');

  const res = NextResponse.json({ ok: true }, { headers: NO_STORE });
  res.cookies.set(SESSION_COOKIE, sessionToken, sessionCookieOptions());
  return res;
}
