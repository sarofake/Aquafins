'use client';

import Link from 'next/link';
import { ChevronRight, ArrowLeft } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { useCategories } from '@/hooks/useCategories';
import ProductDetail from '@/components/ProductDetail';

/**
 * Client view for the /products/<category>/<slug> page:
 * breadcrumb + shared product detail + back link.
 */
export default function ProductPageView({ product }) {
  const { lang, t } = useLanguage();
  const { categories } = useCategories();

  const categorySlug = product.category || 'all';
  const prodName = lang === 'bn' ? (product.name_bn || product.name) : product.name;

  const cat = categories.find(
    (c) => c.slug === product.category || String(c.id) === String(product.category_id)
  );
  const catLabel = cat
    ? lang === 'bn'
      ? cat.name_bn || cat.name
      : cat.name
    : t(categorySlug) || categorySlug;

  return (
    <div className="min-h-screen py-6 sm:py-10">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12">
        {/* Breadcrumb */}
        <nav
          aria-label="Breadcrumb"
          className="inline-flex flex-wrap items-center gap-2 text-xs font-semibold text-muted bg-brand-card/80 border border-brand-border/80 rounded-full px-4 py-2 mb-6 backdrop-blur-md shadow-sm max-w-full overflow-x-auto"
        >
          <Link href="/" className="hover:text-brand-cyan transition-colors flex items-center gap-1">
            {t('home')}
          </Link>
          <ChevronRight className="w-3.5 h-3.5 shrink-0 text-brand-border" />
          <Link href="/products" className="hover:text-brand-cyan transition-colors">
            {t('products')}
          </Link>
          <ChevronRight className="w-3.5 h-3.5 shrink-0 text-brand-border" />
          <Link
            href={`/products?category=${encodeURIComponent(categorySlug)}`}
            className="hover:text-brand-cyan transition-colors"
          >
            {catLabel}
          </Link>
          <ChevronRight className="w-3.5 h-3.5 shrink-0 text-brand-border" />
          <span className="text-main font-bold truncate max-w-[200px] sm:max-w-xs">{prodName}</span>
        </nav>

        {/* Elevated Product Main Card */}
        <div className="bg-brand-card/90 border border-brand-border rounded-3xl shadow-2xl backdrop-blur-md overflow-hidden p-2 sm:p-6 lg:p-8">
          <ProductDetail product={product} />
        </div>

        {/* Back to catalog link */}
        <div className="mt-8 flex items-center justify-between">
          <Link
            href={`/products?category=${encodeURIComponent(categorySlug)}`}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-brand-card hover:bg-brand-border/60 text-brand-cyan font-bold text-sm border border-brand-border hover:border-brand-cyan/40 transition-all shadow-sm active:scale-95"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>{catLabel}</span>
          </Link>
        </div>
      </main>
    </div>
  );
}
