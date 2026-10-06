import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { cachedResponse } from '@/lib/cache';

export async function GET(req) {
  const { searchParams } = new URL(req.url);

  const rawLimit = parseInt(searchParams.get('limit') || '15', 10);
  const limit = Math.min(Math.max(isNaN(rawLimit) ? 15 : rawLimit, 10), 50);

  const category = searchParams.get('category') || 'all';
  const featured = searchParams.get('featured') || 'all';
  const deals = searchParams.get('deals') || 'all';

  const cacheKey = `products:${category}:${featured}:${deals}:${limit}`;

  return cachedResponse(cacheKey, 300, 600, async () => {
    if (!supabase) return { products: [], limit };

    let query = supabase
      .from('products')
      .select('*')
      .order('featured', { ascending: false })
      .order('created_at', { ascending: false })
      .limit(limit);

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
