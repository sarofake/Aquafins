'use client';

import Link from 'next/link';
import { ShoppingBag, Tag } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { useCurrency } from '@/hooks/useSiteInfo';
import { productHref } from '@/lib/slugify';
import FormattedText from '@/components/FormattedText';

export default function ProductCard({
  product,
  onSelect,
  onOrder,
  categoryName,
  accentColor = 'cyan',
}) {
  const { lang, t } = useLanguage();
  const { format: formatPrice } = useCurrency();

  if (!product) return null;

  const prodName = lang === 'bn' ? (product.name_bn || product.name) : product.name;
  const prodQty = lang === 'bn' ? (product.quantity_bn || product.quantity) : product.quantity;
  const prodDesc = lang === 'bn' ? (product.description_bn || product.description) : product.description;

  const numPrice = Number(product.price);
  const numOrigPrice = product.original_price ? Number(product.original_price) : null;
  const hasOriginalPrice = numOrigPrice !== null && !isNaN(numOrigPrice) && numOrigPrice > numPrice;

  const discountPercent = hasOriginalPrice
    ? Math.round(((numOrigPrice - numPrice) / numOrigPrice) * 100)
    : null;

  const isAvailable = product.available !== false;

  const categoryLabel = categoryName
    ? typeof categoryName === 'function'
      ? categoryName(product.category)
      : categoryName
    : (t(product.category) || product.category);

  const isAmber = accentColor === 'amber';
  const textAccent = isAmber ? 'text-amber-400' : 'text-brand-cyan';
  const bgAccent = isAmber ? 'bg-amber-400' : 'bg-brand-cyan';
  const borderAccent = isAmber ? 'border-amber-400/40' : 'border-brand-cyan/40';
  const hoverBorder = isAmber ? 'hover:border-amber-400' : 'hover:border-brand-cyan/60';

  // Every product links to /products/<category>/<slug>; pre-migration
  // products without a slug keep the legacy modal via onSelect.
  const href = productHref(product);

  const cardClass = `group bg-brand-card border border-brand-border ${hoverBorder} rounded-2xl overflow-hidden transition-all duration-300 flex flex-col justify-between hover:-translate-y-1 shadow-lg hover:shadow-xl cursor-pointer`;

  const content = (
    <>
      {/* Product Image & Badges */}
      <div className="relative h-48 sm:h-52 overflow-hidden bg-brand-dark">
        <img
          src={product.image || 'https://placehold.co/400x300?text=No+Image'}
          alt={prodName}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
        />

          {/* Top-Left Badges: Deals & Discount */}
        <div className="absolute top-3 left-3 flex flex-wrap gap-1.5 z-10">
          {product.deals && (
            <span className="bg-amber-400 text-slate-950 text-[10px] font-black px-2 py-0.5 rounded-full shadow flex items-center gap-1">
              <Tag className="w-3 h-3 fill-slate-950" /> DEAL
            </span>
          )}
          {hasOriginalPrice && discountPercent > 0 && (
            <span className="bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow">
              {discountPercent}% {t('discountOff')}
            </span>
          )}
        </div>

        {/* Top-Right Badge: Category */}
        {categoryLabel && (
          <span className={`absolute top-3 right-3 bg-black/60 backdrop-blur-sm ${textAccent} border ${borderAccent} text-[10px] uppercase font-bold px-2.5 py-1 rounded-full z-10`}>
            {categoryLabel}
          </span>
        )}

        <div className="absolute bottom-0 left-0 right-0 h-14 bg-gradient-to-t from-black/60 to-transparent pointer-events-none" />
      </div>

      {/* Product Info */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between bg-brand-dark/40">
        <div>
          {/* Title */}
          <h3 className={`font-bold text-base text-main mb-1.5 group-hover:${textAccent} transition-colors line-clamp-1`}>
            {prodName}
            {prodQty ? <span className="font-medium text-muted text-xs"> ({prodQty})</span> : null}
          </h3>

          {/* Out of Stock Badge (only when unavailable) */}
          {!isAvailable && (
            <div className="flex items-center gap-2 mb-2.5">
              <span className="inline-flex items-center gap-1.5 font-bold text-[10px] px-2 py-0.5 rounded-full bg-red-500/10 text-red-400 border border-red-500/30">
                <span className="w-1.5 h-1.5 rounded-full bg-red-400" />
                {t('outOfStock')}
              </span>
            </div>
          )}

          {/* Description */}
          <FormattedText text={prodDesc} clamp="line-clamp-2" className="text-xs text-muted mb-4 leading-relaxed" />
        </div>

        {/* Price & Action Button Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-brand-border/50 gap-2">
          {/* Prices */}
          <div className="flex flex-col">
            <div className="flex items-baseline gap-1.5 flex-wrap">
              {/* Discount / Current Selling Price */}
              <span className={`text-lg font-extrabold ${textAccent}`}>
                {formatPrice(numPrice)}
              </span>
              {/* Original Price (Strikethrough) */}
              {hasOriginalPrice && (
                <span className="text-xs text-subtle line-through">
                  {formatPrice(numOrigPrice)}
                </span>
              )}
            </div>
          </div>

          {/* Order Action Button */}
          {isAvailable ? (
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                if (onOrder) onOrder(product);
              }}
              className={`${bgAccent} text-slate-950 hover:bg-white hover:text-black border ${borderAccent} px-3.5 py-1.5 rounded-full text-xs font-extrabold transition-all flex items-center gap-1.5 cursor-pointer shadow-md shrink-0 active:scale-95`}
            >
              <ShoppingBag className="w-3.5 h-3.5" /> {t('orderNow')}
            </button>
          ) : (
            <button
              disabled
              className="bg-brand-border/40 text-subtle border border-brand-border px-3 py-1.5 rounded-full text-xs font-semibold opacity-60 cursor-not-allowed shrink-0"
            >
              {t('outOfStock')}
            </button>
          )}
        </div>
      </div>
    </>
  );

  if (href) {
    return (
      <Link href={href} className={cardClass} aria-label={prodName}>
        {content}
      </Link>
    );
  }

  return (
    <div
      onClick={() => onSelect && onSelect(product)}
      className={cardClass}
    >
      {content}
    </div>
  );
}
