'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useProducts } from '@/hooks/useProducts';
import { ArrowRight, ShoppingBag } from 'lucide-react';
import OrderModal from '@/components/OrderModal';
import ProductModal from '@/components/ProductModal';
import FormattedText from '@/components/FormattedText';
import { useLanguage } from '@/context/LanguageContext';
import { formatPrice } from '@/lib/currency';

import ProductCard from '@/components/ProductCard';

export default function Featured() {
  const { lang, t } = useLanguage();
  const { products } = useProducts();
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [detailProduct, setDetailProduct] = useState(null);

  const hasFeatured = products.some((p) => p.featured);
  const featuredProducts = (hasFeatured ? products.filter((p) => p.featured) : products).slice(0, 4);

  return (
    <section className="max-w-7xl mx-auto px-4 lg:px-12 py-12">
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-10">
        <div>
          <span className="text-brand-cyan text-xs font-bold uppercase tracking-wider block mb-2">
            {t('handpickedSelections')}
          </span>
          <h2 className="text-3xl md:text-4xl font-display font-bold text-main">
            {t('featuredProducts')}
          </h2>
        </div>
        <Link
          href="/products"
          className="mt-4 md:mt-0 text-brand-cyan font-semibold text-sm hover:underline flex items-center gap-1.5"
        >
          {t('exploreAllProducts')} <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {featuredProducts.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            onSelect={(p) => setDetailProduct(p)}
            onOrder={(p) => setSelectedProduct(p)}
            accentColor="cyan"
          />
        ))}
      </div>

      <OrderModal
        product={selectedProduct}
        onClose={() => setSelectedProduct(null)}
      />

      <ProductModal
        product={detailProduct}
        onClose={() => setDetailProduct(null)}
      />
    </section>
  );
}
