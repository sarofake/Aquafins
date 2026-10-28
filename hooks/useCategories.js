'use client';

import { useEffect, useState } from 'react';
import { getClientCachedItem, setClientCachedItem } from '@/lib/clientCache';
import { useCategoriesSeed } from '@/components/CategoriesProvider';

const CACHE_TTL_MS = 10 * 60 * 1000; // 10 minutes

/**
 * Category tree (mother + sub) straight from the database.
 *
 * The site layout renders it on the server and shares it through
 * CategoriesProvider, so the header, footer and home page match the admin panel
 * on the first paint. Outside the storefront (admin pages) it falls back to a
 * cached fetch.
 */
export function useCategories(initialCategories = null) {
  const cacheKey = 'categories_all';
  const seed = useCategoriesSeed();
  const seedSource = Array.isArray(initialCategories)
    ? initialCategories
    : Array.isArray(seed)
      ? seed
      : null;

  // Never read the browser cache during the first render: the server has no
  // cache, so doing it here is what causes hydration mismatches.
  const [categories, setCategories] = useState(() => seedSource || []);
  const [loading, setLoading] = useState(() => !seedSource);

  useEffect(() => {
    let active = true;

    // The server already sent the tree; just refresh the local cache for
    // client-side navigations.
    if (seedSource) {
      setCategories(seedSource);
      setLoading(false);
      setClientCachedItem(cacheKey, seedSource);
      return () => {
        active = false;
      };
    }

    const cached = getClientCachedItem(cacheKey, CACHE_TTL_MS);
    if (cached && Array.isArray(cached) && cached.length > 0) {
      setCategories(cached);
      setLoading(false);
      return () => {
        active = false;
      };
    }

    fetch('/api/categories?all=1')
      .then((r) => r.json())
      .then((data) => {
        if (active && Array.isArray(data.categories)) {
          setCategories(data.categories);
          setClientCachedItem(cacheKey, data.categories);
        }
      })
      .catch((err) => {
        console.error('Failed to fetch categories:', err);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [seedSource]);

  return { categories, loading };
}
