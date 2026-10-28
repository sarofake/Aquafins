'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { getClientCachedItem, setClientCachedItem } from '@/lib/clientCache';

const CLIENT_CACHE_TTL_MS = 3 * 60 * 1000; // 3 minutes browser cache

export function useProducts(options = {}) {
  const isAll = options?.all === true || (typeof options === 'object' && options?.all === '1');
  const rawLimit = typeof options === 'number' ? options : options?.limit;
  const limit = isAll ? 500 : Math.min(Math.max(Number(rawLimit) || 100, 1), 500);
  const category = typeof options === 'object' && options?.category ? options.category : 'all';
  const deals = typeof options === 'object' && options?.deals ? true : false;
  const cacheKey = `products_${category}_${deals}_${isAll ? 'all' : limit}`;

  // Start empty so the server HTML and the first client render match; the
  // browser cache is applied in the effect below, one frame later.
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    // Check client-side persistent cache
    const cached = getClientCachedItem(cacheKey, CLIENT_CACHE_TTL_MS);
    if (cached && cached.length > 0) {
      setProducts(cached);
      setLoading(false);
      return;
    }

    setLoading(true);

    async function fetchProducts() {
      // 1. Try serverless function endpoint first
      try {
        const queryParams = new URLSearchParams();
        if (isAll) {
          queryParams.set('all', '1');
        } else {
          queryParams.set('limit', String(limit));
        }
        if (category !== 'all') queryParams.set('category', category);
        if (deals) queryParams.set('deals', 'true');

        const res = await fetch(`/api/products?${queryParams.toString()}`);
        if (res.ok) {
          const json = await res.json();
          if (!cancelled) {
            const list = json.products || [];
            setProducts(list);
            setClientCachedItem(cacheKey, list);
            setLoading(false);
            return;
          }
        }
      } catch (err) {
        console.warn('Serverless products API fetch failed, falling back to direct Supabase query:', err);
      }

      // 2. Direct Supabase client query fallback
      if (!supabase) {
        if (!cancelled) setLoading(false);
        return;
      }

      try {
        let query = supabase
          .from('products')
          .select('*')
          .order('featured', { ascending: false })
          .order('created_at', { ascending: false });

        if (!isAll) {
          query = query.limit(limit);
        }

        if (category && category !== 'all') {
          query = query.eq('category', category);
        }

        if (deals) {
          query = query.eq('deals', true);
        }

        const { data, error } = await query;
        if (!cancelled) {
          if (error) {
            console.error('Supabase products fetch failed:', error.message);
            setProducts([]);
          } else if (data) {
            setProducts(data);
            setClientCachedItem(cacheKey, data);
          }
          setLoading(false);
        }
      } catch (err) {
        console.warn('Direct Supabase products query failed:', err);
        if (!cancelled) {
          setProducts([]);
          setLoading(false);
        }
      }
    }

    fetchProducts().catch((err) => {
      console.warn('Products fetch failed:', err);
      if (!cancelled) {
        setProducts([]);
        setLoading(false);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [limit, category, deals, isAll]);

  return { products, loading };
}