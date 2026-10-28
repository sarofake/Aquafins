'use client';

import Link from 'next/link';
import { MapPin, Phone, Mail, ChevronRight, CreditCard, Building2, Clock } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import BrandLogo from '@/components/BrandLogo';
import { useBrand, splitBrandName, useSocialLinks, useContactInfo } from '@/hooks/useSiteInfo';
import { useCategories } from '@/hooks/useCategories';

export default function Footer({ siteInfo = null }) {
  const { lang, t } = useLanguage();
  const brand = useBrand(siteInfo);
  const brandName = splitBrandName(brand.name, brand.tagline);
  const socials = useSocialLinks(siteInfo);
  const contact = useContactInfo(siteInfo);

  // Admin-managed categories, seeded from the server render.
  const motherCategories = useCategories().categories.filter((c) => !c.parent_id);

  // Social icons are read from Admin → Site Info → Social Media; unset ones
  // are simply not rendered.
  const socialItems = [
    {
      key: 'facebook',
      href: socials.facebook,
      label: 'Facebook',
      className: 'hover:border-brand-cyan hover:bg-brand-cyan hover:text-brand-dark',
      path: 'M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z',
    },
    {
      key: 'whatsapp',
      href: socials.whatsapp,
      label: 'WhatsApp',
      className: 'hover:border-emerald-400 hover:bg-emerald-500 hover:text-white text-emerald-400',
      path: 'M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-1.107 4.043 4.143-1.085z',
    },
    {
      key: 'youtube',
      href: socials.youtube,
      label: 'YouTube',
      className: 'hover:border-red-500 hover:bg-red-600 hover:text-white text-red-500',
      path: 'M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z',
    },
    {
      key: 'instagram',
      href: socials.instagram,
      label: 'Instagram',
      className: 'hover:border-pink-500 hover:bg-pink-600 hover:text-white text-pink-500',
      path: 'M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z',
    },
    {
      key: 'threads',
      href: socials.threads,
      label: 'Threads',
      className: 'hover:border-brand-cyan hover:bg-brand-cyan hover:text-brand-dark text-main',
      path: 'M12.186 24c-3.141 0-5.789-1.1-7.658-3.181C2.53 18.6 1.637 15.632 1.996 12.239c.394-3.725 2.12-6.953 4.86-9.09C9.467 1.096 12.871.298 16.442.9c4.275.72 7.747 3.535 9.06 7.348a12.54 12.54 0 0 1 .498 3.551v.104c0 2.66-.826 4.887-2.392 6.44-1.458 1.448-3.468 2.227-5.813 2.253h-.142c-2.33-.047-4.22-.888-5.464-2.433-1.04-1.293-1.492-2.977-1.306-4.87.23-2.336 1.573-4.17 3.685-5.032 1.464-.598 3.238-.707 5.13-.315a.75.75 0 0 1 .6 0c.343.155.437.5.347.886-.09.386-.412.585-.755.485-1.58-.328-3.033-.225-4.2.252-1.61.658-2.617 2.053-2.79 3.82-.143 1.456.2 2.72.992 3.65.922 1.084 2.378 1.688 4.1 1.698 1.769-.02 3.26-.596 4.312-1.664 1.144-1.16 1.758-2.825 1.777-4.815V11.8c-.01-1.026-.174-2.072-.51-3.047-1.054-3.064-3.83-5.325-7.246-5.901-2.973-.502-5.795.165-7.945 1.878-2.296 1.83-3.742 4.542-4.072 7.636-.307 2.902.457 5.436 2.152 7.135 1.528 1.533 3.653 2.348 6.146 2.36h.082c1.782-.016 3.407-.468 4.832-1.343a.75.75 0 1 1 .786 1.277c-1.666 1.018-3.565 1.543-5.632 1.562z',
    },
    {
      key: 'tiktok',
      href: socials.tiktok,
      label: 'TikTok',
      className: 'hover:border-[#EE1D52] hover:bg-[#EE1D52] hover:text-white text-[#EE1D52]',
      path: 'M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 3 15.68 6.34 6.34 0 0 0 9.34 22a6.34 6.34 0 0 0 6.34-6.34V9.05a8.16 8.16 0 0 0 4.91 1.62V7.22a4.85 4.85 0 0 1-1-.53z',
    },
    {
      key: 'twitter',
      href: socials.twitter,
      label: 'X (Twitter)',
      className: 'hover:border-white hover:bg-white hover:text-black text-main',
      path: 'M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z',
    },
  ].filter((item) => item.href);

  return (
    <footer className="bg-brand-dark border-t border-brand-border/60 text-muted text-sm mt-16 relative overflow-hidden">
      {/* Top Accent Line */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-brand-cyan to-transparent opacity-40" />

      <div className="max-w-7xl mx-auto px-4 lg:px-12 py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-10">
          
          {/* Brand Col */}
          <div className="space-y-4">
            <Link href="/" className="flex items-center gap-3">
              <div className="relative w-9 h-9 overflow-hidden rounded-full border border-brand-cyan/40 bg-brand-card p-1">
                <BrandLogo
                  src={brand.logoUrl}
                  alt={`${brand.name} Logo`}
                  width={36}
                  height={36}
                  className="w-full h-full object-contain rounded-full"
                />
              </div>
              <div className="flex flex-col min-w-0">
                <span className="font-display tracking-wider text-lg font-bold text-main leading-none truncate max-w-[200px]">
                  {brandName.primary.toUpperCase()}
                </span>
                {brandName.secondary && (
                  <span className="text-[9px] tracking-widest text-brand-cyan uppercase font-bold truncate max-w-[200px]">
                    {brandName.secondary}
                  </span>
                )}
              </div>
            </Link>
            <p className="text-xs text-muted leading-relaxed">
              {t('brandFooterDesc')}
            </p>
            <div className="flex items-center gap-2.5 text-brand-cyan text-base pt-2 flex-wrap">
              {socialItems.map((item) => (
                <a
                  key={item.key}
                  href={item.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`w-8 h-8 rounded-full bg-brand-card border border-brand-border flex items-center justify-center transition-all ${item.className}`}
                  aria-label={item.label}
                  title={item.label}
                >
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                    <path d={item.path} />
                  </svg>
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-main font-bold mb-4 text-sm uppercase tracking-wider">{t('quickNavigation')}</h4>
            <ul className="space-y-2.5 text-xs">
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
              <li>
                <Link href="/how-to-buy" className="hover:text-brand-cyan transition-colors flex items-center gap-2">
                  <ChevronRight className="w-3.5 h-3.5 text-brand-cyan" /> {t('howToBuy')}
                </Link>
              </li>
              <li>
                <Link href="/delivery-packaging" className="hover:text-brand-cyan transition-colors flex items-center gap-2">
                  <ChevronRight className="w-3.5 h-3.5 text-brand-cyan" /> {t('deliveryPackaging')}
                </Link>
              </li>
              <li>
                <Link href="/terms-and-conditions" className="hover:text-brand-cyan transition-colors flex items-center gap-2">
                  <ChevronRight className="w-3.5 h-3.5 text-brand-cyan" /> {t('termsConditions')}
                </Link>
              </li>
              <li>
                <Link href="/privacy-policy" className="hover:text-brand-cyan transition-colors flex items-center gap-2">
                  <ChevronRight className="w-3.5 h-3.5 text-brand-cyan" /> {t('privacyPolicy')}
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-brand-cyan transition-colors flex items-center gap-2">
                  <ChevronRight className="w-3.5 h-3.5 text-brand-cyan" /> {t('contactUs')}
                </Link>
              </li>
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h4 className="text-main font-bold mb-4 text-sm uppercase tracking-wider">{t('motherCategories')}</h4>
            <ul className="space-y-2.5 text-xs">
              <li>
                <Link href="/products" className="hover:text-brand-cyan transition-colors">
                  {t('allProducts')}
                </Link>
              </li>
              {motherCategories.map((cat) => (
                <li key={cat.id}>
                  <Link
                    href={`/products?category=${cat.slug}`}
                    className="hover:text-brand-cyan transition-colors"
                  >
                    {lang === 'bn' ? cat.name_bn || cat.name : cat.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="text-main font-bold mb-4 text-sm uppercase tracking-wider">{t('customerSupport')}</h4>
            <ul className="space-y-3 text-xs">
              {(lang === 'bn' ? contact.fullAddressBn : contact.fullAddress) && (
                <li className="flex items-start gap-3">
                  <MapPin className="w-4 h-4 text-brand-cyan mt-0.5 flex-shrink-0" />
                  <span>{lang === 'bn' ? contact.fullAddressBn : contact.fullAddress}</span>
                </li>
              )}
              {contact.phone && (
                <li className="flex items-center gap-3">
                  <Phone className="w-4 h-4 text-brand-cyan flex-shrink-0" />
                  <a href={contact.phoneHref} className="hover:text-brand-cyan transition-colors">{contact.phone}</a>
                </li>
              )}
              {contact.phoneAlt && (
                <li className="flex items-center gap-3">
                  <Phone className="w-4 h-4 text-brand-cyan flex-shrink-0" />
                  <a
                    href={`tel:${contact.phoneAlt.replace(/[^\d+]/g, '').replace(/^\+/, '')}`}
                    className="hover:text-brand-cyan transition-colors"
                  >
                    {contact.phoneAlt}
                  </a>
                </li>
              )}
              {contact.email && (
                <li className="flex items-center gap-3">
                  <Mail className="w-4 h-4 text-brand-cyan flex-shrink-0" />
                  <a href={`mailto:${contact.email}`} className="hover:text-brand-cyan transition-colors">{contact.email}</a>
                </li>
              )}
              {contact.emailSupport && contact.emailSupport !== contact.email && (
                <li className="flex items-center gap-3">
                  <Mail className="w-4 h-4 text-brand-cyan flex-shrink-0" />
                  <a href={`mailto:${contact.emailSupport}`} className="hover:text-brand-cyan transition-colors">{contact.emailSupport}</a>
                </li>
              )}
              {contact.businessHours && (
                <li className="flex items-center gap-3">
                  <Clock className="w-4 h-4 text-brand-cyan flex-shrink-0" />
                  <span>{lang === 'bn' ? contact.businessHoursBn || contact.businessHours : contact.businessHours}</span>
                </li>
              )}
            </ul>
          </div>

          {/* Supported Payment Methods */}
          <div>
            <h4 className="text-main font-bold mb-4 text-sm uppercase tracking-wider">{t('supportedPayments')}</h4>

            {/* Mobile Banking */}
            <p className="text-[10px] text-subtle uppercase tracking-wider font-bold mb-2">{t('mobileBanking')}</p>
            <div className="flex flex-wrap gap-2.5">
              <div className="flex flex-col items-center gap-1" title="bKash Mobile Banking">
                <span className="w-9 h-9 rounded-full bg-brand-card border border-brand-border flex items-center justify-center text-[#E2136E] font-bold text-xs hover:border-[#E2136E] hover:bg-[#E2136E] hover:text-white transition-all cursor-default">bK</span>
                <span className="text-[9px] text-subtle">bKash</span>
              </div>
              <div className="flex flex-col items-center gap-1" title="Nagad Mobile Banking">
                <span className="w-9 h-9 rounded-full bg-brand-card border border-brand-border flex items-center justify-center text-[#F15A24] font-bold text-xs hover:border-[#F15A24] hover:bg-[#F15A24] hover:text-white transition-all cursor-default">NG</span>
                <span className="text-[9px] text-subtle">Nagad</span>
              </div>
              <div className="flex flex-col items-center gap-1" title="Rocket Mobile Banking (DBBL)">
                <span className="w-9 h-9 rounded-full bg-brand-card border border-brand-border flex items-center justify-center text-[#8C3494] font-bold text-xs hover:border-[#8C3494] hover:bg-[#8C3494] hover:text-white transition-all cursor-default">RK</span>
                <span className="text-[9px] text-subtle">Rocket</span>
              </div>
              <div className="flex flex-col items-center gap-1" title="Upay Mobile Banking">
                <span className="w-9 h-9 rounded-full bg-brand-card border border-brand-border flex items-center justify-center text-[#FFC20E] font-bold text-xs hover:border-[#FFC20E] hover:bg-[#FFC20E] hover:text-slate-900 transition-all cursor-default">UP</span>
                <span className="text-[9px] text-subtle">Upay</span>
              </div>
            </div>

            {/* Divider */}
            <div className="border-t border-brand-border/60 my-3" />

            {/* Bank & Cards */}
            <p className="text-[10px] text-subtle uppercase tracking-wider font-bold mb-2">{t('bankTransfer')}</p>
            <div className="flex flex-wrap gap-2.5">
              <div className="flex flex-col items-center gap-1" title="Dutch-Bangla Bank Limited (DBBL)">
                <span className="w-9 h-9 rounded-full bg-brand-card border border-brand-border flex items-center justify-center text-[#0066CC] hover:border-[#0066CC] hover:bg-[#0066CC] hover:text-white transition-all cursor-default">
                  <Building2 className="w-4 h-4" />
                </span>
                <span className="text-[9px] text-subtle">DBBL</span>
              </div>
              <div className="flex flex-col items-center gap-1" title="Mutual Trust Bank (MTB)">
                <span className="w-9 h-9 rounded-full bg-brand-card border border-brand-border flex items-center justify-center text-[#ED1C24] hover:border-[#ED1C24] hover:bg-[#ED1C24] hover:text-white transition-all cursor-default">
                  <Building2 className="w-4 h-4" />
                </span>
                <span className="text-[9px] text-subtle">MTB</span>
              </div>
              <div className="flex flex-col items-center gap-1" title="Visa, Mastercard & Bank Transfer">
                <span className="w-9 h-9 rounded-full bg-brand-card border border-brand-border flex items-center justify-center text-brand-cyan hover:border-brand-cyan hover:bg-brand-cyan hover:text-brand-dark transition-all cursor-default">
                  <CreditCard className="w-4 h-4" />
                </span>
                <span className="text-[9px] text-subtle">Visa / MC</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-brand-border/60 mt-12 pt-6 flex flex-col md:flex-row items-center justify-between gap-4 text-xs">
          <p>© {new Date().getFullYear()} {t('allRightsReserved').replace('Aqua Fins Bangladesh', brand.name)}</p>
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
