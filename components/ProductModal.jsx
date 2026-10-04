'use client';

import { useEffect, useState } from 'react';
import {
  X,
  ChevronLeft,
  ChevronRight,
  ShoppingBag,
  Tag,
  Phone,
  XCircle,
  Hash,
  Play,
} from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { useCategories } from '@/hooks/useCategories';
import { formatPrice } from '@/lib/currency';
import FormattedText from '@/components/FormattedText';
import OrderModal from '@/components/OrderModal';
import { extractYouTubeId, getYouTubeThumbnailUrl, getYouTubeEmbedUrl } from '@/lib/youtube';

export default function ProductModal({ product, onClose }) {
  const { lang, t } = useLanguage();
  const { categories } = useCategories();
  const [activeIndex, setActiveIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [orderOpen, setOrderOpen] = useState(false);

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

  const keywordList = product.keywords
    ? product.keywords.split(',').map((k) => k.trim()).filter(Boolean)
    : [];

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
          {/* ==================== Media Gallery ==================== */}
          <div className="flex flex-col">
            <div className="relative h-72 sm:h-96 rounded-2xl overflow-hidden bg-brand-dark/50 border border-brand-border">
              {mediaList.length > 0 && activeMedia ? (
                activeMedia.type === 'video' && activeMedia.youtube_id ? (
                  playing ? (
                    <iframe
                      src={getYouTubeEmbedUrl(activeMedia.youtube_id, true)}
                      title={prodName}
                      className="absolute inset-0 w-full h-full border-0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                      allowFullScreen
                    />
                  ) : (
                    <div className="relative w-full h-full">
                      <img
                        src={
                          activeMedia.thumbnail_url ||
                          getYouTubeThumbnailUrl(activeMedia.youtube_id) ||
                          activeMedia.url
                        }
                        alt={prodName}
                        className="w-full h-full object-contain p-3"
                        onError={(e) => {
                          const fb = getYouTubeThumbnailUrl(activeMedia.youtube_id, 'mqdefault');
                          if (fb && e.currentTarget.src !== fb) e.currentTarget.src = fb;
                        }}
                      />
                      <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                        <button
                          onClick={() => setPlaying(true)}
                          className="w-16 h-16 rounded-full bg-red-600/90 text-white flex items-center justify-center shadow-lg hover:scale-105 transition-transform cursor-pointer"
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
                    className="w-full h-full object-contain p-3"
                  />
                )
              ) : (
                <div className="w-full h-full flex items-center justify-center text-subtle text-sm">
                  {t('noImage')}
                </div>
              )}

              {/* Discount & badge overlays */}
              <div className="absolute top-3 left-3 flex flex-wrap gap-1.5 z-10 pointer-events-none">
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
                {product.featured && (
                  <span className="bg-brand-cyan/90 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow">
                    {t('featuredProducts')}
                  </span>
                )}
              </div>

              {mediaList.length > 1 && (
                <>
                  <button
                    onClick={prevMedia}
                    className="absolute left-2 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/50 hover:bg-black/70 text-white flex items-center justify-center transition-colors cursor-pointer border border-white/20 z-10"
                    aria-label="Previous media"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button
                    onClick={nextMedia}
                    className="absolute right-2 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/50 hover:bg-black/70 text-white flex items-center justify-center transition-colors cursor-pointer border border-white/20 z-10"
                    aria-label="Next media"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                  <span className="absolute bottom-2 right-3 bg-black/60 backdrop-blur-sm text-white text-[10px] font-bold px-2 py-0.5 rounded-full z-10">
                    {activeIndex + 1} / {mediaList.length}
                  </span>
                </>
              )}
            </div>

            {/* Thumbnails */}
            {mediaList.length > 1 && (
              <div className="flex gap-2 mt-3 overflow-x-auto pb-1">
                {mediaList.map((item, idx) => {
                  const thumb =
                    item.type === 'video'
                      ? item.thumbnail_url || (item.youtube_id ? getYouTubeThumbnailUrl(item.youtube_id) : '')
                      : item.url;
                  return (
                    <button
                      key={idx}
                      onClick={() => setActiveIndex(idx)}
                      className={`relative w-16 h-16 shrink-0 rounded-lg overflow-hidden border-2 transition-all cursor-pointer ${
                        idx === activeIndex
                          ? 'border-brand-cyan ring-2 ring-brand-cyan/30'
                          : 'border-transparent opacity-70 hover:opacity-100'
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
                        <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                          <div className="w-6 h-6 rounded-full bg-red-600/90 text-white flex items-center justify-center shadow">
                            <Play className="w-3 h-3 fill-white ml-0.5" />
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
          <div className="flex flex-col">
            {/* Category */}
            <span className="bg-brand-dark border border-brand-border text-brand-cyan text-[10px] uppercase font-bold px-2.5 py-1 rounded-full self-start mt-4 md:mt-0">
              {getCategoryDisplay()}
            </span>

            {/* Name */}
            <h2 className="font-display font-bold text-2xl sm:text-3xl text-main mt-3 leading-tight">
              {prodName}
              {prodQty ? <span className="font-medium text-muted text-base sm:text-lg"> ({prodQty})</span> : null}
            </h2>

            {/* Price */}
            <div className="flex flex-wrap items-baseline gap-2.5 mt-3">
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

            <div className="my-4 h-px bg-brand-border/60" />

            {/* Out of Stock Notice (only shown when out of stock) */}
            {product.available === false && (
              <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-3 mt-4 flex items-center gap-2">
                <XCircle className="w-4 h-4 text-red-400 shrink-0" />
                <p className="text-sm font-bold text-red-400">
                  {lang === 'bn' ? 'স্টকে নেই' : 'Out of Stock'}
                </p>
              </div>
            )}

            {/* Description */}
            <div className="mt-4 flex-grow">
              <span className="text-brand-cyan text-xs font-bold uppercase tracking-wider block mb-2">
                {t('productDetails')}
              </span>
              <div className="bg-brand-dark/50 border border-brand-border/60 rounded-2xl p-4 text-sm text-muted max-h-48 overflow-y-auto">
                {prodDesc ? (
                  <FormattedText text={prodDesc} />
                ) : (
                  <p className="text-subtle">{t('noDescription')}</p>
                )}
              </div>
            </div>

            {/* Keywords */}
            {keywordList.length > 0 && (
              <div className="mt-3">
                <div className="flex items-center gap-1.5 mb-1.5">
                  <Hash className="w-3 h-3 text-muted" />
                  <span className="text-[10px] text-muted uppercase font-bold tracking-wider">{t('keywords') || 'Keywords'}</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {keywordList.map((kw, i) => (
                    <span key={i} className="bg-brand-cyan/10 text-brand-cyan border border-brand-cyan/30 text-[10px] font-bold px-2 py-0.5 rounded-full">
                      {kw}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 mt-5">
              <button
                onClick={() => setOrderOpen(true)}
                disabled={product.available === false}
                className="flex-1 bg-brand-cyan text-brand-dark hover:bg-white border border-brand-cyan px-6 py-3.5 rounded-full text-sm font-bold transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg disabled:opacity-40 disabled:cursor-not-allowed"
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
