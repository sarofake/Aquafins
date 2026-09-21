'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

// In-memory client cache to prevent repetitive DB/API calls on client navigation
const clientProductCache = new Map();
const CLIENT_CACHE_TTL_MS = 2 * 60 * 1000; // 2 minutes

export function useProducts(options = {}) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Extract limit and ensure it is strictly clamped between 10 and 50 (default: 15)
  const rawLimit = typeof options === 'number' ? options : options?.limit;
  const limit = Math.min(Math.max(Number(rawLimit) || 15, 10), 50);
  const category = typeof options === 'object' && options?.category ? options.category : 'all';
  const deals = typeof options === 'object' && options?.deals ? true : false;

  useEffect(() => {
    let cancelled = false;
    const cacheKey = `products_${category}_${deals}_${limit}`;

    // Check client-side cache first to avoid hitting server/DB on navigation
    const cached = clientProductCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CLIENT_CACHE_TTL_MS) {
      setProducts(cached.data);
      setLoading(false);
      return;
    }

    setLoading(true);

    async function fetchProducts() {
      // 1. Try serverless function endpoint first
      try {
        const queryParams = new URLSearchParams({ limit: String(limit) });
        if (category !== 'all') queryParams.set('category', category);
        if (deals) queryParams.set('deals', 'true');

        const res = await fetch(`/api/products?${queryParams.toString()}`);
        if (res.ok) {
          const json = await res.json();
          if (!cancelled) {
            const list = json.products || [];
            setProducts(list);
            clientProductCache.set(cacheKey, { data: list, timestamp: Date.now() });
            setLoading(false);
            return;
          }
        }
      } catch (err) {
        console.warn('Serverless products API fetch failed, falling back to direct Supabase query:', err);
      }

      // 2. Direct Supabase client query with database limit 10-15 fallback
      if (!supabase) {
        if (!cancelled) setLoading(false);
        return;
      }

      let query = supabase
        .from('products')
        .select('id, name, name_bn, quantity, quantity_bn, category, category_id, price, original_price, description, description_bn, image, images, keywords, featured, deals, available')
        .eq('available', true)
        .order('featured', { ascending: false })
        .order('created_at', { ascending: false })
        .limit(limit);

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
          clientProductCache.set(cacheKey, { data, timestamp: Date.now() });
        }
        setLoading(false);
      }
    }

    fetchProducts();

    return () => {
      cancelled = true;
    };
  }, [limit, category, deals]);

  return { products, loading };
}