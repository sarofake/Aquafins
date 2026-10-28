'use client';

import { useEffect, useState } from 'react';
import { getClientCachedItem, setClientCachedItem } from '@/lib/clientCache';
import { useSiteInfoSeed } from '@/components/SiteInfoProvider';

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

  const [info, setInfo] = useState(() => {
    return seeded || getClientCachedItem(SITE_INFO_CACHE_KEY, SITE_INFO_CACHE_TTL_MS) || {};
  });
  const [loading, setLoading] = useState(() => {
    if (seeded) return false;
    const cached = getClientCachedItem(SITE_INFO_CACHE_KEY, SITE_INFO_CACHE_TTL_MS);
    return !cached || Object.keys(cached).length === 0;
  });

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

// Defaults match the shipped theme so an unconfigured deployment still looks
// complete. Everything here is overridable in Admin → Site Info.
const FALLBACK_SOCIALS = {
  facebook: 'https://www.facebook.com/aquafinsbangladesh/',
  youtube: 'https://www.youtube.com/@aquafinsbd',
  instagram: 'https://www.instagram.com/aquafinsbd',
  threads: 'https://www.threads.com/@aquafinsbd',
  tiktok: 'https://www.tiktok.com/@aquafinsbd',
};

const FALLBACK_CONTACT = {
  phone: '01787-283804',
  email: 'support@aquafins.bd',
  whatsapp: '01787-283804',
};

function digitsOnly(value) {
  return String(value || '').replace(/[^\d+]/g, '');
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

  return digits ? `https://wa.me/${digits}` : '';
}

/** Normalises a stored website value into an absolute URL. */
function toWebsiteHref(value) {
  const raw = String(value || '').trim();
  if (!raw) return '';
  return /^https?:\/\//i.test(raw) ? raw : `https://${raw}`;
}

/** Social profile URLs, falling back to the theme defaults when unset. */
export function useSocialLinks(initialInfo = null) {
  const { info, loading } = useSiteInfo(initialInfo);

  const pick = (key) => (info[key] || '').trim() || FALLBACK_SOCIALS[key];
  const facebook = pick('facebook');

  return {
    loading,
    facebook,
    youtube: pick('youtube'),
    instagram: pick('instagram'),
    threads: pick('threads'),
    tiktok: pick('tiktok'),
    twitter: (info.twitter || '').trim(),
    messenger: messengerFromFacebook(facebook),
    whatsapp: toWhatsAppHref((info.whatsapp || '').trim() || FALLBACK_CONTACT.whatsapp),
  };
}

/** Phone / email / address shown in the header and footer. */
export function useContactInfo(initialInfo = null) {
  const { info, loading } = useSiteInfo(initialInfo);

  const phone = (info.phone_primary || '').trim() || FALLBACK_CONTACT.phone;
  const email = (info.email || '').trim() || FALLBACK_CONTACT.email;

  return {
    loading,
    phone,
    phoneAlt: (info.phone_secondary || '').trim(),
    phoneHref: `tel:${digitsOnly(phone).replace(/^\+/, '')}`,
    email,
    emailSupport: (info.email_support || '').trim(),
    website: (info.website || '').trim(),
    websiteHref: toWebsiteHref(info.website),
    address: (info.address || '').trim(),
    addressBn: (info.address_bn || '').trim(),
    city: (info.city || '').trim(),
    country: (info.country || '').trim(),
    whatsappHref: toWhatsAppHref((info.whatsapp || '').trim() || phone),
    whatsappNumber: (info.whatsapp || '').trim() || phone,
  };
}
