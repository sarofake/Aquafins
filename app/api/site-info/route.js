import { supabase } from '@/lib/supabase';
import { cachedResponse } from '@/lib/cache';

export async function GET() {
  return cachedResponse('site_info:public', 600, 1200, async () => {
    if (!supabase) return { info: {} };

    const { data, error } = await supabase
      .from('site_info')
      .select('key, value');

    if (error) return { info: {} };

    const info = {};
    (data || []).forEach((row) => { info[row.key] = row.value; });
    return { info };
  });
}
