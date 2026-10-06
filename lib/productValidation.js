/**
 * Product Mandatory Data Validation & Draft State Helpers
 */

export const MANDATORY_FIELDS = [
  {
    key: 'name',
    label: 'Product Title',
    isMissing: (p) => !p || !p.name || !String(p.name).trim(),
  },
  {
    key: 'price',
    label: 'Price (৳)',
    isMissing: (p) =>
      !p ||
      p.price === undefined ||
      p.price === null ||
      p.price === '' ||
      isNaN(Number(p.price)) ||
      Number(p.price) <= 0,
  },
  {
    key: 'category',
    label: 'Category',
    isMissing: (p) => !p || !p.category || !String(p.category).trim(),
  },
  {
    key: 'image',
    label: 'Primary Image / Media',
    isMissing: (p) => {
      if (!p) return true;
      const hasImg =
        p.image &&
        typeof p.image === 'string' &&
        p.image.trim() &&
        !p.image.includes('placehold.co');
      const hasImagesArray =
        Array.isArray(p.images) &&
        p.images.length > 0 &&
        p.images.some((m) => m && (m.url || m.youtube_id));
      return !hasImg && !hasImagesArray;
    },
  },
  {
    key: 'description',
    label: 'Description',
    isMissing: (p) => !p || !p.description || !String(p.description).trim(),
  },
];

/**
 * Returns an array of labels for missing mandatory fields in a product object.
 */
export function getMissingProductFields(product) {
  if (!product) return MANDATORY_FIELDS.map((f) => f.label);
  return MANDATORY_FIELDS.filter((f) => f.isMissing(product)).map((f) => f.label);
}

/**
 * Returns true if a product is considered a Draft / Incomplete.
 */
export function isProductDraft(product) {
  if (!product) return true;
  return getMissingProductFields(product).length > 0;
}
