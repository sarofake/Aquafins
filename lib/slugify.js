// URL-safe slug helpers shared by the admin write path and public product links.

/**
 * Convert any text to a lowercase, URL-safe slug.
 * Returns '' when the input has no usable ASCII characters
 * (e.g. Bangla-only names) — callers must apply a fallback.
 */
export function slugify(input) {
  if (!input) return '';
  return String(input)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * Canonical public URL for a product: /products/<category>/<slug>
 * Automatically falls back to slugified product name or product-<id> if slug is unpopulated.
 */
export function productHref(product) {
  if (!product) return '#';
  const slug = product.slug || slugify(product.name) || `product-${product.id}`;
  const rawCat = product.category || 'all';
  const category = slugify(rawCat) || 'all';
  return `/products/${encodeURIComponent(category)}/${encodeURIComponent(slug)}`;
}

