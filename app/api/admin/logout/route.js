import { NextResponse } from 'next/server';
import { SESSION_COOKIE, getSessionJti } from '@/lib/adminSession';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

const NO_STORE = { 'Cache-Control': 'no-store, max-age=0' };

export async function POST(req) {
  // Actually revoke the session server-side, not just clear the cookie.
  const token = req.cookies?.get(SESSION_COOKIE)?.value;
  const jti = getSessionJti(token);

  try {
    if (supabaseAdmin && jti) {
      await supabaseAdmin
        .from('admin_sessions')
        .update({ revoked: true })
        .eq('jti', jti)
        .eq('revoked', false);
    }
  } catch {
    // Even if revocation fails, clearing the cookie is worth doing.
  }

  const res = NextResponse.json({ ok: true }, { headers: NO_STORE });
  res.cookies.set(SESSION_COOKIE, '', { httpOnly: true, path: '/', maxAge: 0 });
  return res;
}
