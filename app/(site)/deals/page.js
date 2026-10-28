'use client';

import React, { useState, useEffect, useMemo, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useProducts } from '@/hooks/useProducts';
import { useCategories } from '@/hooks/useCategories';
import { Search, Sparkles, PackageOpen, ShoppingBag, Tag } from 'lucide-react';
import OrderModal from '@/components/OrderModal';
import ProductModal from '@/components/ProductModal';
import ProductCard from '@/components/ProductCard';
import FormattedText from '@/components/FormattedText';
import { useLanguage } from '@/context/LanguageContext';
import { formatPrice } from '@/lib/currency';

function matchesCategory(product, selected, categories) {
  if (selected === 'all') return true;

  const node = categories.find((c) => c.slug === selected);
  if (!node) return product.category === selected;

  const children = categories.filter((c) => c.parent_id === node.id);
  const ids = [node.id, ...children.map((c) => c.id)].map(String);
  const slugs = [node.slug, ...children.map((c) => c.slug)];

  if (product.category_id != null && ids.includes(String(product.category_id))) return true;
  return slugs.includes(product.category);
}

function DealsCatalogContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { lang, t } = useLanguage();
  const { products: allProducts, loading } = useProducts({ deals: true, all: true });
  const { categories: dbCategories } = useCategories();

  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [orderProduct, setOrderProduct] = useState(null);
  const [detailProduct, setDetailProduct] = useState(null);

  const categories = dbCategories;
  const motherCategories = useMemo(
    () => categories.filter((c) => !c.parent_id),
    [categories]
  );

  const getCatDisplayName = (cat) => {
    if (!cat) return '';
    return lang === 'bn' ? (cat.name_bn || t(cat.slug) || cat.name) : cat.name;
  };

  const categoryName = (slug) => {
    const c = categories.find((item) => item.slug === slug);
    return c ? getCatDisplayName(c) : (t(slug) || slug);
  };

  useEffect(() => {
    const categoryFromUrl = searchParams.get('category');
    const searchFromUrl = searchParams.get('search');

    setSelectedCategory(categoryFromUrl || 'all');
    if (searchFromUrl) {
      setSearchQuery(searchFromUrl);
    }
  }, [searchParams]);

  const handleCategorySelect = (catId) => {
    setSelectedCategory(catId);
    const params = new URLSearchParams(searchParams.toString());
    if (catId === 'all') {
      params.delete('category');
    } else {
      params.set('category', catId);
    }
    router.push(`/deals?${params.toString()}`);
  };

  const handleSearchChange = (e) => {
    const val = e.target.value;
    setSearchQuery(val);
    const params = new URLSearchParams(searchParams.toString());
    if (val.trim()) {
      params.set('search', val.trim());
    } else {
      params.delete('search');
    }
    router.push(`/deals?${params.toString()}`);
  };

  // Products are already filtered server-side for deals=true
  const dealsProducts = allProducts;

  const filteredProducts = dealsProducts.filter((product) => {
    const matchesCat = matchesCategory(product, selectedCategory, categories);
    const query = searchQuery.toLowerCase();
    const matchesSearch =
      !query ||
      (product.name || '').toLowerCase().includes(query) ||
      (product.name_bn || '').toLowerCase().includes(query) ||
      (product.description || '').toLowerCase().includes(query) ||
      (product.description_bn || '').toLowerCase().includes(query) ||
      (product.keywords || '').toLowerCase().includes(query);
    return matchesCat && matchesSearch;
  });

  return (
    <div>
      {/* Page Title Banner */}
      <div className="bg-gradient-to-b from-amber-500/10 via-brand-card to-brand-dark py-12 border-b border-amber-500/30">
        <div className="max-w-7xl mx-auto px-4 lg:px-12 text-center">
          <div className="inline-flex items-center gap-2 bg-amber-500/20 text-amber-400 border border-amber-500/40 px-3.5 py-1 rounded-full text-xs font-bold mb-3 shadow-sm">
            <Sparkles className="w-4 h-4" />
            <span>{t('dealsAndOffers')}</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-display font-bold text-main mb-3">
            {t('dealsBannerTitle')}
          </h1>
          <p className="text-muted text-sm max-w-xl mx-auto">
            {t('dealsBannerSubtitle')}
          </p>
        </div>
      </div>

      {/* Main Catalog Content */}
      <main className="max-w-7xl mx-auto px-4 lg:px-12 py-12">
        {/* Search & Filter Header */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-8">
          {/* Search Input */}
          <div className="relative w-full md:w-80">
            <input
              type="text"
              value={searchQuery}
              onChange={handleSearchChange}
              placeholder={t('searchPlaceholder')}
              className="w-full bg-brand-card border border-brand-border rounded-full pl-4 pr-10 py-2.5 text-sm text-main placeholder:text-subtle focus:outline-none focus:border-amber-400 transition-all"
            />
            <Search className="w-4 h-4 absolute right-4 top-1/2 -translate-y-1/2 text-muted" />
          </div>

          {/* Category Filter Tabs */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => handleCategorySelect('all')}
              className={
                selectedCategory === 'all'
                  ? 'bg-amber-400 text-brand-dark px-4 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer'
                  : 'bg-brand-card text-muted hover:text-main px-4 py-1.5 rounded-full text-xs font-bold border border-brand-border transition-all cursor-pointer'
              }
            >
              {t('allProducts')}
            </button>
            {motherCategories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => handleCategorySelect(cat.slug)}
                className={
                  selectedCategory === cat.slug
                    ? 'bg-amber-400 text-brand-dark px-4 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer'
                    : 'bg-brand-card text-muted hover:text-main px-4 py-1.5 rounded-full text-xs font-bold border border-brand-border transition-all cursor-pointer'
                }
              >
                {getCatDisplayName(cat)}
              </button>
            ))}
          </div>
        </div>

        {/* Results count */}
        <div className="flex items-center gap-2 mb-6">
          <span className="inline-flex items-center gap-1.5 bg-brand-card border border-amber-500/40 rounded-full px-3.5 py-1.5 text-xs font-bold text-main">
            <Tag className="w-3.5 h-3.5 text-amber-400" />
            {filteredProducts.length} {t('products')}
          </span>
        </div>

        {/* Products Grid */}
        {loading ? (
          <div className="text-center py-16 text-subtle">
            <p className="text-base font-semibold">{t('loadingProducts')}</p>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-16 text-subtle bg-brand-card/50 border border-brand-border/60 rounded-3xl p-12">
            <PackageOpen className="text-4xl mb-3 text-amber-500/50 block mx-auto" />
            <p className="text-base font-semibold text-main mb-1">{t('noDealsFound')}</p>
            <p className="text-xs text-muted">Browse our full catalog to explore all aquatic products.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {filteredProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onSelect={(p) => setDetailProduct(p)}
                onOrder={(p) => setOrderProduct(p)}
                categoryName={categoryName}
                accentColor="amber"
              />
            ))}
          </div>
        )}

        {/* Order Modal */}
        <OrderModal
          product={orderProduct}
          onClose={() => setOrderProduct(null)}
        />

        {/* Product Big View Modal */}
        <ProductModal
          product={detailProduct}
          onClose={() => setDetailProduct(null)}
        />
      </main>
    </div>
  );
}

export default function DealsPage() {
  return (
    <Suspense fallback={<div className="py-20 text-center text-muted">Loading deals & offers...</div>}>
      <DealsCatalogContent />
    </Suspense>
  );
}
