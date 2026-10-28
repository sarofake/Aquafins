'use client';

import { useEffect, useState } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  ShoppingBag,
  Tag,
  Phone,
  XCircle,
  Play,
  Share2,
  Check,
} from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { useCategories } from '@/hooks/useCategories';
import { useBrand } from '@/hooks/useSiteInfo';
import { formatPrice } from '@/lib/currency';
import { productHref } from '@/lib/slugify';
import FormattedText from '@/components/FormattedText';
import OrderModal from '@/components/OrderModal';
import { extractYouTubeId, getYouTubeThumbnailUrl, getYouTubeEmbedUrl } from '@/lib/youtube';

/**
 * Full product detail body (gallery, price, description, keywords, actions).
 * Shared by the ProductModal overlay and the /products/<category>/<slug> page.
 */
export default function ProductDetail({ product }) {
  const { lang, t } = useLanguage();
  const { categories } = useCategories();
  const brand = useBrand();
  const [activeIndex, setActiveIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [orderOpen, setOrderOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleShare = async () => {
    if (!product) return;
    const relHref = productHref(product);
    const fullUrl =
      typeof window !== 'undefined'
        ? window.location.origin + (relHref || window.location.pathname)
        : '';

    if (!fullUrl) return;

    if (navigator.share && /mobile|android|iphone|ipad/i.test(navigator.userAgent)) {
      try {
        await navigator.share({
          title: lang === 'bn' ? product.name_bn || product.name : product.name,
          text: `Check out ${product.name} on ${brand.name}`,
          url: fullUrl,
        });
        return;
      } catch (e) {
        // User cancelled or fallback to clipboard
      }
    }

    try {
      await navigator.clipboard.writeText(fullUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch (err) {
      const input = document.createElement('input');
      input.value = fullUrl;
      document.body.appendChild(input);
      input.select();
      document.execCommand('copy');
      document.body.removeChild(input);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const rawMedia =
    Array.isArray(product?.images) && product.images.length > 0
      ? product.images
          .map((item) => {
            if (!item) return null;
            if (typeof item === 'string') {
              const ytId = extractYouTubeId(item);
              if (ytId) {
                return {
                  type: 'video',
                  url: item,
                  youtube_id: ytId,
                  thumbnail_url: getYouTubeThumbnailUrl(ytId),
                  is_default: false,
                };
              }
              return { type: 'image', url: item, is_default: false };
            }
            const ytId = extractYouTubeId(item?.url || item?.youtube_id || item?.video_url);
            if (item?.type === 'video' || ytId) {
              const videoId = ytId || item?.youtube_id;
                return {
                type: 'video',
                url: item?.url || (videoId ? `https://www.youtube.com/watch?v=${videoId}` : ''),
                youtube_id: videoId,
                thumbnail_url: item?.thumbnail_url || (videoId ? getYouTubeThumbnailUrl(videoId) : ''),
                is_default: Boolean(item?.is_default),
              };
            }
            return {
              type: 'image',
              url: item?.url || '',
              is_default: Boolean(item?.is_default),
            };
          })
          .filter((m) => m && (m.url || m.youtube_id))
      : product?.image
      ? [{ type: 'image', url: product.image, is_default: true }]
      : [];

  const mediaList = rawMedia.length > 0 ? rawMedia : [];

  useEffect(() => {
    if (!product) return;
    const defaultIdx = mediaList.findIndex((m) => m.is_default);
    setActiveIndex(defaultIdx >= 0 ? defaultIdx : 0);
    setOrderOpen(false);
    setPlaying(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [product?.id]);

  // Stop video playback whenever the active media changes
  useEffect(() => {
    setPlaying(false);
  }, [activeIndex, product?.id]);

  if (!product) return null;

  const prodName = lang === 'bn' ? (product.name_bn || product.name) : product.name;
  const prodQty = lang === 'bn' ? (product.quantity_bn || product.quantity) : product.quantity;
  const prodDesc = lang === 'bn' ? (product.description_bn || product.description) : product.description;
  const discount =
    product.original_price && product.original_price > product.price
      ? Math.round(((product.original_price - product.price) / product.original_price) * 100)
      : null;

  const prevMedia = () => setActiveIndex((i) => (i - 1 + mediaList.length) % mediaList.length);
  const nextMedia = () => setActiveIndex((i) => (i + 1) % mediaList.length);

  const activeMedia = mediaList[activeIndex];

  const getCategoryDisplay = () => {
    if (!product.category) return '';
    const cat = categories.find(
      (c) => c.slug === product.category || String(c.id) === String(product.category_id)
    );
    if (!cat) return product.category;
    if (cat.parent_id) {
      const mother = categories.find((c) => c.id === cat.parent_id);
      return mother
        ? `${lang === 'bn' ? (mother.name_bn || mother.name) : mother.name} / ${lang === 'bn' ? (cat.name_bn || cat.name) : cat.name}`
        : lang === 'bn' ? (cat.name_bn || cat.name) : cat.name;
    }
    return lang === 'bn' ? (cat.name_bn || cat.name) : cat.name;
  };

  return (
    <>
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 p-2 sm:p-4">
        {/* ==================== Media Gallery ==================== */}
        <div className="lg:col-span-6 flex flex-col">
          <div className="relative h-80 sm:h-[420px] rounded-2xl overflow-hidden bg-brand-dark/80 dark:bg-slate-950/80 border border-brand-border shadow-inner flex items-center justify-center p-3 sm:p-5 backdrop-blur-sm">
            {mediaList.length > 0 && activeMedia ? (
              activeMedia.type === 'video' && activeMedia.youtube_id ? (
                playing ? (
                  <iframe
                    src={getYouTubeEmbedUrl(activeMedia.youtube_id, true)}
                    title={prodName}
                    className="absolute inset-0 w-full h-full border-0 rounded-2xl"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                  />
                ) : (
                  <div className="relative w-full h-full flex items-center justify-center">
                    <img
                      src={
                        activeMedia.thumbnail_url ||
                        getYouTubeThumbnailUrl(activeMedia.youtube_id) ||
                        activeMedia.url
                      }
                      alt={prodName}
                      className="w-full h-full object-contain p-2 drop-shadow-lg"
                      onError={(e) => {
                        const fb = getYouTubeThumbnailUrl(activeMedia.youtube_id, 'mqdefault');
                        if (fb && e.currentTarget.src !== fb) e.currentTarget.src = fb;
                      }}
                    />
                    <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-[2px] rounded-2xl">
                      <button
                        onClick={() => setPlaying(true)}
                        className="w-16 h-16 rounded-full bg-red-600 hover:bg-red-500 text-white flex items-center justify-center shadow-xl hover:scale-110 active:scale-95 transition-all cursor-pointer"
                        aria-label="Play YouTube video"
                      >
                        <Play className="w-8 h-8 fill-white ml-1" />
                      </button>
                    </div>
                  </div>
                )
              ) : (
                <img
                  src={activeMedia.url || activeMedia.thumbnail_url}
                  alt={prodName}
                  className="w-full h-full object-contain p-2 drop-shadow-xl hover:scale-105 transition-transform duration-300 ease-out"
                />
              )
            ) : (
              <div className="w-full h-full flex items-center justify-center text-subtle text-sm font-semibold">
                {t('noImage')}
              </div>
            )}

            {/* Discount & badge overlays */}
            <div className="absolute top-4 left-4 flex flex-wrap gap-2 z-10 pointer-events-none">
              {product.deals && (
                <span className="bg-amber-400 text-slate-950 text-xs font-black px-2.5 py-1 rounded-full shadow-lg flex items-center gap-1">
                  <Tag className="w-3.5 h-3.5 fill-slate-950" /> DEAL
                </span>
              )}
              {discount && (
                <span className="bg-rose-600 text-white text-xs font-black px-2.5 py-1 rounded-full shadow-lg">
                  {discount}% OFF
                </span>
              )}
              {product.featured && (
                <span className="bg-brand-cyan text-slate-950 text-xs font-black px-2.5 py-1 rounded-full shadow-lg">
                  {t('featuredProducts')}
                </span>
              )}
            </div>

            {mediaList.length > 1 && (
              <>
                <button
                  onClick={prevMedia}
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/70 hover:bg-black/90 text-white flex items-center justify-center transition-all cursor-pointer border border-white/20 z-10 shadow-lg hover:scale-105 active:scale-95 backdrop-blur-md"
                  aria-label="Previous media"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
                <button
                  onClick={nextMedia}
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/70 hover:bg-black/90 text-white flex items-center justify-center transition-all cursor-pointer border border-white/20 z-10 shadow-lg hover:scale-105 active:scale-95 backdrop-blur-md"
                  aria-label="Next media"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>
                <span className="absolute bottom-3 right-4 bg-black/70 backdrop-blur-md text-white text-xs font-extrabold px-3 py-1 rounded-full z-10 border border-white/10 shadow-md">
                  {activeIndex + 1} / {mediaList.length}
                </span>
              </>
            )}
          </div>

          {/* Thumbnails */}
          {mediaList.length > 1 && (
            <div className="flex gap-2.5 mt-4 overflow-x-auto pb-1 scrollbar-none">
              {mediaList.map((item, idx) => {
                const thumb =
                  item.type === 'video'
                    ? item.thumbnail_url || (item.youtube_id ? getYouTubeThumbnailUrl(item.youtube_id) : '')
                    : item.url;
                return (
                  <button
                    key={idx}
                    onClick={() => setActiveIndex(idx)}
                    className={`relative w-16 h-16 sm:w-20 sm:h-20 shrink-0 rounded-xl overflow-hidden border-2 transition-all cursor-pointer ${
                      idx === activeIndex
                        ? 'border-brand-cyan ring-2 ring-brand-cyan/40 scale-105 shadow-md'
                        : 'border-brand-border/60 opacity-60 hover:opacity-100 hover:scale-102'
                    }`}
                    aria-label={`Media ${idx + 1}`}
                  >
                    <img
                      src={thumb || 'https://placehold.co/400x300?text=No+Image'}
                      alt=""
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        const fb = 'https://placehold.co/400x300?text=No+Image';
                        if (e.currentTarget.src !== fb) e.currentTarget.src = fb;
                      }}
                    />
                    {item.type === 'video' && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                        <div className="w-7 h-7 rounded-full bg-red-600 text-white flex items-center justify-center shadow">
                          <Play className="w-3.5 h-3.5 fill-white ml-0.5" />
                        </div>
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* ==================== Product Info ==================== */}
        <div className="lg:col-span-6 flex flex-col justify-between">
          <div>
            {/* Category Pill */}
            {getCategoryDisplay() && (
              <span className="inline-flex items-center gap-1.5 bg-brand-cyan/15 text-brand-cyan border border-brand-cyan/30 text-xs font-extrabold uppercase tracking-wider px-3.5 py-1 rounded-full self-start mb-3 shadow-sm">
                {getCategoryDisplay()}
              </span>
            )}

            {/* Name */}
            <h1 className="font-display font-bold text-3xl sm:text-4xl text-main tracking-tight leading-tight mt-1 mb-2">
              {prodName}
              {prodQty ? (
                <span className="font-sans font-semibold text-muted text-base sm:text-lg ml-2 inline-block bg-brand-dark/60 border border-brand-border/60 px-2.5 py-0.5 rounded-lg">
                  ({prodQty})
                </span>
              ) : null}
            </h1>

            {/* Stock Status Badge */}
            <div className="my-2">
              {product.available !== false ? (
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/15 text-emerald-500 border border-emerald-500/30 shadow-sm">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span>{lang === 'bn' ? 'স্টকে আছে' : 'In Stock'}</span>
                </div>
              ) : (
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-500/15 text-rose-500 border border-rose-500/30 shadow-sm">
                  <XCircle className="w-3.5 h-3.5 text-rose-500" />
                  <span>{lang === 'bn' ? 'স্টকে নেই' : 'Out of Stock'}</span>
                </div>
              )}
            </div>

            {/* Price Block */}
            <div className="flex flex-wrap items-baseline gap-3 my-4">
              <span className="text-3xl sm:text-4xl font-black text-brand-cyan tracking-tight">
                {formatPrice(product.price)}
              </span>
              {product.original_price && (
                <span className="text-base text-subtle/80 line-through font-medium">
                  {formatPrice(product.original_price)}
                </span>
              )}
              {discount && (
                <span className="bg-rose-600 text-white text-xs font-extrabold px-2.5 py-1 rounded-full shadow-sm">
                  {discount}% {t('discountOff')}
                </span>
              )}
            </div>

            <div className="my-4 h-px bg-gradient-to-r from-brand-border via-brand-border/60 to-transparent" />

            {/* Description */}
            <div className="mt-4">
              <span className="text-brand-cyan text-xs font-extrabold uppercase tracking-wider block mb-2">
                {t('productDetails')}
              </span>
              <div className="bg-brand-dark/60 dark:bg-black/30 border border-brand-border rounded-2xl p-4 sm:p-5 text-sm sm:text-base text-main leading-relaxed max-h-60 overflow-y-auto shadow-inner">
                {prodDesc ? (
                  <FormattedText text={prodDesc} />
                ) : (
                  <p className="text-subtle font-medium">{t('noDescription')}</p>
                )}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 sm:gap-3 mt-6">
            <button
              onClick={() => setOrderOpen(true)}
              disabled={product.available === false}
              className="flex-1 bg-brand-cyan text-slate-950 font-extrabold text-xs sm:text-sm py-2.5 sm:py-3 px-4 sm:px-5 rounded-full shadow-md shadow-brand-cyan/20 hover:shadow-brand-cyan/30 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer border border-brand-cyan disabled:opacity-40 disabled:cursor-not-allowed whitespace-nowrap"
            >
              <ShoppingBag className="w-4 h-4 shrink-0" />
              <span>{t('orderNow')}</span>
            </button>
            <a
              href="tel:01787283804"
              className="flex-1 bg-brand-card hover:bg-brand-border/60 text-main font-bold text-xs sm:text-sm py-2.5 sm:py-3 px-4 sm:px-5 rounded-full border border-brand-border hover:border-brand-cyan/50 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 shadow-sm cursor-pointer whitespace-nowrap"
            >
              <Phone className="w-4 h-4 text-brand-cyan shrink-0" />
              <span>01787-283804</span>
            </a>
            <button
              onClick={handleShare}
              className={`flex-1 sm:flex-initial px-4 sm:px-5 py-2.5 sm:py-3 rounded-full text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-2 cursor-pointer border shadow-sm hover:scale-[1.02] active:scale-[0.98] whitespace-nowrap ${
                copied
                  ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                  : 'bg-brand-card hover:bg-brand-border/60 text-main border-brand-border hover:border-brand-cyan/50'
              }`}
              title={lang === 'bn' ? 'প্রোডাক্ট লিঙ্ক কপি করুন' : 'Share or copy product link'}
              aria-label="Share product"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>{lang === 'bn' ? 'কপি হয়েছে!' : 'Copied!'}</span>
                </>
              ) : (
                <>
                  <Share2 className="w-4 h-4 text-brand-cyan shrink-0" />
                  <span>{lang === 'bn' ? 'শেয়ার' : 'Share'}</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Nested Order Modal */}
      {orderOpen && <OrderModal product={product} onClose={() => setOrderOpen(false)} />}
    </>
  );
}
