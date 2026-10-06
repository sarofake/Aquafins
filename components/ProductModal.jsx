'use client';

import { useEffect } from 'react';
import { X } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import ProductDetail from '@/components/ProductDetail';

/**
 * Overlay wrapper around ProductDetail (legacy fallback for products
 * without a slug, plus admin preview). Public catalog cards link to
 * /products/<category>/<slug> instead.
 */
export default function ProductModal({ product, onClose }) {
  const { lang } = useLanguage();

  useEffect(() => {
    if (!product) return;
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

  if (!product) return null;

  const prodName = lang === 'bn' ? (product.name_bn || product.name) : product.name;

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

        <ProductDetail product={product} />
      </div>
    </div>
  );
}
