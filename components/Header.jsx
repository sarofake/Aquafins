'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import BrandLogo from '@/components/BrandLogo';
import { usePathname, useRouter } from 'next/navigation';
import { useTheme } from '@/context/ThemeContext';
import { useLanguage } from '@/context/LanguageContext';
import { useBrand, splitBrandName, useSocialLinks, useContactInfo } from '@/hooks/useSiteInfo';
import { useCategories } from '@/hooks/useCategories';
import { resolveCategoryIcon, categoryAccent } from '@/lib/categoryIcons';
import {
  Search,
  Menu,
  X,
  Phone,
  Home,
  Grid,
  Sun,
  Moon,
  Globe,
  Tag,
  Archive,
} from 'lucide-react';

export default function Header({ siteInfo = null }) {
  const pathname = usePathname();
  const router = useRouter();
  const { theme, toggleTheme } = useTheme();
  const { lang, toggleLang, t } = useLanguage();
  const brand = useBrand(siteInfo);
  const brandName = splitBrandName(brand.name, brand.tagline);
  const socials = useSocialLinks(siteInfo);
  const contact = useContactInfo(siteInfo);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isScrolled, setIsScrolled] = useState(false);

  // Categories come from the database (seeded by the site layout), so a
  // category an admin adds, renames or deletes appears here without a code
  // change.
  const { categories } = useCategories();
  const motherCategories = categories.filter((c) => !c.parent_id);

  // usePathname() excludes the query string, so the selected category is read
  // from the URL after mount (and on every navigation).
  const [activeCategory, setActiveCategory] = useState('');
  useEffect(() => {
    const readCategory = () => {
      try {
        setActiveCategory(new URLSearchParams(window.location.search).get('category') || '');
      } catch {
        setActiveCategory('');
      }
    };
    readCategory();
  }, [pathname]);

  const isHomeActive = pathname === '/' || pathname === '/home';
  const isProductsActive = pathname === '/products';
  const isDealsActive = pathname === '/deals';
  const isArchiveActive = pathname === '/archive';

  useEffect(() => {
    let timeout = null;
    let rafPending = false;

    const measure = () => {
      rafPending = false;
      const y = window.scrollY;
      setIsScrolled((prev) => {
        if (y > 150) return true;
        if (y < 80) return false;
        return prev;
      });
    };

    const handleScroll = () => {
      clearTimeout(timeout);
      timeout = setTimeout(() => {
        if (!rafPending) {
          rafPending = true;
          requestAnimationFrame(measure);
        }
      }, 15);
    };

    measure();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      clearTimeout(timeout);
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      router.push('/products');
    }
  };

  return (
    <div className="sticky top-0 z-40 w-full shadow-lg">
      {/* ==================== 1st HEADER: TOP PHONE & ADDRESS BAR ==================== */}
      <div
        style={{ gridTemplateRows: isScrolled ? '0fr' : '1fr' }}
        className="grid transition-[grid-template-rows] duration-300 ease-out"
      >
        <div className="overflow-hidden">
          <div className="bg-header-top text-xs px-4 lg:px-12 text-muted border-b border-brand-border/50 py-2 shadow-inner">
            <div className="max-w-7xl mx-auto flex justify-between items-center gap-2">
              {/* Left Side: Social Icon Redirect Buttons */}
              <div className="flex items-center gap-2">
                {/* WhatsApp Icon */}
                <a
                  href={socials.whatsapp}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-7 h-7 rounded-full bg-[#25D366]/15 hover:bg-[#25D366] text-[#25D366] hover:text-white border border-[#25D366]/40 flex items-center justify-center transition-all shadow-sm hover:scale-110"
                  title={`WhatsApp (${contact.whatsappNumber})`}
                  aria-label="WhatsApp"
                >
                  <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                    <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-1.107 4.043 4.143-1.085z" />
                  </svg>
                </a>

                {/* Facebook Icon */}
                <a
                  href={socials.facebook}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-7 h-7 rounded-full bg-[#1877F2]/15 hover:bg-[#1877F2] text-[#1877F2] hover:text-white border border-[#1877F2]/40 flex items-center justify-center transition-all shadow-sm hover:scale-110"
                  title="Facebook Page"
                  aria-label="Facebook Page"
                >
                  <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                  </svg>
                </a>

                {/* YouTube Icon */}
                <a
                  href={socials.youtube}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-7 h-7 rounded-full bg-[#FF0000]/15 hover:bg-[#FF0000] text-[#FF0000] hover:text-white border border-[#FF0000]/40 flex items-center justify-center transition-all shadow-sm hover:scale-110"
                  title="YouTube Channel"
                  aria-label="YouTube Channel"
                >
                  <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                  </svg>
                </a>

                {/* Instagram Icon */}
                <a
                  href={socials.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-7 h-7 rounded-full bg-[#E4405F]/15 hover:bg-[#E4405F] text-[#E4405F] hover:text-white border border-[#E4405F]/40 flex items-center justify-center transition-all shadow-sm hover:scale-110"
                  title="Instagram"
                  aria-label="Instagram"
                >
                  <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                  </svg>
                </a>

                {/* Threads Icon */}
                <a
                  href={socials.threads}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-7 h-7 rounded-full bg-brand-main/15 hover:bg-brand-cyan hover:text-brand-dark text-main border border-brand-border flex items-center justify-center transition-all shadow-sm hover:scale-110"
                  title="Threads"
                  aria-label="Threads"
                >
                  <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                    <path d="M12.186 24c-3.141 0-5.789-1.1-7.658-3.181C2.53 18.6 1.637 15.632 1.996 12.239c.394-3.725 2.12-6.953 4.86-9.09C9.467 1.096 12.871.298 16.442.9c4.275.72 7.747 3.535 9.06 7.348a12.54 12.54 0 0 1 .498 3.551v.104c0 2.66-.826 4.887-2.392 6.44-1.458 1.448-3.468 2.227-5.813 2.253h-.142c-2.33-.047-4.22-.888-5.464-2.433-1.04-1.293-1.492-2.977-1.306-4.87.23-2.336 1.573-4.17 3.685-5.032 1.464-.598 3.238-.707 5.13-.315a.75.75 0 0 1 .6 0c.343.155.437.5.347.886-.09.386-.412.585-.755.485-1.58-.328-3.033-.225-4.2.252-1.61.658-2.617 2.053-2.79 3.82-.143 1.456.2 2.72.992 3.65.922 1.084 2.378 1.688 4.1 1.698 1.769-.02 3.26-.596 4.312-1.664 1.144-1.16 1.758-2.825 1.777-4.815V11.8c-.01-1.026-.174-2.072-.51-3.047-1.054-3.064-3.83-5.325-7.246-5.901-2.973-.502-5.795.165-7.945 1.878-2.296 1.83-3.742 4.542-4.072 7.636-.307 2.902.457 5.436 2.152 7.135 1.528 1.533 3.653 2.348 6.146 2.36h.082c1.782-.016 3.407-.468 4.832-1.343a.75.75 0 1 1 .786 1.277c-1.666 1.018-3.565 1.543-5.632 1.562z" />
                  </svg>
                </a>

                {/* TikTok Icon */}
                <a
                  href={socials.tiktok}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-7 h-7 rounded-full bg-[#EE1D52]/15 hover:bg-[#EE1D52] text-[#EE1D52] hover:text-white border border-[#EE1D52]/40 flex items-center justify-center transition-all shadow-sm hover:scale-110"
                  title="TikTok"
                  aria-label="TikTok"
                >
                  <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 3 15.68 6.34 6.34 0 0 0 9.34 22a6.34 6.34 0 0 0 6.34-6.34V9.05a8.16 8.16 0 0 0 4.91 1.62V7.22a4.85 4.85 0 0 1-1-.53z" />
                  </svg>
                </a>
              </div>

              {/* Right Side: Theme, Language & Hotline */}
              <div className="flex items-center gap-3 text-xs">
                {/* Theme Toggle Button (White / Dark) */}
                <button
                  onClick={toggleTheme}
                  className="flex items-center gap-1.5 bg-brand-card hover:bg-brand-border/60 text-brand-cyan px-2.5 py-1.5 rounded-full border border-brand-border hover:border-brand-cyan/50 transition-all cursor-pointer shadow-sm"
                  title={theme === 'light' ? 'Switch to Dark Mode' : 'Switch to White Mode'}
                  aria-label="Toggle White/Dark Theme"
                >
                  {theme === 'light' ? (
                    <Sun className="w-3.5 h-3.5 text-amber-500" />
                  ) : (
                    <Moon className="w-3.5 h-3.5 text-brand-cyan" />
                  )}
                  <span className="hidden sm:inline text-[11px] font-bold text-main">
                    {theme === 'light' ? 'White' : 'Dark'}
                  </span>
                </button>

                {/* Language Switcher Button */}
                <button
                  onClick={toggleLang}
                  className="flex items-center gap-1.5 bg-brand-card hover:bg-brand-border/60 text-brand-cyan px-2.5 py-1.5 rounded-full border border-brand-border hover:border-brand-cyan/50 transition-all cursor-pointer shadow-sm"
                  title={lang === 'bn' ? 'Switch to English' : 'বাংলায় পরিবর্তন করুন'}
                  aria-label="Toggle language"
                >
                  <Globe className="w-3.5 h-3.5 text-brand-cyan" />
                  <span className="text-[11px] font-bold text-main">{lang === 'bn' ? 'বাংলা' : 'ENG'}</span>
                </button>

                <span className="text-brand-border hidden sm:inline">|</span>

                <a
                  href={contact.phoneHref}
                  className="flex items-center gap-1.5 text-main font-medium hover:text-brand-cyan transition-colors"
                >
                  <Phone className="w-3.5 h-3.5 text-brand-cyan" />
                  <span>{t('hotline')}: <strong className="text-brand-cyan">{contact.phone}</strong></span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ==================== 2nd HEADER: LOGO, SEARCH & ACTIONS ==================== */}
      <div
        style={{ gridTemplateRows: isScrolled ? '0fr' : '1fr' }}
        className="grid transition-[grid-template-rows] duration-300 ease-out"
      >
        <div className="overflow-hidden">
          <div className="bg-header-mid border-b border-brand-border/60 shadow-md">
            <div className="max-w-7xl mx-auto px-4 lg:px-12 py-3.5 flex items-center justify-between gap-4">
              {/* Logo */}
              <Link href="/" className="flex-shrink-0 group flex items-center gap-3">
                <div className="relative w-11 h-11 overflow-hidden rounded-full border border-brand-cyan/40 bg-brand-card p-1 group-hover:scale-105 transition-transform shadow-md">
                  <BrandLogo
                    src={brand.logoUrl}
                    alt={`${brand.name} Logo`}
                    width={44}
                    height={44}
                    className="w-full h-full object-contain rounded-full"
                    priority
                  />
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="font-display tracking-wider text-lg sm:text-2xl font-bold text-main group-hover:text-brand-cyan transition-colors leading-none truncate max-w-[180px] sm:max-w-[340px]">
                    {brandName.primary.toUpperCase()}
                  </span>
                  {brandName.secondary && (
                    <span className="text-[9px] sm:text-[10px] tracking-widest text-brand-cyan uppercase font-bold truncate max-w-[180px] sm:max-w-[340px]">
                      {brandName.secondary}
                    </span>
                  )}
                </div>
              </Link>

              {/* Center Search Input */}
              <form onSubmit={handleSearchSubmit} className="relative hidden md:block flex-1 max-w-lg mx-4">
                <input
                  type="text"
                  placeholder={t('searchPlaceholder')}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-brand-card/90 border border-brand-border rounded-full pl-5 pr-12 py-2.5 text-xs text-main placeholder:text-subtle focus:outline-none focus:border-brand-cyan focus:ring-1 focus:ring-brand-cyan transition-all"
                />
                <button
                  type="submit"
                  className="absolute right-1.5 top-1/2 -translate-y-1/2 bg-brand-cyan text-slate-950 p-2 rounded-full hover:bg-white hover:text-black transition-colors cursor-pointer"
                  title="Search"
                >
                  <Search className="w-3.5 h-3.5" />
                </button>
              </form>

              {/* Right Actions: Deals & Menu */}
              <div className="flex items-center gap-2.5">
                {/* Offer & Deals Button */}
                <Link
                  href="/deals"
                  className={`relative flex items-center gap-1.5 px-3.5 py-2 rounded-full border transition-all shadow-sm text-xs font-bold ${
                    isDealsActive
                      ? 'bg-amber-400 text-brand-dark border-amber-400'
                      : 'bg-brand-card hover:bg-brand-border/60 text-amber-400 border-brand-border hover:border-amber-400/50'
                  }`}
                  title={t('dealsAndOffers')}
                  aria-label="Offer and Deals"
                >
                  <Tag className={`w-4 h-4 ${isDealsActive ? 'text-brand-dark' : 'text-amber-400'}`} />
                  <span className={`hidden sm:inline ${isDealsActive ? 'text-brand-dark' : 'text-main'}`}>
                    {t('dealsAndOffers')}
                  </span>
                </Link>

                {/* Mobile Toggle */}
                <button
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  className="md:hidden bg-brand-card text-muted hover:text-main p-2 rounded-full border border-brand-border cursor-pointer ml-1"
                  title="Toggle Menu"
                >
                  {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ==================== 3rd HEADER: MOTHER CATEGORIES & PINNED STICKY NAV ==================== */}
      <nav className="bg-header-bottom border-b border-brand-border/60 shadow-lg backdrop-blur-md">
        <div className={`max-w-7xl mx-auto px-4 lg:px-12 flex items-center text-xs font-semibold text-muted ${isScrolled ? 'justify-between py-4' : 'justify-between md:justify-center py-2.5'}`}>
          {/* Pinned Compact Brand Logo */}
          {isScrolled && (
            <Link href="/" className="flex items-center gap-2.5 mr-4 flex-shrink-0 animate-fade-in">
              <BrandLogo
                src={brand.logoUrl}
                alt={`${brand.name} Logo`}
                width={30}
                height={30}
                className="rounded-full border border-brand-cyan/40"
              />
              <span className="font-display font-bold text-main text-base tracking-wider truncate max-w-[200px]">
                {brandName.primary.toUpperCase()}
              </span>
            </Link>
          )}

          {/* 5 Mother Categories Links */}
          <div className="flex items-center gap-5 sm:gap-7 overflow-x-auto py-1">
            <Link
              href="/products"
              className={
                isProductsActive && !pathname.includes('category')
                  ? 'text-brand-cyan font-bold flex items-center gap-1.5 border-b-2 border-brand-cyan pb-0.5'
                  : 'hover:text-brand-cyan transition-colors flex items-center gap-1.5'
              }
            >
              <Grid className="w-3.5 h-3.5" /> {t('allProducts')}
            </Link>

            {motherCategories.length > 0 && (
              <>
                <span className="text-brand-border">|</span>

                {motherCategories.map((cat, index) => {
                  const Icon = resolveCategoryIcon(cat.icon);
                  const accent = categoryAccent(index);
                  const label = lang === 'bn' ? cat.name_bn || cat.name : cat.name;

                  return (
                    <Link
                      key={cat.id}
                      href={`/products?category=${cat.slug}`}
                      className={
                        activeCategory === cat.slug
                          ? 'text-brand-cyan font-bold flex items-center gap-1.5 border-b-2 border-brand-cyan pb-0.5'
                          : 'hover:text-brand-cyan transition-colors flex items-center gap-1.5 text-muted'
                      }
                    >
                      <Icon className={`w-3.5 h-3.5 ${accent.color}`} /> {label}
                    </Link>
                  );
                })}
              </>
            )}

            <span className="text-brand-border">|</span>

            <Link
              href="/archive"
              className={
                isArchiveActive
                  ? 'text-brand-cyan font-bold flex items-center gap-1.5 border-b-2 border-brand-cyan pb-0.5'
                  : 'hover:text-brand-cyan transition-colors flex items-center gap-1.5 text-muted'
              }
            >
              <Archive className="w-3.5 h-3.5" /> {t('archive')}
            </Link>
          </div>

          {/* Scrolled Compact Search */}
          {isScrolled && (
            <div className="flex items-center gap-3 ml-4 flex-shrink-0">
              <form onSubmit={handleSearchSubmit} className="relative hidden sm:block w-40 lg:w-52">
                <input
                  type="text"
                  placeholder={t('searchCompact')}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-brand-dark/80 border border-brand-border rounded-full pl-9 pr-4 py-2 text-xs text-main placeholder:text-subtle focus:outline-none focus:border-brand-cyan focus:ring-1 focus:ring-brand-cyan transition-all"
                />
                <button
                  type="submit"
                  className="absolute left-2 top-1/2 -translate-y-1/2 bg-transparent text-brand-cyan p-1 cursor-pointer"
                  title="Search"
                >
                  <Search className="w-3.5 h-3.5" />
                </button>
              </form>
            </div>
          )}
        </div>
      </nav>

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-brand-card border-b border-brand-border px-6 py-4 flex flex-col gap-4">
          <form onSubmit={handleSearchSubmit} className="relative w-full">
            <input
              type="text"
              placeholder={t('searchPlaceholder')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-brand-dark border border-brand-border rounded-full pl-4 pr-10 py-2 text-xs text-main"
            />
            <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2 text-muted">
              <Search className="w-4 h-4" />
            </button>
          </form>

          <nav className="flex flex-col gap-3 font-semibold text-xs text-muted">
            <Link
              href="/"
              onClick={() => setMobileMenuOpen(false)}
              className={isHomeActive ? 'text-brand-cyan font-bold flex items-center gap-2' : 'hover:text-brand-cyan flex items-center gap-2'}
            >
              <Home className="w-4 h-4" /> {t('home')}
            </Link>
            <Link
              href="/products"
              onClick={() => setMobileMenuOpen(false)}
              className={isProductsActive ? 'text-brand-cyan font-bold flex items-center gap-2' : 'hover:text-brand-cyan flex items-center gap-2'}
            >
              <Grid className="w-4 h-4" /> {t('allProducts')}
            </Link>
            <hr className="border-brand-border/60" />
            <span className="text-[10px] text-subtle font-bold uppercase tracking-wider">{t('motherCategories')}</span>
            {motherCategories.map((cat, index) => {
              const Icon = resolveCategoryIcon(cat.icon);
              const accent = categoryAccent(index);
              const label = lang === 'bn' ? cat.name_bn || cat.name : cat.name;

              return (
                <Link
                  key={cat.id}
                  href={`/products?category=${cat.slug}`}
                  onClick={() => setMobileMenuOpen(false)}
                  className="hover:text-brand-cyan flex items-center gap-2"
                >
                  <Icon className={`w-4 h-4 ${accent.color}`} /> {label}
                </Link>
              );
            })}
            <hr className="border-brand-border/60" />
            <Link
              href="/archive"
              onClick={() => setMobileMenuOpen(false)}
              className={isArchiveActive ? 'text-brand-cyan font-bold flex items-center gap-2' : 'hover:text-brand-cyan flex items-center gap-2'}
            >
              <Archive className="w-4 h-4" /> {t('archive')}
            </Link>
          </nav>
        </div>
      )}
    </div>
  );
}
