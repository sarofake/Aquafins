'use client';

import { getClientCachedItem, setClientCachedItem } from '@/lib/clientCache';

/**
 * Fetch JSON through the client cache so repeated page loads don't hit the DB.
 *
 * @param {string} url      Request URL
 * @param {string} key      Logical cache key (e.g. "admin_products")
 * @param {number} ttlMs    How long the cached value stays valid
 * @param {object} options  { force } - bypass and refresh the cache entry
 * @returns {Promise<any>}  Parsed JSON body
 */
export async function fetchWithCache(url, key, ttlMs = 5 * 60 * 1000, options = {}) {
  const { force = false } = options;

  if (!force) {
    const cached = getClientCachedItem(key, ttlMs);
    if (cached !== null && cached !== undefined) {
      return cached;
    }
  }

  const res = await fetch(url, { cache: force ? 'no-store' : 'default' });
  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    const err = new Error(data?.error || `Request failed: ${res.status}`);
    err.status = res.status;
    throw err;
  }

  setClientCachedItem(key, data);
  return data;
}
