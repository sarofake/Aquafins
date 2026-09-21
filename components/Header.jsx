'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { useTheme } from '@/context/ThemeContext';
import { useLanguage } from '@/context/LanguageContext';
import {
  Search,
  Menu,
  X,
  Phone,
  MapPin,
  Home,
  Fish,
  Leaf,
  Utensils,
  Grid,
  Shell,
  Mountain,
  Sun,
  Moon,
  Globe,
  Info,
  Tag,
  Archive,
} from 'lucide-react';

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const { theme, toggleTheme } = useTheme();
  const { lang, toggleLang, t } = useLanguage();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isScrolled, setIsScrolled] = useState(false);

  const isHomeActive = pathname === '/' || pathname === '/home';
  const isAboutActive = pathname === '/about';
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
              {/* Left Side: Only WhatsApp & Facebook Icon Redirect Buttons */}
              <div className="flex items-center gap-2.5">
                {/* WhatsApp Icon */}
                <a
                  href="https://wa.me/8801787283804"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-7 h-7 rounded-full bg-[#25D366]/15 hover:bg-[#25D366] text-[#25D366] hover:text-white border border-[#25D366]/40 flex items-center justify-center transition-all shadow-sm hover:scale-110"
                  title="WhatsApp (01787-283804)"
                  aria-label="WhatsApp"
                >
                  <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                    <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-1.107 4.043 4.143-1.085z" />
                  </svg>
                </a>

                {/* Facebook Icon */}
                <a
                  href="https://www.facebook.com/aquafinsbangladesh/"
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
              </div>

              {/* Right Side: Hotline & Location */}
              <div className="flex items-center gap-4 text-xs">
                <a
                  href="tel:01787283804"
                  className="flex items-center gap-1.5 text-main font-medium hover:text-brand-cyan transition-colors"
                >
                  <Phone className="w-3.5 h-3.5 text-brand-cyan" />
                  <span>{t('hotline')}: <strong className="text-brand-cyan">01787-283804</strong></span>
                </a>
                <span className="text-brand-border hidden sm:inline">|</span>
                <div className="hidden sm:flex items-center gap-1.5 text-muted">
                  <MapPin className="w-3.5 h-3.5 text-brand-cyan flex-shrink-0" />
                  <span>{t('dhakaBangladesh')}</span>
                </div>
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
                  <Image
                    src="/aquafinsbangladesh logo.png"
                    alt="Aqua Fins Bangladesh Logo"
                    width={44}
                    height={44}
                    className="w-full h-full object-contain rounded-full"
                    priority
                  />
                </div>
                <div className="flex flex-col">
                  <span className="font-display tracking-wider text-2xl font-bold text-main group-hover:text-brand-cyan transition-colors leading-none">
                    AQUA FINS
                  </span>
                  <span className="text-[10px] tracking-widest text-brand-cyan uppercase font-bold">
                    BANGLADESH
                  </span>
                </div>
              </Link>

              {/* Home & About links right after logo */}
              <Link
                href="/"
                className={`hidden sm:flex items-center gap-2 bg-brand-card hover:bg-brand-border/60 px-4 py-2.5 rounded-full border border-brand-border hover:border-brand-cyan/50 transition-all shadow-sm ${
                  isHomeActive ? 'text-brand-cyan font-bold' : 'text-main'
                }`}
                title={t('home')}
              >
                <Home className="w-4 h-4" />
                <span className="text-xs font-bold">{t('home')}</span>
              </Link>

              <Link
                href="/about"
                className={`hidden sm:flex items-center gap-2 bg-brand-card hover:bg-brand-border/60 px-4 py-2.5 rounded-full border border-brand-border hover:border-brand-cyan/50 transition-all shadow-sm ${
                  isAboutActive ? 'text-brand-cyan font-bold' : 'text-main'
                }`}
                title={t('about')}
              >
                <Info className="w-4 h-4" />
                <span className="text-xs font-bold">{t('about')}</span>
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
                  className="absolute right-1.5 top-1/2 -translate-y-1/2 bg-brand-cyan text-brand-dark p-2 rounded-full hover:bg-white transition-colors cursor-pointer"
                  title="Search"
                >
                  <Search className="w-3.5 h-3.5" />
                </button>
              </form>

              {/* Right Actions: Theme & Language Switcher Side by Side */}
              <div className="flex items-center gap-2.5">
                {/* Theme Toggle Button */}
                <button
                  onClick={toggleTheme}
                  className="relative flex items-center gap-2 bg-brand-card hover:bg-brand-border/60 text-brand-cyan px-3.5 py-2 rounded-full border border-brand-border hover:border-brand-cyan/50 transition-all cursor-pointer shadow-sm"
                  title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
                  aria-label="Toggle dark/light theme"
                >
                  {theme === 'dark' ? (
                    <Sun className="w-4 h-4 text-brand-cyan" />
                  ) : (
                    <Moon className="w-4 h-4 text-brand-cyan" />
                  )}
                  <span className="hidden sm:inline text-xs font-bold text-main">
                    {theme === 'dark' ? 'Light' : 'Dark'}
                  </span>
                </button>

                {/* Language Switcher Button - RIGHT BESIDE Theme button */}
                <button
                  onClick={toggleLang}
                  className="relative flex items-center gap-1.5 bg-brand-card hover:bg-brand-border/60 text-brand-cyan px-3.5 py-2 rounded-full border border-brand-border hover:border-brand-cyan/50 transition-all cursor-pointer shadow-sm text-xs font-bold"
                  title={lang === 'bn' ? 'Switch to English' : 'বাংলায় পরিবর্তন করুন'}
                  aria-label="Toggle language"
                >
                  <Globe className="w-4 h-4 text-brand-cyan" />
                  <span className="text-main font-extrabold">{lang === 'bn' ? 'বাংলা' : 'ENG'}</span>
                </button>

                {/* Offer & Deals Button - RIGHT BESIDE Language button */}
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
              <Image
                src="/aquafinsbangladesh logo.png"
                alt="Logo"
                width={30}
                height={30}
                className="rounded-full border border-brand-cyan/40"
              />
              <span className="font-display font-bold text-main text-base tracking-wider">AQUA FINS</span>
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

            <span className="text-brand-border">|</span>

            <Link
              href="/products?category=plants"
              className="hover:text-brand-cyan transition-colors flex items-center gap-1.5 text-muted"
            >
              <Leaf className="w-3.5 h-3.5 text-green-400" /> {t('plants')}
            </Link>

            <Link
              href="/products?category=fish"
              className="hover:text-brand-cyan transition-colors flex items-center gap-1.5 text-muted"
            >
              <Fish className="w-3.5 h-3.5 text-brand-cyan" /> {t('fish')}
            </Link>

            <Link
              href="/products?category=livestock"
              className="hover:text-brand-cyan transition-colors flex items-center gap-1.5 text-muted"
            >
              <Shell className="w-3.5 h-3.5 text-purple-400" /> {t('livestock')}
            </Link>

            <Link
              href="/products?category=food-accessories"
              className="hover:text-brand-cyan transition-colors flex items-center gap-1.5 text-muted"
            >
              <Utensils className="w-3.5 h-3.5 text-yellow-400" /> {t('foodAccessories')}
            </Link>

            <Link
              href="/products?category=scaping"
              className="hover:text-brand-cyan transition-colors flex items-center gap-1.5 text-muted"
            >
              <Mountain className="w-3.5 h-3.5 text-amber-400" /> {t('scaping')}
            </Link>

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
            <Link
              href="/products?category=plants"
              onClick={() => setMobileMenuOpen(false)}
              className="hover:text-brand-cyan flex items-center gap-2"
            >
              <Leaf className="w-4 h-4 text-green-400" /> {t('plants')}
            </Link>
            <Link
              href="/products?category=fish"
              onClick={() => setMobileMenuOpen(false)}
              className="hover:text-brand-cyan flex items-center gap-2"
            >
              <Fish className="w-4 h-4 text-brand-cyan" /> {t('fish')}
            </Link>
            <Link
              href="/products?category=livestock"
              onClick={() => setMobileMenuOpen(false)}
              className="hover:text-brand-cyan flex items-center gap-2"
            >
              <Shell className="w-4 h-4 text-purple-400" /> {t('livestock')}
            </Link>
            <Link
              href="/products?category=food-accessories"
              onClick={() => setMobileMenuOpen(false)}
              className="hover:text-brand-cyan flex items-center gap-2"
            >
              <Utensils className="w-4 h-4 text-yellow-400" /> {t('foodAccessories')}
            </Link>
            <Link
              href="/products?category=scaping"
              onClick={() => setMobileMenuOpen(false)}
              className="hover:text-brand-cyan flex items-center gap-2"
            >
              <Mountain className="w-4 h-4 text-amber-400" /> {t('scaping')}
            </Link>
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
