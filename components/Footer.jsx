'use client';

import Link from 'next/link';
import Image from 'next/image';
import { MapPin, Phone, Mail, ChevronRight } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

export default function Footer() {
  const { t } = useLanguage();

  return (
    <footer className="bg-brand-dark border-t border-brand-border/60 text-muted text-sm mt-16 relative overflow-hidden">
      {/* Top Accent Line */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-brand-cyan to-transparent opacity-40" />

      <div className="max-w-7xl mx-auto px-4 lg:px-12 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          
          {/* Brand Col */}
          <div className="space-y-4">
            <Link href="/" className="flex items-center gap-3">
              <div className="relative w-9 h-9 overflow-hidden rounded-full border border-brand-cyan/40 bg-brand-card p-1">
                <Image
                  src="/aquafinsbangladesh logo.png"
                  alt="Aqua Fins Bangladesh Logo"
                  width={36}
                  height={36}
                  className="w-full h-full object-contain rounded-full"
                />
              </div>
              <div className="flex flex-col">
                <span className="font-display tracking-wider text-lg font-bold text-main leading-none">
                  AQUA FINS
                </span>
                <span className="text-[9px] tracking-widest text-brand-cyan uppercase font-bold">
                  BANGLADESH
                </span>
              </div>
            </Link>
            <p className="text-xs text-muted leading-relaxed">
              {t('brandFooterDesc')}
            </p>
            <div className="flex items-center gap-3 text-brand-cyan text-base pt-2">
              <a href="https://www.facebook.com/aquafinsbangladesh/" target="_blank" rel="noopener noreferrer" className="w-8 h-8 rounded-full bg-brand-card border border-brand-border flex items-center justify-center hover:border-brand-cyan hover:bg-brand-cyan hover:text-brand-dark transition-all" aria-label="Facebook">
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
              </a>
              <a href="https://wa.me/8801787283804" target="_blank" rel="noopener noreferrer" className="w-8 h-8 rounded-full bg-brand-card border border-brand-border flex items-center justify-center hover:border-emerald-400 hover:bg-emerald-500 hover:text-white transition-all text-emerald-400" aria-label="WhatsApp">
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-1.107 4.043 4.143-1.085z"/></svg>
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-main font-bold mb-4 text-sm uppercase tracking-wider">{t('quickNavigation')}</h4>
            <ul className="space-y-2.5 text-xs">
              <li>
                <Link href="/" className="hover:text-brand-cyan transition-colors flex items-center gap-2">
                  <ChevronRight className="w-3.5 h-3.5 text-brand-cyan" /> {t('home')}
                </Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-brand-cyan transition-colors flex items-center gap-2">
                  <ChevronRight className="w-3.5 h-3.5 text-brand-cyan" /> {t('about')}
                </Link>
              </li>
              <li>
                <Link href="/products" className="hover:text-brand-cyan transition-colors flex items-center gap-2">
                  <ChevronRight className="w-3.5 h-3.5 text-brand-cyan" /> {t('products')}
                </Link>
              </li>
              <li>
                <Link href="/#featured" className="hover:text-brand-cyan transition-colors flex items-center gap-2">
                  <ChevronRight className="w-3.5 h-3.5 text-brand-cyan" /> {t('popularCategories')}
                </Link>
              </li>
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h4 className="text-main font-bold mb-4 text-sm uppercase tracking-wider">{t('motherCategories')}</h4>
            <ul className="space-y-2.5 text-xs">
              <li>
                <Link href="/products?category=fish" className="hover:text-brand-cyan transition-colors">
                  {t('fish')}
                </Link>
              </li>
              <li>
                <Link href="/products?category=plants" className="hover:text-brand-cyan transition-colors">
                  {t('plants')}
                </Link>
              </li>
              <li>
                <Link href="/products?category=livestock" className="hover:text-brand-cyan transition-colors">
                  {t('livestock')}
                </Link>
              </li>
              <li>
                <Link href="/products?category=food-accessories" className="hover:text-brand-cyan transition-colors">
                  {t('foodAccessories')}
                </Link>
              </li>
              <li>
                <Link href="/products?category=scaping" className="hover:text-brand-cyan transition-colors">
                  {t('scaping')}
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="text-main font-bold mb-4 text-sm uppercase tracking-wider">{t('customerSupport')}</h4>
            <ul className="space-y-3 text-xs">
              <li className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-brand-cyan mt-0.5 flex-shrink-0" />
                <span>{t('dhakaBangladesh')}</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-brand-cyan flex-shrink-0" />
                <a href="tel:01787283804" className="hover:text-brand-cyan transition-colors">01787-283804</a>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-brand-cyan flex-shrink-0" />
                <span>support@aquafins.bd</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-brand-border/60 mt-12 pt-6 flex flex-col md:flex-row items-center justify-between gap-4 text-xs">
          <p>© {new Date().getFullYear()} {t('allRightsReserved')}</p>
          <p className="text-subtle">
            {t('createdBy')}{' '}
            <a
              href="https://hellosaro.site/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-brand-cyan hover:underline font-semibold"
            >
              hellosaro
            </a>
          </p>
          <div className="flex items-center gap-4 text-subtle">
            <span>{t('qualityGuaranteed')}</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
