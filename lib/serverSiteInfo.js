import { cache } from 'react';
import { supabase } from '@/lib/supabase';

export const SITE_INFO_FALLBACK = {
  site_name: 'Aqua Fins Bangladesh',
  site_tagline: 'Premium Aquatics & Supplies',
  site_description:
    'Discover hand-picked collection of state-of-the-art aquariums, exotic livestock, aquatic plants, and premium supplies across Bangladesh.',
  logo_url: '/aquafinsbangladesh logo.png',
  favicon_url: '',
};

/**
 * Reads site settings on the server (metadata, SSR). Always resolves — a
 * missing table, bad credentials or an empty database falls back to defaults so
 * a fresh deployment still renders.
 */
export const getSiteInfo = cache(async () => {
  if (!supabase) return SITE_INFO_FALLBACK;

  try {
    const { data, error } = await supabase.from('site_info').select('key, value');
    if (error || !data || data.length === 0) return SITE_INFO_FALLBACK;

    const info = { ...SITE_INFO_FALLBACK };
    for (const row of data) {
      info[row.key] = row.value;
    }
    return info;
  } catch {
    return SITE_INFO_FALLBACK;
  }
});

export function brandFromSiteInfo(info = {}) {
  const name = (info.site_name || '').trim() || SITE_INFO_FALLBACK.site_name;
  const tagline = (info.site_tagline || '').trim() || SITE_INFO_FALLBACK.site_tagline;
  const logoUrl = (info.logo_url || '').trim() || SITE_INFO_FALLBACK.logo_url;
  const faviconUrl = (info.favicon_url || '').trim() || logoUrl;

  return { name, tagline, logoUrl, faviconUrl };
}
