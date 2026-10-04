import { SESSION_COOKIE, verifySessionToken } from '@/lib/adminSession';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { translateToBangla } from '@/lib/translator';
import { NextResponse } from 'next/server';

import { extractYouTubeId, getYouTubeThumbnailUrl } from '@/lib/youtube';

/**
 * Verify admin session from request cookies (App Router route handlers).
 * Use this in all admin API routes instead of duplicating auth logic.
 */
export function authed(req) {
  const token = req.cookies?.get(SESSION_COOKIE)?.value;
  return verifySessionToken(token);
}

/**
 * Returns 401 JSON response for unauthorized requests.
 */
export function unauthorized() {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
}

/**
 * Returns 503 JSON response when Supabase admin client is not configured.
 */
export function supabaseNotConfigured() {
  return NextResponse.json(
    { error: 'Supabase admin client not configured. Check SUPABASE_SERVICE_ROLE_KEY.' },
    { status: 503 }
  );
}

/**
 * Sanitize and validate product body from admin form submission.
 * Handles translation, image/video normalization, keyword validation.
 */
export async function sanitizeProduct(body) {
  const name = typeof body.name === 'string' && body.name.trim() ? body.name.trim() : null;
  const category =
    typeof body.category === 'string' && body.category.trim() ? body.category.trim() : null;
  const price = Number(body.price);

  if (!name || !category || !Number.isFinite(price) || price <= 0) {
    return { error: 'Product name (English), category and a positive price are required' };
  }

  const name_bn =
    typeof body.name_bn === 'string' && body.name_bn.trim()
      ? body.name_bn.trim()
      : await translateToBangla(name);

  const description = typeof body.description === 'string' ? body.description.trim() : '';
  const description_bn =
    typeof body.description_bn === 'string' && body.description_bn.trim()
      ? body.description_bn.trim()
      : description
      ? await translateToBangla(description)
      : '';

  const original_price =
    body.original_price && Number.isFinite(Number(body.original_price))
      ? Number(body.original_price)
      : null;
  const category_id =
    body.category_id && Number.isFinite(Number(body.category_id))
      ? Number(body.category_id)
      : null;

  let rawImages = Array.isArray(body.images) ? body.images : [];
  if (rawImages.length === 0 && typeof body.image === 'string' && body.image) {
    rawImages = [{ type: 'image', url: body.image, is_default: true }];
  }

  let images = rawImages
    .map((item) => {
      if (!item) return null;
      if (typeof item === 'string') {
        return { type: 'image', url: item, is_default: false };
      }
      const ytId = extractYouTubeId(item.url || item.youtube_id || item.video_url);
      if (item.type === 'video' || ytId) {
        const videoId = ytId || item.youtube_id || '';
          return {
          type: 'video',
          url: item.url || (videoId ? `https://www.youtube.com/watch?v=${videoId}` : ''),
          youtube_id: videoId,
          use_youtube_thumbnail: false,
          thumbnail_url: item.thumbnail_url || (videoId ? getYouTubeThumbnailUrl(videoId) : ''),
          is_default: Boolean(item.is_default),
        };
      }
      return {
        type: 'image',
        url: item.url || '',
        is_default: Boolean(item.is_default),
      };
    })
    .filter((img) => img && (img.url || img.youtube_id));

  if (images.length > 0) {
    const hasDefault = images.some((img) => img.is_default);
    if (!hasDefault) images[0].is_default = true;
  }

  const defaultMedia = images.find((img) => img.is_default) || images[0];
  const primaryImage = defaultMedia
    ? defaultMedia.type === 'video'
      ? defaultMedia.thumbnail_url || (defaultMedia.youtube_id ? getYouTubeThumbnailUrl(defaultMedia.youtube_id) : defaultMedia.url) || ''
      : defaultMedia.url
    : '';

  const quantity = typeof body.quantity === 'string' ? body.quantity.trim() : '';
  const quantity_bn = typeof body.quantity_bn === 'string' ? body.quantity_bn.trim() : '';

  const seenKeywords = new Set();
  const keywordList = [];
  const keywordsRaw = typeof body.keywords === 'string' ? body.keywords : '';
  for (const raw of keywordsRaw.split(',')) {
    const kw = raw.trim().toLowerCase().replace(/\s+/g, ' ');
    if (!kw || seenKeywords.has(kw)) continue;
    seenKeywords.add(kw);
    keywordList.push(kw);
  }
  if (keywordList.length < 3) {
    return { error: 'Provide at least 3 search keywords (comma separated)' };
  }
  if (keywordList.length > 10) {
    return { error: 'Maximum 10 search keywords allowed' };
  }

  return {
    name,
    name_bn,
    quantity,
    quantity_bn,
    category,
    price,
    original_price,
    category_id,
    description,
    description_bn,
    image: primaryImage,
    images,
    keywords: keywordList.join(', '),
    featured: Boolean(body.featured),
    deals: Boolean(body.deals),
    available: body.available === undefined ? true : Boolean(body.available),
    updated_at: new Date().toISOString(),
  };
}

/**
 * Sanitize and validate hero slide body from admin form submission.
 */
export async function sanitizeSlide(body) {
  const title = typeof body.title === 'string' && body.title.trim() ? body.title.trim() : null;
  const image = typeof body.image === 'string' && body.image.trim() ? body.image.trim() : null;

  if (!title || !image) {
    return { error: 'Slide title (English) and image URL are required' };
  }

  const title_bn =
    typeof body.title_bn === 'string' && body.title_bn.trim()
      ? body.title_bn.trim()
      : await translateToBangla(title);

  const subtitle = typeof body.subtitle === 'string' ? body.subtitle.trim() : '';
  const subtitle_bn =
    typeof body.subtitle_bn === 'string' && body.subtitle_bn.trim()
      ? body.subtitle_bn.trim()
      : subtitle
      ? await translateToBangla(subtitle)
      : '';

  const badge = typeof body.badge === 'string' ? body.badge.trim() : '';
  const badge_bn =
    typeof body.badge_bn === 'string' && body.badge_bn.trim()
      ? body.badge_bn.trim()
      : badge
      ? await translateToBangla(badge)
      : '';

  const button_text =
    typeof body.button_text === 'string' && body.button_text.trim()
      ? body.button_text.trim()
      : 'Explore Catalog';
  const button_text_bn =
    typeof body.button_text_bn === 'string' && body.button_text_bn.trim()
      ? body.button_text_bn.trim()
      : await translateToBangla(button_text);

  return {
    title,
    title_bn,
    subtitle,
    subtitle_bn,
    badge,
    badge_bn,
    image,
    image_public_id: typeof body.image_public_id === 'string' ? body.image_public_id : '',
    button_text,
    button_text_bn,
    button_link:
      typeof body.button_link === 'string' && body.button_link.trim()
        ? body.button_link.trim()
        : '/products',
    sort_order: body.sort_order ? Number(body.sort_order) : 0,
    active: body.active === undefined ? true : Boolean(body.active),
    updated_at: new Date().toISOString(),
  };
}

/**
 * Require admin auth on a route handler. Returns null if authed, or a NextResponse 401.
 */
export function requireAuth(req) {
  return authed(req) ? null : unauthorized();
}

/**
 * Require Supabase admin client. Returns the client if available, or sends 503 response.
 */
export function requireSupabase() {
  return supabaseAdmin ? supabaseAdmin : null;
}
