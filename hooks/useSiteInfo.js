'use client';

import { useEffect, useState } from 'react';
import { getClientCachedItem, setClientCachedItem } from '@/lib/clientCache';
import { useSiteInfoSeed } from '@/components/SiteInfoProvider';
import { formatPrice, CURRENCY_SYMBOL, DEFAULT_CURRENCY } from '@/lib/currency';

const SITE_INFO_CACHE_KEY = 'site_info_public';
// Kept short so branding edits in Admin → Site Info show up quickly.
const SITE_INFO_CACHE_TTL_MS = 60 * 1000; // 1 minute

// Several components (header brand, socials, contact, footer, banner) read site
// info at once; share a single in-flight request instead of firing one each.
let inflightRequest = null;

function fetchSiteInfo() {
  if (inflightRequest) return inflightRequest;

  inflightRequest = fetch('/api/site-info')
    .then((r) => r.json())
    .then((data) => {
      if (data?.info) {
        setClientCachedItem(SITE_INFO_CACHE_KEY, data.info);
        return data.info;
      }
      return {};
    })
    .catch((err) => {
      console.error('Failed to fetch site info:', err);
      return {};
    })
    .finally(() => {
      inflightRequest = null;
    });

  return inflightRequest;
}

export function useSiteInfo(initialInfo = null) {
  // Prefer explicit props, then the value the server already rendered.
  const contextInfo = useSiteInfoSeed();
  const seedSource = initialInfo || contextInfo;

  const seeded =
    seedSource && Object.keys(seedSource).length > 0 ? seedSource : null;

  // Never read the browser cache during the first render: the server has no
  // cache, so doing it here is exactly what causes hydration mismatches.
  const [info, setInfo] = useState(() => seeded || {});
  const [loading, setLoading] = useState(() => !seeded);

  useEffect(() => {
    let active = true;

    // Branding came from the server render: use it as-is and refresh the
    // local cache so client-side navigations stay fast.
    if (seeded) {
      setInfo(seeded);
      setLoading(false);
      setClientCachedItem(SITE_INFO_CACHE_KEY, seeded);
      return () => {
        active = false;
      };
    }

    const cached = getClientCachedItem(SITE_INFO_CACHE_KEY, SITE_INFO_CACHE_TTL_MS);
    if (cached && Object.keys(cached).length > 0) {
      setInfo(cached);
      setLoading(false);
      return () => {
        active = false;
      };
    }

    fetchSiteInfo()
      .then((info) => {
        if (active && info && Object.keys(info).length > 0) {
          setInfo(info);
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [seeded]);

  return { info, loading };
}

const FALLBACK_BRAND = {
  name: 'Aqua Fins Bangladesh',
  tagline: 'Premium Aquatics & Supplies',
  logoUrl: '/aquafinsbangladesh logo.png',
};

/**
 * Brand values (name, tagline, logo) as edited in Admin → Site Info, with
 * sensible fallbacks so the header/footer never render empty.
 */
export function useBrand(initialInfo = null) {
  const { info, loading } = useSiteInfo(initialInfo);

  const logoUrl = (info.logo_url || '').trim() || FALLBACK_BRAND.logoUrl;

  return {
    loading,
    name: (info.site_name || '').trim() || FALLBACK_BRAND.name,
    tagline: (info.site_tagline || '').trim() || FALLBACK_BRAND.tagline,
    logoUrl,
    faviconUrl: (info.favicon_url || '').trim(),
    hasCustomLogo: logoUrl !== FALLBACK_BRAND.logoUrl,
  };
}

/**
 * Builds the two-line header/footer treatment: the site name on the main line
 * and the tagline in the small accent line. When no usable tagline is set, the
 * last word of the name is used instead (the template's original look).
 */
export function splitBrandName(name, tagline = '') {
  const fullName = String(name || '').trim();
  const tag = String(tagline || '').trim();

  if (tag && tag.length <= 30) {
    return { primary: fullName, secondary: tag };
  }

  const parts = fullName.split(/\s+/).filter(Boolean);

  if (parts.length <= 1) {
    return { primary: parts[0] || '', secondary: '' };
  }

  const secondary = parts.pop();
  return { primary: parts.join(' '), secondary };
}

// No template-brand fallbacks here on purpose: this project is deployed as a
// separate site per business, so an unset phone/social must render nothing
// instead of another brand's contact details.
function digitsOnly(value) {
  return String(value || '').replace(/[^\d+]/g, '');
}

/** A stored phone number is usable when it has enough digits to dial. */
function isUsablePhone(value) {
  return String(value || '').replace(/\D/g, '').length >= 8;
}

function isUsableEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value || '').trim());
}

/** Derives a Messenger chat link from a Facebook page URL, when possible. */
function messengerFromFacebook(url) {
  try {
    const parsed = new URL(url);
    const segments = parsed.pathname.split('/').filter(Boolean);
    const handle = segments[segments.length - 1];
    if (!handle || /\.php$/i.test(handle)) return '';
    return `https://m.me/${handle.replace(/^@/, '')}`;
  } catch {
    return '';
  }
}

/**
 * Turns a stored WhatsApp value (URL or phone number) into a wa.me link.
 * Numbers written in local Bangladeshi format (01XXXXXXXXX) are converted to
 * the international form; full URLs are passed through untouched.
 */
function toWhatsAppHref(value) {
  const raw = String(value || '').trim();
  if (!raw) return '';
  if (/^https?:\/\//i.test(raw)) return raw;

  let digits = raw.replace(/\D/g, '');
  if (digits.startsWith('00')) digits = digits.slice(2);
  if (digits.startsWith('0')) digits = `880${digits.slice(1)}`;

  // Too short to be a real number (placeholder text, half-typed input).
  if (digits.length < 8) return '';

  return `https://wa.me/${digits}`;
}

/** Normalises a stored website value into an absolute URL. */
function toWebsiteHref(value) {
  const raw = String(value || '').trim();
  if (!raw) return '';
  return /^https?:\/\//i.test(raw) ? raw : `https://${raw}`;
}

/** Social profile URLs, straight from Admin → Site Info. Unset = hidden. */
export function useSocialLinks(initialInfo = null) {
  const { info, loading } = useSiteInfo(initialInfo);

  const pick = (key) => (info[key] || '').trim();
  const facebook = pick('facebook');

  return {
    loading,
    facebook,
    youtube: pick('youtube'),
    instagram: pick('instagram'),
    threads: pick('threads'),
    tiktok: pick('tiktok'),
    twitter: pick('twitter'),
    website: toWebsiteHref(info.website),
    messenger: messengerFromFacebook(facebook),
    // Numbers written as placeholders ("+880 1XXX-XXXXXX") produce no link, so
    // the icon disappears instead of opening a dead wa.me page.
    whatsapp: toWhatsAppHref(info.whatsapp) || toWhatsAppHref(info.phone_primary),
  };
}

/** Phone / email / address / hours shown in the header, footer and contact page. */
export function useContactInfo(initialInfo = null) {
  const { info, loading } = useSiteInfo(initialInfo);

  const phone = isUsablePhone(info.phone_primary) ? info.phone_primary.trim() : '';
  const email = isUsableEmail(info.email) ? info.email.trim() : '';
  const whatsapp = isUsablePhone(info.whatsapp) ? info.whatsapp.trim() : phone;
  const address = (info.address || '').trim();
  const addressBn = (info.address_bn || '').trim();
  const city = (info.city || '').trim();
  const country = (info.country || '').trim();

  return {
    loading,
    phone,
    phoneAlt: isUsablePhone(info.phone_secondary) ? info.phone_secondary.trim() : '',
    phoneHref: phone ? `tel:${digitsOnly(phone).replace(/^\+/, '')}` : '',
    email,
    emailSupport: isUsableEmail(info.email_support) ? info.email_support.trim() : '',
    website: (info.website || '').trim(),
    websiteHref: toWebsiteHref(info.website),
    address,
    addressBn,
    city,
    country,
    // "12 Road 5, Dhaka, Bangladesh" — skips whatever is not filled in.
    fullAddress: [...new Set([address, city, country].filter(Boolean))].join(', '),
    fullAddressBn: [...new Set([addressBn, city, country].filter(Boolean))].join(', '),
    businessHours: (info.business_hours || '').trim(),
    businessHoursBn: (info.business_hours_bn || '').trim(),
    mapEmbedUrl: (info.map_embed_url || '').trim(),
    minOrderAmount: Number(info.min_order_amount) > 0 ? Number(info.min_order_amount) : 0,
    whatsappHref: toWhatsAppHref(whatsapp),
    whatsappNumber: whatsapp,
  };
}

/**
 * Prices use the currency chosen in Admin → Site Info → Currency & Colors.
 * `format()` is what components should call instead of importing formatPrice.
 */
export function useCurrency(initialInfo = null) {
  const { info, loading } = useSiteInfo(initialInfo);
  const code = (info.currency_code || '').trim() || DEFAULT_CURRENCY;
  // Operators sometimes fill the code but leave the symbol blank; showing
  // "BDT 1,234" beats falling back to the template's unrelated symbol.
  const symbol = (info.currency || '').trim() || code || CURRENCY_SYMBOL;

  return {
    loading,
    symbol,
    code,
    format: (amount) => formatPrice(amount, symbol),
  };
}

