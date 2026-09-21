'use client';

import { useState, useEffect, useMemo, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useProducts } from '@/hooks/useProducts';
import { useCategories } from '@/hooks/useCategories';
import { Search, PackageOpen, ShoppingBag } from 'lucide-react';
import OrderModal from '@/components/OrderModal';
import ProductModal from '@/components/ProductModal';
import FormattedText from '@/components/FormattedText';
import { useLanguage } from '@/context/LanguageContext';
import { formatPrice } from '@/lib/currency';

const DEFAULT_CATEGORIES = [
  { id: 'plants', slug: 'plants', name: 'Plants', parent_id: null },
  { id: 'fish', slug: 'fish', name: 'Fish', parent_id: null },
  { id: 'livestock', slug: 'livestock', name: 'Livestock', parent_id: null },
  { id: 'food-accessories', slug: 'food-accessories', name: 'Food & Accessories', parent_id: null },
  { id: 'scaping', slug: 'scaping', name: 'Scaping', parent_id: null },
];

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

function ProductsCatalogContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { lang, t } = useLanguage();
  const { products: productsData, loading } = useProducts();
  const { categories: dbCategories } = useCategories();

  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [orderProduct, setOrderProduct] = useState(null);
  const [detailProduct, setDetailProduct] = useState(null);

  const categories = dbCategories.length > 0 ? dbCategories : DEFAULT_CATEGORIES;
  const motherCategories = useMemo(
    () => categories.filter((c) => !c.parent_id),
    [categories]
  );

  const selectedCat = categories.find((c) => c.slug === selectedCategory);
  const selectedMotherId = selectedCat?.parent_id ?? selectedCat?.id ?? null;
  const subCategories = selectedMotherId
    ? categories.filter((c) => c.parent_id === selectedMotherId)
    : [];

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
    router.push(`/products?${params.toString()}`);
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
    router.push(`/products?${params.toString()}`);
  };

  const filteredProducts = productsData.filter((product) => {
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
      <div className="bg-gradient-to-b from-brand-card to-brand-dark py-12 border-b border-brand-border/40">
        <div className="max-w-7xl mx-auto px-4 lg:px-12 text-center">
          <h1 className="text-4xl md:text-5xl font-display font-bold text-main mb-3">
            {t('aquaticProductsBannerTitle')}
          </h1>
          <p className="text-muted text-sm max-w-xl mx-auto">
            {t('aquaticProductsBannerSubtitle')}
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
              className="w-full bg-brand-card border border-brand-border rounded-full pl-4 pr-10 py-2.5 text-sm text-main placeholder:text-subtle focus:outline-none focus:border-brand-cyan transition-all"
            />
            <Search className="w-4 h-4 absolute right-4 top-1/2 -translate-y-1/2 text-muted" />
          </div>

          {/* Category Filter Tabs */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => handleCategorySelect('all')}
              className={
                selectedCategory === 'all'
                  ? 'bg-brand-cyan text-brand-dark px-4 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer'
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
                    ? 'bg-brand-cyan text-brand-dark px-4 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer'
                    : 'bg-brand-card text-muted hover:text-main px-4 py-1.5 rounded-full text-xs font-bold border border-brand-border transition-all cursor-pointer'
                }
              >
                {getCatDisplayName(cat)}
              </button>
            ))}
          </div>
        </div>

        {/* Sub-Category Filter Tabs (shown when a mother category is active) */}
        {subCategories.length > 0 && (
          <div className="flex flex-wrap items-center gap-2 mb-8">
            {subCategories.map((sub) => (
              <button
                key={sub.id}
                onClick={() => handleCategorySelect(sub.slug)}
                className={
                  selectedCategory === sub.slug
                    ? 'bg-brand-cyan/20 text-brand-cyan border border-brand-cyan px-3.5 py-1 rounded-full text-xs font-bold transition-all cursor-pointer'
                    : 'bg-brand-card text-muted hover:text-main px-3.5 py-1 rounded-full text-xs font-semibold border border-brand-border transition-all cursor-pointer'
                }
              >
                {getCatDisplayName(sub)}
              </button>
            ))}
          </div>
        )}

        {/* Products Grid */}
        {loading ? (
          <div className="text-center py-16 text-subtle">
            <p className="text-base font-semibold">{t('loadingProducts')}</p>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-16 text-subtle">
            <PackageOpen className="text-4xl mb-3 text-brand-border block mx-auto" />
            <p className="text-base font-semibold">{t('noProductsFound')}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {filteredProducts.map((product) => {
              const discount =
                product.original_price && product.original_price > product.price
                  ? Math.round(((product.original_price - product.price) / product.original_price) * 100)
                  : null;
              const prodName = lang === 'bn' ? (product.name_bn || product.name) : product.name;
              const prodQty = lang === 'bn' ? (product.quantity_bn || product.quantity) : product.quantity;
              const prodDesc = lang === 'bn' ? (product.description_bn || product.description) : product.description;

              return (
                <div
                  key={product.id}
                  onClick={() => setDetailProduct(product)}
                  className="group bg-brand-card border border-brand-border rounded-2xl overflow-hidden hover:border-brand-cyan/60 transition-all flex flex-col justify-between hover:-translate-y-1 cursor-pointer"
                >
                  <div className="relative h-48 overflow-hidden bg-brand-dark">
                    <img
                      src={product.image}
                      alt={prodName}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    {discount && (
                      <span className="absolute top-3 left-3 bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow">
                        {discount}% OFF
                      </span>
                    )}
                    <span className="absolute top-3 right-3 bg-black/60 backdrop-blur-sm text-brand-cyan border border-brand-cyan/40 text-[10px] uppercase font-bold px-2.5 py-1 rounded-full">
                      {categoryName(product.category)}
                    </span>
                  </div>

                  <div className="p-5 flex-1 flex flex-col justify-between">
                    <div>
                      <h3 className="font-bold text-base text-main mb-1 group-hover:text-brand-cyan transition-colors line-clamp-1">
                        {prodName} {prodQty && <span className="text-xs text-muted font-normal">({prodQty})</span>}
                      </h3>
                      <FormattedText text={prodDesc} clamp="line-clamp-2" className="text-xs text-muted mb-4" />
                    </div>

                    <div className="flex items-center justify-between pt-3 border-t border-brand-border/50">
                      <div className="flex items-baseline gap-2">
                        <span className="text-lg font-bold text-brand-cyan">
                          {formatPrice(product.price)}
                        </span>
                        {product.original_price && (
                          <span className="text-xs text-subtle line-through">
                            {formatPrice(product.original_price)}
                          </span>
                        )}
                      </div>
                      <button
                        onClick={(e) => { e.stopPropagation(); setOrderProduct(product); }}
                        className="bg-brand-cyan text-brand-dark hover:bg-white border border-brand-cyan px-4 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-md"
                      >
                        <ShoppingBag className="w-3.5 h-3.5" /> {t('orderNow')}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
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

export default function ProductsPage() {
  return (
    <Suspense fallback={<div className="py-20 text-center text-muted">Loading catalog...</div>}>
      <ProductsCatalogContent />
    </Suspense>
  );
}
