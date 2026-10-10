'use client';

/**
 * Client-side cache that persists API responses so pages don't hit the
 * database on every load.
 *
 * Storage strategy (cookie-first, as requested):
 *   1. In-memory Map            -> instant, same page session
 *   2. Cookie (af_cache_<key>)  -> survives reloads and new tabs/sessions
 *   3. localStorage fallback    -> used only when a payload is too big for a
 *                                  cookie (~4KB limit), e.g. product lists
 *
 * Cookies are readable by client JS (not HttpOnly) so this stays purely
 * client-side with no extra server round-trips.
 */

const memoryCache = new Map();
const COOKIE_PREFIX = 'af_cache_';
const STORAGE_PREFIX = 'af_cache_';

// Keep well under the ~4096 byte per-cookie browser limit.
const MAX_COOKIE_CHARS = 3500;
const COOKIE_MAX_AGE_MS = 24 * 60 * 60 * 1000; // 24h hard cap; logical TTL still applies

function readCookieValue(name) {
  if (typeof document === 'undefined') return null;
  const needle = `${name}=`;
  const parts = document.cookie ? document.cookie.split('; ') : [];
  for (const part of parts) {
    if (part.startsWith(needle)) {
      return decodeURIComponent(part.slice(needle.length));
    }
  }
  return null;
}

function deleteCookieValue(name) {
  if (typeof document === 'undefined') return;
  document.cookie = `${name}=; path=/; max-age=0; SameSite=Lax`;
}

function readLocalValue(name) {
  if (typeof window === 'undefined' || !window.localStorage) return null;
  try {
    return localStorage.getItem(STORAGE_PREFIX + name);
  } catch {
    return null;
  }
}

function writeLocalValue(name, rawValue) {
  if (typeof window === 'undefined' || !window.localStorage) return;
  try {
    localStorage.setItem(STORAGE_PREFIX + name, rawValue);
  } catch {
    // Ignore quota / privacy-mode errors
  }
}

function removeLocalValue(name) {
  if (typeof window === 'undefined' || !window.localStorage) return;
  try {
    localStorage.removeItem(STORAGE_PREFIX + name);
  } catch {
    // Ignore
  }
}

function parseItem(raw, ttlMs) {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed.timestamp === 'number' && Date.now() - parsed.timestamp < ttlMs) {
      return parsed;
    }
  } catch {
    // Ignore malformed entries
  }
  return null;
}

export function getClientCachedItem(key, ttlMs = 5 * 60 * 1000) {
  // 1. In-memory
  const mem = memoryCache.get(key);
  if (mem && Date.now() - mem.timestamp < ttlMs) {
    return mem.data;
  }

  // 2. Cookie
  const fromCookie = parseItem(readCookieValue(COOKIE_PREFIX + key), ttlMs);
  if (fromCookie) {
    memoryCache.set(key, fromCookie);
    return fromCookie.data;
  }

  // 3. localStorage fallback
  const fromLocal = parseItem(readLocalValue(key), ttlMs);
  if (fromLocal) {
    memoryCache.set(key, fromLocal);
    return fromLocal.data;
  }

  return null;
}

export function setClientCachedItem(key, data) {
  const item = { data, timestamp: Date.now() };
  memoryCache.set(key, item);

  const raw = JSON.stringify(item);
  const encodedLength = encodeURIComponent(raw).length;

  if (encodedLength <= MAX_COOKIE_CHARS) {
    const name = COOKIE_PREFIX + key;
    document.cookie = `${name}=${encodeURIComponent(raw)}; path=/; max-age=${Math.floor(COOKIE_MAX_AGE_MS / 1000)}; SameSite=Lax`;
    if (readCookieValue(name) === raw) {
      removeLocalValue(key);
      return;
    }
  }

  // Payload too large for a cookie (or cookie rejected) -> localStorage
  deleteCookieValue(COOKIE_PREFIX + key);
  writeLocalValue(key, raw);
}

/**
 * Removes cached entries whose logical key starts with `prefix`.
 * Pass no argument to clear everything.
 */
export function clearClientCache(prefix = '') {
  // Memory
  for (const key of Array.from(memoryCache.keys())) {
    if (key.startsWith(prefix)) memoryCache.delete(key);
  }

  if (typeof document !== 'undefined' && document.cookie) {
    const names = document.cookie
      .split('; ')
      .map((part) => part.split('=')[0])
      .filter((name) => name.startsWith(COOKIE_PREFIX));
    for (const name of names) {
      const logicalKey = name.slice(COOKIE_PREFIX.length);
      if (logicalKey.startsWith(prefix)) {
        deleteCookieValue(name);
      }
    }
  }

  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      const keys = [];
      for (let i = 0; i < localStorage.length; i += 1) {
        const fullKey = localStorage.key(i);
        if (fullKey && fullKey.startsWith(STORAGE_PREFIX)) {
          const logicalKey = fullKey.slice(STORAGE_PREFIX.length);
          if (logicalKey.startsWith(prefix)) keys.push(fullKey);
        }
      }
      keys.forEach((fullKey) => localStorage.removeItem(fullKey));
    } catch {
      // Ignore
    }
  }
}

/**
 * Clears admin caches plus the public catalog caches they affect, so the
 * operator's browser reflects edits immediately instead of a stale cookie.
 */
export function invalidateAdminAndCatalog() {
  clearClientCache('admin_');
  clearClientCache('products_');
  clearClientCache('categories_');
}
