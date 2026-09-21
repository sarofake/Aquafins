'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { ShoppingCart, ChevronLeft, ChevronRight, Compass } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

export default function Hero() {
  const canvasRef = useRef(null);
  const { lang, t } = useLanguage();
  const [slides, setSlides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);

  // Fetch dynamic hero slides from API
  useEffect(() => {
    let active = true;
    fetch('/api/hero')
      .then((r) => r.json())
      .then((data) => {
        if (active) {
          setSlides(data.slides || []);
          setLoading(false);
        }
      })
      .catch(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  // Auto slide timer
  useEffect(() => {
    if (slides.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % slides.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [slides.length]);

  // Bubble animation background canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = (canvas.width = canvas.parentElement?.offsetWidth || window.innerWidth);
    let height = (canvas.height = canvas.parentElement?.offsetHeight || 600);

    const handleResize = () => {
      if (canvas.parentElement) {
        width = canvas.width = canvas.parentElement.offsetWidth;
        height = canvas.height = canvas.parentElement.offsetHeight;
      }
    };
    window.addEventListener('resize', handleResize);

    const bubbles = [];
    const maxBubbles = 25;

    class Bubble {
      constructor() {
        this.reset();
        this.y = Math.random() * height;
      }

      reset() {
        this.x = Math.random() * width;
        this.y = height + Math.random() * 20;
        this.radius = Math.random() * 5 + 2;
        this.speed = Math.random() * 1.0 + 0.3;
        this.opacity = Math.random() * 0.3 + 0.1;
        this.wobble = Math.random() * 0.5;
        this.wobbleSpeed = Math.random() * 0.02 + 0.01;
      }

      update() {
        this.y -= this.speed;
        this.x += Math.sin(this.y * this.wobbleSpeed) * this.wobble;
        if (this.y < -10) {
          this.reset();
        }
      }

      draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(0, 242, 254, ${this.opacity})`;
        ctx.lineWidth = 1;
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(this.x - this.radius / 3, this.y - this.radius / 3, this.radius / 5, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${this.opacity * 0.8})`;
        ctx.fill();
      }
    }

    for (let i = 0; i < maxBubbles; i++) {
      bubbles.push(new Bubble());
    }

    let animationId;
    function animate() {
      ctx.clearRect(0, 0, width, height);
      bubbles.forEach((b) => {
        b.update();
        b.draw();
      });
      animationId = requestAnimationFrame(animate);
    }

    animate();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationId);
    };
  }, []);

  const currentSlide = slides[currentIndex] || {};

  // Localized field selectors - strictly use admin data when slides exist
  const displayTitle =
    lang === 'bn'
      ? currentSlide.title_bn || currentSlide.title || ''
      : currentSlide.title || '';

  const displaySubtitle =
    lang === 'bn'
      ? currentSlide.subtitle_bn || currentSlide.subtitle || ''
      : currentSlide.subtitle || '';

  const displayBadge =
    lang === 'bn'
      ? currentSlide.badge_bn || currentSlide.badge || ''
      : currentSlide.badge || '';

  const displayButtonText =
    lang === 'bn'
      ? currentSlide.button_text_bn || currentSlide.button_text || (lang === 'bn' ? 'অর্ডার করুন' : 'Shop Catalog')
      : currentSlide.button_text || 'Shop Catalog';

  if (loading) {
    return (
      <section className="relative w-full min-h-[65vh] lg:h-[70vh] border-b border-brand-border/50 overflow-hidden bg-brand-dark flex items-center justify-center">
        <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none z-0" />
        <div className="w-12 h-12 rounded-full border-2 border-brand-cyan/30 border-t-brand-cyan animate-spin" />
      </section>
    );
  }

  if (slides.length === 0) {
    return null;
  }

  return (
    <section
      id="hero-ripple-section"
      className="relative w-full min-h-[65vh] lg:h-[70vh] border-b border-brand-border/50 overflow-hidden bg-brand-dark transition-all duration-700"
      style={{
        backgroundImage: currentSlide?.image
          ? `linear-gradient(to right, var(--hero-overlay-start, rgba(3,9,20,0.95)), var(--hero-overlay-mid, rgba(3,9,20,0.65)), rgba(3,9,20,0.2)), url('${currentSlide.image}')`
          : `linear-gradient(135deg, var(--hero-overlay-start, rgba(3,9,20,0.95)), var(--hero-overlay-mid, rgba(10,25,47,0.85)))`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      {/* Bubble canvas overlay */}
      <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none z-0" />

      {/* Slide Content */}
      <div className="relative max-w-7xl mx-auto h-full px-4 lg:px-12 py-16 flex flex-col justify-center z-10">
        <div className="max-w-2xl">
          {displayBadge && (
            <span className="text-brand-cyan font-bold tracking-widest uppercase text-xs mb-3 inline-block px-3 py-1 rounded-full bg-brand-cyan/10 border border-brand-cyan/30 backdrop-blur-sm">
              {displayBadge}
            </span>
          )}
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-display font-bold text-main mb-6 leading-tight">
            {displayTitle}
          </h1>
          <p className="text-muted mb-8 text-sm sm:text-base leading-relaxed max-w-xl">
            {displaySubtitle}
          </p>
          <div className="flex flex-wrap gap-4">
            <Link
              href={currentSlide.button_link || '/products'}
              className="bg-brand-cyan text-brand-dark px-8 py-3.5 rounded-full font-bold hover:bg-white transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-brand-cyan/20"
            >
              {displayButtonText} <ShoppingCart className="w-4 h-4" />
            </Link>
            <Link
              href="/products"
              className="bg-black/40 border border-brand-cyan/50 text-white px-8 py-3.5 rounded-full font-bold hover:bg-brand-cyan/20 transition-all flex items-center justify-center gap-2 cursor-pointer backdrop-blur-sm"
            >
              {t('exploreCategories')} <Compass className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>

      {/* Controls & Indicators */}
      {slides.length > 1 && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex items-center gap-4 bg-black/50 px-4 py-2 rounded-full border border-brand-border/60 backdrop-blur-md">
          <button
            onClick={() => setCurrentIndex((prev) => (prev - 1 + slides.length) % slides.length)}
            className="text-white/70 hover:text-brand-cyan p-1 transition-colors cursor-pointer"
            title="Previous slide"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2">
            {slides.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentIndex(idx)}
                className={`h-2 rounded-full transition-all cursor-pointer ${
                  idx === currentIndex ? 'w-8 bg-brand-cyan' : 'w-2 bg-white/30 hover:bg-white/60'
                }`}
              />
            ))}
          </div>

          <button
            onClick={() => setCurrentIndex((prev) => (prev + 1) % slides.length)}
            className="text-white/70 hover:text-brand-cyan p-1 transition-colors cursor-pointer"
            title="Next slide"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      )}
    </section>
  );
}
