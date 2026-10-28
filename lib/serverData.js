import { cache } from 'react';
import { supabase } from '@/lib/supabase';

/**
 * Hero slides for the first paint. Rendering them on the server keeps the
 * headline in the HTML (SEO) and, with the same data passed to the client,
 * removes the hydration mismatch the cache-first render used to cause.
 */
export const getHeroSlides = cache(async () => {
  if (!supabase) return [];

  try {
    const { data, error } = await supabase
      .from('hero_slides')
      .select('*')
      .eq('active', true)
      .order('sort_order', { ascending: true })
      .order('created_at', { ascending: false });

    if (error || !data) return [];
    return data;
  } catch {
    return [];
  }
});

/**
 * Categories (mother + sub) for the first paint. The storefront used to fall
 * back to a hardcoded list here, so a new deployment showed the template's
 * categories; now the database is the only source and an admin edit/deletion
 * shows up on the next render.
 */
export const getCategories = cache(async () => {
  if (!supabase) return [];

  try {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('sort_order', { ascending: true })
      .order('created_at', { ascending: true });

    if (error || !data) return [];
    return data;
  } catch {
    return [];
  }
});
