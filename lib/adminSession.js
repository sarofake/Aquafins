import { createHmac, timingSafeEqual, randomUUID } from 'crypto';

export const SESSION_COOKIE = 'aquafins_admin_session';
const MAX_AGE_SECONDS = 8 * 60 * 60; // 8 hours

function getSecret() {
  const secret = process.env.AQUAFINS_SESSION_SECRET;
  if (!secret) {
    throw new Error(
      'AQUAFINS_SESSION_SECRET is not set. Add it to .env.local for production.'
    );
  }
  return secret;
}

function getSubject() {
  return process.env.AQUAFINS_ADMIN_ID || 'admin';
}

function b64url(value) {
  return Buffer.from(typeof value === 'string' ? value : JSON.stringify(value)).toString('base64url');
}

function sign(tokenContent) {
  return createHmac('sha256', getSecret()).update(tokenContent).digest('base64url');
}

/**
 * Creates a standard 3-part HMAC SHA-256 JWT token.
 * `jti` (embedded and returned) is stored in public.admin_sessions, so
 * logout / credential rotation can revoke the session server-side.
 */
export function createSessionToken() {
  const jti = randomUUID();
  const header = b64url({ alg: 'HS256', typ: 'JWT' });
  const now = Math.floor(Date.now() / 1000);
  const payload = b64url({
    sub: getSubject(),
    role: 'admin',
    jti,
    iat: now,
    exp: now + MAX_AGE_SECONDS,
  });
  const unsignedToken = `${header}.${payload}`;
  const signature = sign(unsignedToken);
  return `${unsignedToken}.${signature}#${jti}`;
}

/**
 * Extracts the jti from a token produced above (after the `#` marker).
 */
export function getSessionJti(token) {
  if (!token || typeof token !== 'string') return null;
  const [jwt, jti] = token.split('#');
  if (!jti || typeof jti !== 'string' || jti.length > 64) return null;
  return jti;
}

/**
 * Verifies a 3-part JWT token or legacy 2-part token
 */
export function verifySessionToken(token) {
  if (!token || typeof token !== 'string') return false;

  // Strip the jti marker when something appended it (`...#jti`)
  const jwt = token.split('#')[0];
  token = jwt;

  const parts = token.split('.');
  if (parts.length === 3) {
    // Standard 3-part JWT
    const [headerB64, payloadB64, signature] = parts;
    const unsignedToken = `${headerB64}.${payloadB64}`;

    let validSignature = false;
    try {
      validSignature = timingSafeEqual(
        Buffer.from(signature),
        Buffer.from(sign(unsignedToken))
      );
    } catch {
      return false;
    }

    if (!validSignature) return false;

    try {
      const payload = JSON.parse(Buffer.from(payloadB64, 'base64url').toString('utf8'));
      if (payload.sub !== getSubject()) return false;
      const nowSec = Math.floor(Date.now() / 1000);
      if (typeof payload.exp !== 'number' || nowSec > payload.exp) return false;
      return true;
    } catch {
      return false;
    }
  } else if (parts.length === 2) {
    // Backward-compatible 2-part token
    const [payloadB64, signature] = parts;
    let valid = false;
    try {
      valid = timingSafeEqual(Buffer.from(signature), Buffer.from(sign(payloadB64)));
    } catch {
      return false;
    }
    if (!valid) return false;

    try {
      const data = JSON.parse(Buffer.from(payloadB64, 'base64url').toString('utf8'));
      if (data.sub !== getSubject()) return false;
      const exp = data.exp > 10000000000 ? Math.floor(data.exp / 1000) : data.exp;
      if (typeof exp !== 'number' || Math.floor(Date.now() / 1000) > exp) return false;
      return true;
    } catch {
      return false;
    }
  }

  return false;
}

/**
 * Standard secure HttpOnly cookie options for session management
 */
export function sessionCookieOptions() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: MAX_AGE_SECONDS,
  };
}