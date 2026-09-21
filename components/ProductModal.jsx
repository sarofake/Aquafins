'use client';

import { useEffect, useState } from 'react';
import {
  X,
  ChevronLeft,
  ChevronRight,
  ShoppingBag,
  Tag,
  Phone,
} from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { formatPrice } from '@/lib/currency';
import FormattedText from '@/components/FormattedText';
import OrderModal from '@/components/OrderModal';

export default function ProductModal({ product, onClose }) {
  const { lang, t } = useLanguage();
  const [activeIndex, setActiveIndex] = useState(0);
  const [orderOpen, setOrderOpen] = useState(false);

  const rawImages =
    Array.isArray(product?.images) && product.images.length > 0
      ? product.images.map((img) => (typeof img === 'string' ? img : img?.url)).filter(Boolean)
      : product?.image
      ? [product.image]
      : [];
  const images = rawImages.length > 0 ? rawImages : [];

  useEffect(() => {
    if (!product) return;
    setActiveIndex(0);
    setOrderOpen(false);

    const handleKey = (e) => {
      if (e.key === 'Escape') onClose();
    };
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleKey);

    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener('keydown', handleKey);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [product?.id]);

  if (!product) return null;

  const prodName = lang === 'bn' ? (product.name_bn || product.name) : product.name;
  const prodQty = lang === 'bn' ? (product.quantity_bn || product.quantity) : product.quantity;
  const prodDesc = lang === 'bn' ? (product.description_bn || product.description) : product.description;
  const discount =
    product.original_price && product.original_price > product.price
      ? Math.round(((product.original_price - product.price) / product.original_price) * 100)
      : null;

  const prevImage = () => setActiveIndex((i) => (i - 1 + images.length) % images.length);
  const nextImage = () => setActiveIndex((i) => (i + 1) % images.length);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-5xl max-h-[92vh] overflow-y-auto bg-brand-card border border-brand-border rounded-3xl shadow-2xl"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label={prodName}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="sticky top-4 float-right z-10 mr-4 mt-4 p-2 text-muted hover:text-main bg-brand-dark rounded-full border border-brand-border hover:border-brand-cyan/50 transition-all cursor-pointer shadow"
          aria-label="Close product view"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-0 md:gap-2 p-4 sm:p-6">
          {/* ==================== Image Gallery ==================== */}
          <div className="flex flex-col">
            <div className="relative h-64 sm:h-80 rounded-2xl overflow-hidden bg-brand-dark/50 border border-brand-border">
              {images.length > 0 ? (
                <img
                  src={images[activeIndex]}
                  alt={prodName}
                  className="w-full h-full object-contain p-3"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-subtle text-sm">
                  {t('noImage')}
                </div>
              )}

              {/* Discount & badge overlays */}
              <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
                {product.deals && (
                  <span className="bg-amber-400 text-brand-dark text-[10px] font-bold px-2 py-0.5 rounded-full shadow flex items-center gap-1">
                    <Tag className="w-3 h-3 fill-brand-dark" /> DEAL
                  </span>
                )}
                {discount && (
                  <span className="bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow">
                    {discount}% OFF
                  </span>
                )}
              </div>

              {images.length > 1 && (
                <>
                  <button
                    onClick={prevImage}
                    className="absolute left-2 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/50 hover:bg-black/70 text-white flex items-center justify-center transition-colors cursor-pointer border border-white/20"
                    aria-label="Previous image"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button
                    onClick={nextImage}
                    className="absolute right-2 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/50 hover:bg-black/70 text-white flex items-center justify-center transition-colors cursor-pointer border border-white/20"
                    aria-label="Next image"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                  <span className="absolute bottom-2 right-3 bg-black/60 backdrop-blur-sm text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                    {activeIndex + 1} / {images.length}
                  </span>
                </>
              )}
            </div>

            {/* Thumbnails */}
            {images.length > 1 && (
              <div className="flex gap-2 mt-3 overflow-x-auto pb-1">
                {images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveIndex(idx)}
                    className={`w-16 h-16 shrink-0 rounded-lg overflow-hidden border-2 transition-all cursor-pointer ${
                      idx === activeIndex
                        ? 'border-brand-cyan'
                        : 'border-transparent opacity-70 hover:opacity-100'
                    }`}
                    aria-label={`Image ${idx + 1}`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* ==================== Product Info ==================== */}
          <div className="flex flex-col">
            <div className="flex flex-wrap items-center gap-1.5 mt-4 md:mt-0">
              <span className="bg-brand-dark border border-brand-border text-brand-cyan text-[10px] uppercase font-bold px-2.5 py-1 rounded-full">
                {t('category')}: {product.category}
              </span>
              {product.featured && (
                <span className="bg-brand-cyan/15 text-brand-cyan border border-brand-cyan/40 text-[10px] font-bold px-2.5 py-1 rounded-full">
                  {t('featuredProducts')}
                </span>
              )}
            </div>

            <h2 className="font-display font-bold text-2xl sm:text-3xl text-main mt-3 leading-tight">
              {prodName} {prodQty && <span className="text-base text-muted font-normal">({prodQty})</span>}
            </h2>

            <div className="flex flex-wrap items-baseline gap-2.5 mt-4">
              <span className="text-3xl font-extrabold text-brand-cyan">
                {formatPrice(product.price)}
              </span>
              {product.original_price && (
                <span className="text-sm text-subtle line-through">
                  {formatPrice(product.original_price)}
                </span>
              )}
              {discount && (
                <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                  {discount}% {t('discountOff')}
                </span>
              )}
            </div>

            <div className="my-5 h-px bg-brand-border/60" />

            <div className="flex-grow">
              <span className="text-brand-cyan text-xs font-bold uppercase tracking-wider block mb-2">
                {t('productDetails')}
              </span>
              <div className="bg-brand-dark/50 border border-brand-border/60 rounded-2xl p-4 text-sm text-muted">
                {prodDesc ? (
                  <FormattedText text={prodDesc} />
                ) : (
                  <p className="text-subtle">{t('noDescription')}</p>
                )}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 mt-6">
              <button
                onClick={() => setOrderOpen(true)}
                className="flex-1 bg-brand-cyan text-brand-dark hover:bg-white border border-brand-cyan px-6 py-3.5 rounded-full text-sm font-bold transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg"
              >
                <ShoppingBag className="w-4 h-4" /> {t('orderNow')}
              </button>
              <a
                href="tel:01787283804"
                className="flex-1 bg-brand-dark hover:bg-brand-border text-main border border-brand-border px-6 py-3.5 rounded-full text-sm font-bold transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Phone className="w-4 h-4 text-brand-cyan" /> 01787-283804
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Nested Order Modal */}
      {orderOpen && <OrderModal product={product} onClose={() => setOrderOpen(false)} />}
    </div>
  );
}