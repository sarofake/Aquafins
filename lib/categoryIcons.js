import {
  Apple,
  Baby,
  Bath,
  Bone,
  Boxes,
  Bug,
  Candy,
  Cat,
  Droplets,
  Fish,
  Flower2,
  Gift,
  Grid,
  Heart,
  Leaf,
  Milk,
  Mountain,
  Package,
  Puzzle,
  Shell,
  Shirt,
  Sofa,
  Sparkles,
  Star,
  Tag,
  Utensils,
  Wrench,
} from 'lucide-react';

/**
 * Icon names an admin can pick for a category. The chosen name is stored in
 * `categories.icon`, so the storefront never has to guess an icon from the
 * slug — which is what the old hardcoded list did.
 */
export const CATEGORY_ICONS = {
  Apple,
  Baby,
  Bath,
  Bone,
  Boxes,
  Bug,
  Candy,
  Cat,
  Droplets,
  Fish,
  Flower2,
  Gift,
  Grid,
  Heart,
  Leaf,
  Milk,
  Mountain,
  Package,
  Puzzle,
  Shell,
  Shirt,
  Sofa,
  Sparkles,
  Star,
  Tag,
  Utensils,
  Wrench,
};

export const CATEGORY_ICON_NAMES = Object.keys(CATEGORY_ICONS);

/** Resolves a stored icon name, falling back to a neutral grid icon. */
export function resolveCategoryIcon(name) {
  return CATEGORY_ICONS[String(name || '').trim()] || Grid;
}

/** Accent colours cycled per card so a new category still looks intentional. */
export const CATEGORY_ACCENTS = [
  { color: 'text-brand-cyan', bgColor: 'bg-brand-cyan/10' },
  { color: 'text-emerald-400', bgColor: 'bg-emerald-500/10' },
  { color: 'text-purple-400', bgColor: 'bg-purple-500/10' },
  { color: 'text-yellow-400', bgColor: 'bg-yellow-500/10' },
  { color: 'text-amber-400', bgColor: 'bg-amber-500/10' },
  { color: 'text-rose-400', bgColor: 'bg-rose-500/10' },
  { color: 'text-sky-400', bgColor: 'bg-sky-500/10' },
  { color: 'text-lime-400', bgColor: 'bg-lime-500/10' },
];

export function categoryAccent(index = 0) {
  return CATEGORY_ACCENTS[index % CATEGORY_ACCENTS.length];
}
