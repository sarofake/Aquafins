'use client';

import Link from 'next/link';
import { Fish, Leaf, Package, MapPin, Phone, Mail } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

export default function AboutPage() {
  const { t } = useLanguage();

  const highlights = [
    {
      icon: Fish,
      color: 'text-brand-cyan',
      bg: 'bg-brand-cyan/10',
      title: t('exoticFishTitle'),
      text: t('exoticFishDesc'),
    },
    {
      icon: Leaf,
      color: 'text-green-400',
      bg: 'bg-green-500/10',
      title: t('livePlantsTitle'),
      text: t('livePlantsDesc'),
    },
    {
      icon: Package,
      color: 'text-yellow-400',
      bg: 'bg-yellow-500/10',
      title: t('equipmentTitle'),
      text: t('equipmentDesc'),
    },
    {
      icon: MapPin,
      color: 'text-blue-400',
      bg: 'bg-blue-500/10',
      title: t('nationwideTitle'),
      text: t('nationwideDesc'),
    },
  ];

  return (
    <div>
      {/* Page Banner */}
      <div className="bg-brand-card border-b border-brand-border/40 py-14">
        <div className="max-w-7xl mx-auto px-4 lg:px-12">
          <h1 className="text-4xl md:text-5xl font-display font-bold text-main mb-3">
            {t('aboutTitle')}
          </h1>
          <p className="text-muted text-sm max-w-2xl">
            {t('aboutSubtitle')}
          </p>
        </div>
      </div>

      {/* Company Story */}
      <section className="max-w-7xl mx-auto px-4 lg:px-12 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-4">
            <span className="text-brand-cyan text-xs font-bold uppercase tracking-wider block">
              {t('whoWeAre')}
            </span>
            <h2 className="text-3xl font-display font-bold text-main">
              {t('passionateTitle')}
            </h2>
            <p className="text-muted text-sm leading-relaxed">
              {t('passionateDesc1')}
            </p>
            <p className="text-muted text-sm leading-relaxed">
              {t('passionateDesc2')}
            </p>
            <div className="flex flex-wrap gap-4 pt-2">
              <Link
                href="/products"
                className="bg-brand-cyan text-brand-dark px-6 py-3 rounded-full font-bold hover:bg-white transition-colors cursor-pointer"
              >
                {t('browseProducts')}
              </Link>
              <Link
                href="/#featured"
                className="bg-transparent border border-brand-cyan/50 text-main px-6 py-3 rounded-full font-bold hover:bg-brand-cyan/10 transition-colors cursor-pointer"
              >
                {t('popularCategories')}
              </Link>
            </div>
          </div>

          {/* Highlights */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {highlights.map((item) => {
              const IconComponent = item.icon;
              return (
                <div
                  key={item.title}
                  className="bg-brand-card border border-brand-border rounded-2xl p-6"
                >
                  <div className={`w-12 h-12 rounded-full ${item.bg} flex items-center justify-center ${item.color} mb-4`}>
                    <IconComponent className="w-6 h-6" />
                  </div>
                  <h3 className="font-bold text-main mb-1">{item.title}</h3>
                  <p className="text-xs text-muted leading-relaxed">{item.text}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Contact Strip */}
      <section className="bg-brand-card border-t border-brand-border/40">
        <div className="max-w-7xl mx-auto px-4 lg:px-12 py-12">
          <h2 className="text-2xl font-display font-bold text-main mb-6">{t('getInTouch')}</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm text-muted">
            <div className="flex items-start gap-3">
              <MapPin className="w-5 h-5 text-brand-cyan flex-shrink-0 mt-0.5" />
              <span>{t('dhakaBangladesh')}</span>
            </div>
            <div className="flex items-center gap-3">
              <Phone className="w-5 h-5 text-brand-cyan flex-shrink-0" />
              <a href="tel:01787283804" className="hover:text-brand-cyan transition-colors">01787-283804</a>
            </div>
            <div className="flex items-center gap-3">
              <Mail className="w-5 h-5 text-brand-cyan flex-shrink-0" />
              <span>support@aquafins.bd</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}