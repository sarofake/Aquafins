import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { cachedResponse } from '@/lib/cache';

export async function GET(req) {
  const { searchParams } = new URL(req.url);

  const isAll = searchParams.get('all') === '1' || searchParams.get('all') === 'true';
  const rawLimit = parseInt(searchParams.get('limit') || '100', 10);
  const limit = isAll ? 500 : Math.min(Math.max(isNaN(rawLimit) ? 100 : rawLimit, 1), 500);

  const category = searchParams.get('category') || 'all';
  const featured = searchParams.get('featured') || 'all';
  const deals = searchParams.get('deals') || 'all';

  const cacheKey = `products:${category}:${featured}:${deals}:${isAll ? 'all' : limit}`;

  return cachedResponse(cacheKey, 60, 120, async () => {
    if (!supabase) return { products: [], limit };

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
    if (featured === 'true' || featured === '1') {
      query = query.eq('featured', true);
    }
    if (deals === 'true' || deals === '1') {
      query = query.eq('deals', true);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Failed to fetch public products:', error.message);
      return { products: [], limit };
    }

    return { products: data || [], limit };
  });
}
