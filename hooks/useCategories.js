'use client';

import { useEffect, useState } from 'react';
import { getClientCachedItem, setClientCachedItem } from '@/lib/clientCache';

const CACHE_TTL_MS = 10 * 60 * 1000; // 10 minutes

export function useCategories() {
  const cacheKey = 'categories_all';

  const [categories, setCategories] = useState(() => {
    return getClientCachedItem(cacheKey, CACHE_TTL_MS) || [];
  });
  const [loading, setLoading] = useState(() => {
    const cached = getClientCachedItem(cacheKey, CACHE_TTL_MS);
    return !cached || cached.length === 0;
  });

  useEffect(() => {
    let active = true;

    const cached = getClientCachedItem(cacheKey, CACHE_TTL_MS);
    if (cached && Array.isArray(cached) && cached.length > 0) {
      setCategories(cached);
      setLoading(false);
      return;
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
  }, []);

  return { categories, loading };
}
