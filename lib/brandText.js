/**
 * The name the template was authored with. Long-form marketing copy, legal
 * pages and translated strings contain it, so it is swapped for the deployment's
 * own name at render time instead of duplicating every paragraph per customer.
 */
export const TEMPLATE_BRAND = 'Aqua Fins Bangladesh';

const TEMPLATE_BRAND_VARIANTS = [TEMPLATE_BRAND, 'Aqua Fins', 'অ্যাকুয়া ফিন্স বাংলাদেশ'];

/**
 * Replaces the template brand name inside a string with the configured one.
 * Safe to call with undefined/null and on strings that do not mention a brand.
 */
export function brandify(text, name) {
  if (text === null || text === undefined) return text ?? '';

  const target = String(name || '').trim();
  if (!target || target === TEMPLATE_BRAND) return text;

  let out = String(text);
  for (const variant of TEMPLATE_BRAND_VARIANTS) {
    if (out.includes(variant)) out = out.split(variant).join(target);
  }
  return out;
}
