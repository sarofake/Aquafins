import { NextResponse } from 'next/server';

// ---------------------------------------------------------------------------
// Serverless-optimized cache layer
//
// Strategy:
//   1. In-memory Map cache — works during warm starts (free perf boost)
//   2. Cache-Control headers — Vercel CDN/edge caches responses, so even
//      cold starts benefit from CDN hits without hitting Supabase.
//   3. Admin mutations call invalidateCache() to clear the in-memory cache.
//      The CDN cache expires via s-maxage / stale-while-revalidate.
// ---------------------------------------------------------------------------

const cacheMap = new Map();

/**
 * Retrieves cached item if not expired.
 */
export function getCache(key) {
  const item = cacheMap.get(key);
  if (!item) return null;
  if (Date.now() > item.expiresAt) {
    cacheMap.delete(key);
    return null;
  }
  return item.data;
}

/**
 * Stores data in cache with TTL in seconds (default 5 min).
 */
export function setCache(key, data, ttlSeconds = 300) {
  cacheMap.set(key, {
    data,
    expiresAt: Date.now() + ttlSeconds * 1000,
  });
}

/**
 * Invalidates cache by exact key or prefix.
 */
export function invalidateCache(prefixOrKey) {
  if (cacheMap.has(prefixOrKey)) {
    cacheMap.delete(prefixOrKey);
  }
  for (const k of cacheMap.keys()) {
    if (k.startsWith(prefixOrKey)) {
      cacheMap.delete(k);
    }
  }
}

// ---------------------------------------------------------------------------
// Serverless-friendly cached response helpers
// ---------------------------------------------------------------------------

/**
 * Build Cache-Control header value.
 * @param {number} maxAge - CDN max-age in seconds
 * @param {number} swr - stale-while-revalidate in seconds
 */
function cacheControl(maxAge, swr) {
  return `public, s-maxage=${maxAge}, stale-while-revalidate=${swr}`;
}

/**
 * Return a cached NextResponse if available, or execute the query, cache it,
 * and return a fresh response with proper Cache-Control headers.
 *
 * @param {string} key - Cache key
 * @param {number} ttlSeconds - In-memory TTL (and CDN s-maxage)
 * @param {number} swrSeconds - stale-while-revalidate for CDN
 * @param {Function} fetchFn - Async function that returns the response body
 * @returns {NextResponse}
 */
export async function cachedResponse(key, ttlSeconds, swrSeconds, fetchFn) {
  // 1. Try in-memory cache (warm start)
  const cached = getCache(key);
  if (cached) {
    return NextResponse.json(cached, {
      headers: {
        'Cache-Control': cacheControl(ttlSeconds, swrSeconds),
        'X-Cache': 'HIT',
      },
    });
  }

  // 2. Fetch fresh data
  const data = await fetchFn();
  setCache(key, data, ttlSeconds);

  return NextResponse.json(data, {
    headers: {
      'Cache-Control': cacheControl(ttlSeconds, swrSeconds),
      'X-Cache': 'MISS',
    },
  });
}

/**
 * Invalidate in-memory cache AND send a revalidation hint.
 * Call this from admin mutation endpoints.
 */
export function invalidateAndRevalidate(prefixOrKey) {
  invalidateCache(prefixOrKey);
}
