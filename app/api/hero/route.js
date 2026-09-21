import { supabase } from '@/lib/supabase';
import { cachedResponse } from '@/lib/cache';

export async function GET() {
  return cachedResponse('hero_slides:public', 600, 1200, async () => {
    if (!supabase) return { slides: [] };

    const { data, error } = await supabase
      .from('hero_slides')
      .select('*')
      .eq('active', true)
      .order('sort_order', { ascending: true })
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Failed to fetch hero slides:', error.message);
      return { slides: [] };
    }

    return { slides: data || [] };
  });
}
