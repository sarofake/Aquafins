'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { Megaphone, ArrowRight, X, Sparkles } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { useSiteInfo, useBrand } from '@/hooks/useSiteInfo';
import { brandify } from '@/lib/brandText';

export default function AnnouncementBanner() {
  const { lang } = useLanguage();
  const { info, loading } = useSiteInfo();
  const brand = useBrand();
  const [dismissed, setDismissed] = useState(false);
  const containerRef = useRef(null);
  const textRef = useRef(null);
  const [isOverflowing, setIsOverflowing] = useState(false);

  // Announcement data from site_info
  const isEnabled = info.announcement_enabled !== 'false';
  const textEn = info.announcement_text || info.announcement || '';
  const textBn = info.announcement_text_bn || info.announcement_bn || '';
  const activeText = brandify(
    lang === 'bn' ? (textBn || textEn) : (textEn || textBn),
    brand.name
  );
  const linkUrl = info.announcement_link || '';
  const badgeText = lang === 'bn'
    ? (info.announcement_badge_bn || info.announcement_badge || 'বিজ্ঞপ্তি')
    : (info.announcement_badge || 'ANNOUNCEMENT');

  // Check if session previously dismissed this specific announcement text
  useEffect(() => {
    if (!activeText) return;
    try {
      const dismissedHash = sessionStorage.getItem('af_announcement_dismissed');
      if (dismissedHash === activeText) {
        setDismissed(true);
      } else {
        setDismissed(false);
      }
    } catch {
      // Ignore sessionStorage issues
    }
  }, [activeText]);

  // Check if text overflows container or is naturally long enough to rotate/scroll
  useEffect(() => {
    if (!activeText) return;
    const checkOverflow = () => {
      if (textRef.current && containerRef.current) {
        const textWidth = textRef.current.scrollWidth;
        const containerWidth = containerRef.current.clientWidth;
        // If text is wider than container OR longer than 65 characters, enable rotation
        setIsOverflowing(textWidth > containerWidth - 40 || activeText.length > 65);
      }
    };

    checkOverflow();
    window.addEventListener('resize', checkOverflow);
    return () => window.removeEventListener('resize', checkOverflow);
  }, [activeText]);

  const handleDismiss = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDismissed(true);
    try {
      sessionStorage.setItem('af_announcement_dismissed', activeText);
    } catch {
      // Ignore
    }
  };

  if (loading || !isEnabled || !activeText || dismissed) {
    return null;
  }

  // Split multiple announcements if user separated by ' | ' or ' • '
  const items = activeText.split(/\s+[|•]\s+/).filter(Boolean);

  return (
    <div className="relative z-20 w-full bg-gradient-to-r from-brand-card via-brand-dark to-brand-card border-y border-brand-cyan/20 backdrop-blur-md shadow-md shadow-brand-cyan/5 transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 py-2.5 flex items-center justify-between gap-3">
        {/* Left Badge with Icon */}
        <div className="shrink-0 flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold tracking-wider bg-brand-cyan/15 text-brand-cyan border border-brand-cyan/30 shadow-sm animate-pulse">
            <Megaphone className="w-3.5 h-3.5" />
            <span className="uppercase">{badgeText}</span>
          </span>
        </div>

        {/* Center Content: Static or Scrolling Marquee */}
        <div ref={containerRef} className="flex-1 overflow-hidden relative mx-2">
          {isOverflowing ? (
            <div className="animate-marquee-slow flex items-center whitespace-nowrap group">
              {/* Repeated twice for a seamless infinite rotating loop */}
              {[1, 2].map((loopIdx) => (
                <div key={loopIdx} className="flex items-center space-x-12 pr-12">
                  {items.map((item, idx) => (
                    <span key={idx} className="text-xs sm:text-sm font-medium text-main flex items-center gap-2">
                      {idx > 0 && <Sparkles className="w-3 h-3 text-brand-cyan/60 shrink-0" />}
                      <span>{item}</span>
                    </span>
                  ))}
                  {/* Single fallback if not split */}
                  {items.length === 0 && (
                    <span className="text-xs sm:text-sm font-medium text-main">
                      {activeText}
                    </span>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center sm:text-left">
              <span ref={textRef} className="text-xs sm:text-sm font-medium text-main inline-block">
                {activeText}
              </span>
            </div>
          )}
        </div>

        {/* Right Action: Optional Link & Dismiss */}
        <div className="shrink-0 flex items-center gap-2">
          {linkUrl && (
            <Link
              href={linkUrl}
              className="hidden sm:inline-flex items-center gap-1 text-xs font-bold text-brand-cyan hover:text-white hover:underline transition-colors shrink-0 bg-brand-cyan/10 hover:bg-brand-cyan/20 px-3 py-1 rounded-lg border border-brand-cyan/20"
            >
              <span>{lang === 'bn' ? 'বিস্তারিত দেখুন' : 'Explore'}</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          )}

          <button
            onClick={handleDismiss}
            aria-label="Close announcement"
            className="p-1 rounded-lg text-muted hover:text-main hover:bg-brand-card border border-transparent hover:border-brand-border transition-colors cursor-pointer"
            title="Dismiss"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
