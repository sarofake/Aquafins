import { cache } from 'react';
import { notFound, redirect } from 'next/navigation';
import { unstable_cache } from 'next/cache';
import { supabase } from '@/lib/supabase';
import { productHref } from '@/lib/slugify';
import ProductPageView from '@/components/ProductPageView';

import { slugify } from '@/lib/slugify';

const fetchProductBySlug = async (slug) => {
  if (!supabase || !slug) return null;

  // 1. Try DB lookup by slug column
  try {
    const { data } = await supabase
      .from('products')
      .select('*')
      .eq('slug', slug)
      .maybeSingle();

    if (data) return data;
  } catch (e) {
    // Column might not exist or error thrown
  }

  // 2. Dynamic fallback: match slugify(name), product-${id}, or ID
  const { data } = await supabase.from('products').select('*');
  if (data && data.length > 0) {
    const target = slug.toLowerCase().trim();
    const match = data.find((p) => {
      if (p.slug && String(p.slug).toLowerCase().trim() === target) return true;
      const computedSlug = slugify(p.name) || `product-${p.id}`;
      if (computedSlug.toLowerCase().trim() === target) return true;
      if (String(p.id) === target) return true;
      return false;
    });
    if (match) return match;
  }

  return null;
};

// Cache product lookups across requests so repeat product views don't hit the
// database. Refreshed every 5 min and on admin edits (revalidateTag('products')).
const getProductBySlug = cache(
  unstable_cache(fetchProductBySlug, ['product-by-slug'], {
    revalidate: 300,
    tags: ['products'],
  })
);


export async function generateMetadata({ params }) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) {
    return { title: 'Product not found' };
  }

  const description = (product.description || '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 160);

  return {
    // The root layout appends " | <site name>" via its title template, so the
    // brand name is never hardcoded here.
    title: product.name,
    description: description || undefined,
    openGraph: {
      description: description || undefined,
      images: product.image ? [{ url: product.image }] : undefined,
      type: 'website',
    },
  };
}

export default async function ProductPage({ params }) {
  const { category, slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) notFound();

  // Keep one canonical URL per product: /products/<category>/<slug>
  const canonical = productHref(product);
  if (`/products/${category}/${slug}` !== canonical) {
    redirect(canonical);
  }

  return <ProductPageView product={product} />;
}
