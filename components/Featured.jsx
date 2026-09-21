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
        {featuredProducts.map((product) => {
          const prodName = lang === 'bn' ? (product.name_bn || product.name) : product.name;
          const prodQty = lang === 'bn' ? (product.quantity_bn || product.quantity) : product.quantity;
          const prodDesc = lang === 'bn' ? (product.description_bn || product.description) : product.description;

          return (
            <div
              key={product.id}
              onClick={() => setDetailProduct(product)}
              className="group bg-brand-card border border-brand-border rounded-2xl overflow-hidden hover:border-brand-cyan/50 transition-all duration-300 flex flex-col justify-between hover:-translate-y-2 shadow-lg hover:shadow-xl hover:shadow-brand-cyan/5 cursor-pointer"
            >
              <div className="relative h-52 overflow-hidden bg-brand-dark">
                <img
                  src={product.image}
                  alt={prodName}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
                />
                <span className="absolute top-3 right-3 bg-black/60 backdrop-blur-sm text-brand-cyan border border-brand-cyan/40 text-[10px] uppercase font-bold px-2.5 py-1 rounded-full">
                  {t(product.category) || product.category}
                </span>
                <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-black/50 to-transparent pointer-events-none" />
              </div>

              <div className="p-5 flex-1 flex flex-col justify-between bg-brand-dark/80">
                <div>
                  <h3 className="font-bold text-base text-main mb-1 group-hover:text-brand-cyan transition-colors line-clamp-1">
                    {prodName} {prodQty && <span className="text-xs text-muted font-normal">({prodQty})</span>}
                  </h3>
                  <FormattedText text={prodDesc} clamp="line-clamp-2" className="text-xs text-muted mb-4" />
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-brand-border/50">
                  <span className="text-lg font-bold text-brand-cyan">
                    {formatPrice(product.price)}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-brand-cyan group-hover:translate-x-1 transition-transform duration-300">
                      <ArrowRight className="w-4 h-4" />
                    </span>
                    <button
                      onClick={(e) => { e.stopPropagation(); setSelectedProduct(product); }}
                      className="bg-brand-cyan text-brand-dark hover:bg-white border border-brand-cyan px-4 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-md"
                    >
                      <ShoppingBag className="w-3.5 h-3.5" /> {t('orderNow')}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
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
