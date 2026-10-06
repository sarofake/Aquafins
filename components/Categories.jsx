'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { Fish, Leaf, Utensils, Shell, Mountain, ChevronLeft, ChevronRight, Grid, Package } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { useTheme } from '@/context/ThemeContext';
import FormattedText from '@/components/FormattedText';

const DEFAULT_CATEGORIES = [
  {
    id: 'plants',
    slug: 'plants',
    name: 'Plants',
    description: 'Live Aquatic Plants & Moss',
    icon: Leaf,
    image: '',
    color: 'text-emerald-400',
    bgColor: 'bg-emerald-500/10',
  },
  {
    id: 'fish',
    slug: 'fish',
    name: 'Fish',
    description: 'Bettas & Exotic Freshwater Fish',
    icon: Fish,
    image: '',
    color: 'text-brand-cyan',
    bgColor: 'bg-brand-cyan/10',
  },
  {
    id: 'livestock',
    slug: 'livestock',
    name: 'Livestock',
    description: 'Shrimps, Snails & Invertebrates',
    icon: Shell,
    image: '',
    color: 'text-purple-400',
    bgColor: 'bg-purple-500/10',
  },
  {
    id: 'food-accessories',
    slug: 'food-accessories',
    name: 'Food & Accessories',
    description: 'Nutrition, Filters & Lighting',
    icon: Utensils,
    image: '',
    color: 'text-yellow-400',
    bgColor: 'bg-yellow-500/10',
  },
  {
    id: 'scaping',
    slug: 'scaping',
    name: 'Scaping',
    description: 'Rocks, Driftwood & Substrates',
    icon: Mountain,
    image: '',
    color: 'text-amber-400',
    bgColor: 'bg-amber-500/10',
  },
  {
    id: 'combo',
    slug: 'combo',
    name: 'Combo',
    description: 'Special Bundles & Value Deals',
    icon: Package,
    image: '',
    color: 'text-rose-400',
    bgColor: 'bg-rose-500/10',
  },
];

