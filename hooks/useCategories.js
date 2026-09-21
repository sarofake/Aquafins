'use client';

import { useEffect, useState } from 'react';

const clientCategoriesCache = { data: null, timestamp: 0 };
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

export function useCategories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    if (clientCategoriesCache.data && Date.now() - clientCategoriesCache.timestamp < CACHE_TTL_MS) {
      setCategories(clientCategoriesCache.data);
      setLoading(false);
      return;
    }

    fetch('/api/categories?all=1')
      .then((r) => r.json())
      .then((data) => {
        if (active && Array.isArray(data.categories)) {
          setCategories(data.categories);
          clientCategoriesCache.data = data.categories;
          clientCategoriesCache.timestamp = Date.now();
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
