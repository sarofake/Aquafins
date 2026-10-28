import { supabase } from '@/lib/supabase';
import { cachedResponse } from '@/lib/cache';

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const includeAll = searchParams.get('all') === '1';

  const cacheKey = `categories:${includeAll ? 'all' : 'parent'}`;

  return cachedResponse(cacheKey, 60, 120, async () => {
    if (!supabase) return { categories: [] };

    let query = supabase
      .from('categories')
      .select('*')
      .order('sort_order', { ascending: true })
      .order('created_at', { ascending: true });

    if (!includeAll) {
      query = query.is('parent_id', null);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Failed to fetch public categories:', error.message);
      return { categories: [] };
    }

    return { categories: data || [] };
  });
}
