// In-memory rate limiter using sliding window algorithm
const rateLimitMap = new Map();

const CLEANUP_INTERVAL_MS = 5 * 60 * 1000;
let lastCleanup = Date.now();

function cleanupExpired(windowMs) {
  const now = Date.now();
  if (now - lastCleanup < CLEANUP_INTERVAL_MS) return;
  lastCleanup = now;

  for (const [key, records] of rateLimitMap.entries()) {
    const validRecords = records.filter((timestamp) => now - timestamp < windowMs);
    if (validRecords.length === 0) {
      rateLimitMap.delete(key);
    } else {
      rateLimitMap.set(key, validRecords);
    }
  }
}

/**
 * Checks rate limit for an incoming request.
 * @param {Request} req - Incoming request object
 * @param {Object} options - Config options { limit: number, windowMs: number, keyPrefix: string }
 * @returns {{ success: boolean, limit: number, remaining: number, resetMs: number }}
 */
export function checkRateLimit(req, options = {}) {
  const {
    limit = 60,               // Default: 60 requests
    windowMs = 60 * 1000,      // Default: 1 minute (60000ms)
    keyPrefix = 'global',
  } = options;

  cleanupExpired(windowMs);

  const forwardedFor = req.headers.get('x-forwarded-for');
  const realIp = req.headers.get('x-real-ip');
  const ip = (forwardedFor ? forwardedFor.split(',')[0].trim() : realIp) || '127.0.0.1';

  const key = `${keyPrefix}:${ip}`;
  const now = Date.now();

  const timestamps = rateLimitMap.get(key) || [];
  const windowStart = now - windowMs;
  const recentTimestamps = timestamps.filter((t) => t > windowStart);

  if (recentTimestamps.length >= limit) {
    const oldestTimestamp = recentTimestamps[0];
    const resetMs = oldestTimestamp + windowMs - now;
    return {
      success: false,
      limit,
      remaining: 0,
      resetMs: Math.max(resetMs, 0),
    };
  }

  recentTimestamps.push(now);
  rateLimitMap.set(key, recentTimestamps);

  return {
    success: true,
    limit,
    remaining: limit - recentTimestamps.length,
    resetMs: windowMs,
  };
}

/**
 * Helper to generate 429 Too Many Requests response
 */
export function rateLimitResponse(rateLimitResult) {
  const retryAfterSeconds = Math.ceil((rateLimitResult.resetMs || 1000) / 1000);
  return new Response(
    JSON.stringify({
      error: 'Too many requests. Please slow down and try again later.',
      retryAfterSeconds,
    }),
    {
      status: 429,
      headers: {
        'Content-Type': 'application/json',
        'Retry-After': String(retryAfterSeconds),
        'X-RateLimit-Limit': String(rateLimitResult.limit),
        'X-RateLimit-Remaining': String(rateLimitResult.remaining),
      },
    }
  );
}