export default function Categories() {
  const { lang, t } = useLanguage();
  const { resolvedTheme } = useTheme();
  const [categories, setCategories] = useState(DEFAULT_CATEGORIES);

  useEffect(() => {
    let active = true;
    fetch('/api/categories')
      .then((r) => r.json())
      .then((data) => {
        if (active && data.categories && data.categories.length > 0) {
          const mapped = data.categories.map((c) => {
            const fallback = DEFAULT_CATEGORIES.find((d) => d.slug === c.slug) || {};
            return {
              id: c.id,
              slug: c.slug,
              name: c.name,
              name_bn: c.name_bn,
              description: c.description || fallback.description || '',
              description_bn: c.description_bn,
              image: c.image || '',
              icon: fallback.icon || Grid,
              color: fallback.color || 'text-brand-cyan',
              bgColor: fallback.bgColor || 'bg-brand-cyan/10',
            };
          });
          setCategories(mapped);
        }
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, []);

  const scrollerRef = useRef(null);
  const [atStart, setAtStart] = useState(true);
  const [atEnd, setAtEnd] = useState(false);

  const updateArrows = useCallback(() => {
    const el = scrollerRef.current;
    if (!el) return;
    setAtStart(el.scrollLeft <= 4);
    setAtEnd(el.scrollLeft + el.clientWidth >= el.scrollWidth - 4);
  }, []);

  useEffect(() => {
    updateArrows();
    window.addEventListener('resize', updateArrows);
    return () => window.removeEventListener('resize', updateArrows);
  }, [updateArrows, categories.length]);

  const scrollCarousel = (direction) => {
    const el = scrollerRef.current;
    if (!el) return;
    const item = el.querySelector('[data-carousel-item]');
    const step = item ? item.getBoundingClientRect().width + 20 : el.clientWidth * 0.8;
    el.scrollBy({ left: direction * step, behavior: 'smooth' });
  };

  return (
    <section id="featured" className="max-w-7xl mx-auto px-4 lg:px-12 py-16">
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-10">
        <div>
          <span className="text-brand-cyan text-xs font-bold uppercase tracking-wider block mb-2">
            {t('exploreCollection')}
          </span>
          <h2 className="text-3xl md:text-4xl font-display font-bold text-main mb-2">
            {t('popularCategories')}
          </h2>
          <p className="text-muted text-sm max-w-md">
            {t('everythingYouNeed')}
          </p>
        </div>
        <div className="mt-4 md:mt-0 flex items-center gap-4">
          <Link
            href="/products"
            className="text-brand-cyan font-semibold text-sm hover:underline flex items-center gap-1.5"
          >
            {t('viewAll')} <ChevronRight className="w-4 h-4" />
          </Link>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => scrollCarousel(-1)}
              disabled={atStart}
              aria-label={t('carouselPrev')}
              className="w-9 h-9 rounded-full border border-brand-border bg-brand-card text-muted hover:border-brand-cyan hover:text-brand-cyan flex items-center justify-center transition-all disabled:opacity-35 disabled:cursor-not-allowed disabled:hover:border-brand-border disabled:hover:text-muted cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => scrollCarousel(1)}
              disabled={atEnd}
              aria-label={t('carouselNext')}
              className="w-9 h-9 rounded-full border border-brand-border bg-brand-card text-muted hover:border-brand-cyan hover:text-brand-cyan flex items-center justify-center transition-all disabled:opacity-35 disabled:cursor-not-allowed disabled:hover:border-brand-border disabled:hover:text-muted cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      <div
        ref={scrollerRef}
        onScroll={updateArrows}
        className="flex gap-4 lg:gap-5 overflow-x-auto snap-x snap-mandatory scroll-smooth no-scrollbar pb-1"
      >
        {categories.map((cat) => {
          const IconComp = cat.icon || Grid;
          const catName = lang === 'bn' ? (cat.name_bn || t(cat.slug) || cat.name) : cat.name;
          const catDesc = lang === 'bn' ? (cat.description_bn || cat.description) : cat.description;

          return (
            <Link
              key={cat.id || cat.slug}
              href={`/products?category=${cat.slug}`}
              data-carousel-item
              className="group relative shrink-0 snap-start w-[75%] sm:w-[calc((100%_-_1rem)/2)] md:w-[calc((100%_-_2rem)/3)] lg:w-[calc((100%_-_3.75rem)/4)] rounded-2xl overflow-hidden border border-brand-border/60 bg-brand-card hover:border-brand-cyan/50 transition-all duration-300 hover:-translate-y-2 flex flex-col shadow-lg hover:shadow-xl hover:shadow-brand-cyan/5"
            >
              {/* Category Thumbnail */}
              <div className="relative h-44 overflow-hidden bg-brand-dark flex items-center justify-center">
                {cat.image ? (
                  <>
                    <img
                      src={cat.image}
                      alt={catName}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
                  </>
                ) : (
                  <div className={`w-full h-full flex flex-col items-center justify-center p-4 bg-gradient-to-br from-brand-dark via-brand-card to-brand-dark ${cat.bgColor || 'bg-brand-cyan/10'} group-hover:scale-105 transition-transform duration-500`}>
                    <div className={`w-16 h-16 rounded-2xl ${cat.bgColor || 'bg-brand-cyan/10'} flex items-center justify-center mb-1 group-hover:scale-110 transition-transform duration-300`}>
                      <IconComp className={`w-8 h-8 ${cat.color || 'text-brand-cyan'}`} />
                    </div>
                  </div>
                )}
                {/* Bottom gradient fade */}
                <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-black/50 to-transparent pointer-events-none" />
                {/* Top-right glow on hover */}
                <div className="absolute top-0 right-0 w-24 h-24 bg-brand-cyan/0 group-hover:bg-brand-cyan/10 rounded-full blur-2xl transition-all duration-500 pointer-events-none" />
              </div>

              {/* Category Info */}
              <div className="relative px-4 pb-4 pt-2.5 text-center shadow-inner bg-cyan-500">
                <h3 className="font-bold text-sm text-white group-hover:text-white/90 transition-colors duration-300 mb-1">
                  {catName}
                </h3>
                <FormattedText text={catDesc || t('exploreCollection')} clamp="line-clamp-1" className="text-[11px] text-white/80 leading-relaxed" />
                <div className="mt-2 flex justify-center">
                  <span className="text-white group-hover:translate-x-1 transition-transform duration-300">
                    <ChevronRight className="w-4 h-4" />
                  </span>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
