import { createHash } from 'crypto';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

/**
 * Durable brute-force protection for /api/admin/login.
 *
 * The middleware rate limiter (`lib/rateLimit.js`) is in-memory, so on
 * serverless hosts (Vercel) every cold-started instance starts with a clean
 * slate. This guard backs the same protection with Supabase so it survives
 * restarts, scale-out and redeployments.
 *
 * Client IPs are never stored in plaintext — only as an HMAC keyed with the
 * session secret, so the rows are useless if the database leaks.
 */

const MAX_FAILED_ATTEMPTS = 20;
const WINDOW_MINUTES = 15;
const RETENTION_HOURS = 24;

function hashIp(ip) {
  const secret = process.env.AQUAFINS_SESSION_SECRET || 'aquafins';
  return createHash('sha256').update(`${secret}:${ip}`).digest('hex');
}

export function getIpHash(req) {
  const forwardedFor = req.headers.get('x-forwarded-for');
  const realIp = req.headers.get('x-real-ip');
  const ip = (forwardedFor ? forwardedFor.split(',')[0].trim() : realIp) || 'unknown';
  return hashIp(ip);
}

/**
 * Returns true when the caller is allowed to attempt a login.
 * Best-effort: if the database is unavailable, fail open and let the
 * in-memory middleware limiter handle it rather than locking admins out.
 */
export async function loginAllowed(ipHash) {
  try {
    const sb = supabaseAdmin;
    if (!sb) return true;

    const since = new Date(Date.now() - WINDOW_MINUTES * 60 * 1000).toISOString();
    const { count, error } = await sb
      .from('admin_login_attempts')
      .select('*', { count: 'exact', head: true })
      .eq('ip_hash', ipHash)
      .eq('outcome', 'failed')
      .gte('attempted_at', since);

    if (error) return true; // fail open
    return (count || 0) < MAX_FAILED_ATTEMPTS;
  } catch {
    return true; // fail open
  }
}

/**
 * Records an attempt. Prunes old rows occasionally so the table stays small.
 */
export async function recordLoginAttempt(ipHash, outcome) {
  try {
    if (!supabaseAdmin) return;
    await supabaseAdmin.from('admin_login_attempts').insert([
      { ip_hash: ipHash, outcome },
    ]);

    // Cheap probabilistic pruning (~5% of writes).
    if (Math.random() < 0.05) {
      const cutoff = new Date(Date.now() - RETENTION_HOURS * 60 * 60 * 1000).toISOString();
      await supabaseAdmin
        .from('admin_login_attempts')
        .delete()
        .lt('attempted_at', cutoff);
    }
  } catch {
    // Never let bookkeeping break the login flow.
  }
}

export const LOGIN_LOCK_HINT = `Too many failed login attempts. Try again in ${WINDOW_MINUTES} minutes.`;
