'use client';

import { useEffect, useState } from 'react';
import { getClientCachedItem, setClientCachedItem } from '@/lib/clientCache';

const SITE_INFO_CACHE_KEY = 'site_info_public';
const SITE_INFO_CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

export function useSiteInfo() {
  const [info, setInfo] = useState(() => {
    return getClientCachedItem(SITE_INFO_CACHE_KEY, SITE_INFO_CACHE_TTL_MS) || {};
  });
  const [loading, setLoading] = useState(() => {
    const cached = getClientCachedItem(SITE_INFO_CACHE_KEY, SITE_INFO_CACHE_TTL_MS);
    return !cached || Object.keys(cached).length === 0;
  });

  useEffect(() => {
    let active = true;

    const cached = getClientCachedItem(SITE_INFO_CACHE_KEY, SITE_INFO_CACHE_TTL_MS);
    if (cached && Object.keys(cached).length > 0) {
      setInfo(cached);
      setLoading(false);
      return;
    }

    fetch('/api/site-info')
      .then((r) => r.json())
      .then((data) => {
        if (active && data.info) {
          setInfo(data.info);
          setClientCachedItem(SITE_INFO_CACHE_KEY, data.info);
        }
      })
      .catch((err) => {
        console.error('Failed to fetch site info:', err);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  return { info, loading };
}
