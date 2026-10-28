'use client';

import { X, Phone, ExternalLink } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { useBrand, useContactInfo, useSocialLinks } from '@/hooks/useSiteInfo';
import { useCategories } from '@/hooks/useCategories';
import { formatPrice } from '@/lib/currency';
import FormattedText from '@/components/FormattedText';

export default function OrderModal({ product, onClose }) {
  const { lang, t } = useLanguage();
  const { categories } = useCategories();
  if (!product) return null;

  // Category names live in the database now, so an admin rename must win over
  // the template translation.
  const categoryLabel = (() => {
    const cat = categories.find(
      (c) => c.slug === product.category || String(c.id) === String(product.category_id)
    );
    if (!cat) return product.category || '';
    return lang === 'bn' ? cat.name_bn || cat.name : cat.name;
  })();

  const prodName = lang === 'bn' ? (product.name_bn || product.name) : product.name;
  const prodQty = lang === 'bn' ? (product.quantity_bn || product.quantity) : product.quantity;
  const prodDesc = lang === 'bn' ? (product.description_bn || product.description) : product.description;

  const whatsappText = lang === 'bn'
    ? `হ্যালো ${brand.name}! আমি এই পণ্যটি অর্ডার করতে চাই:

🆔 *পণ্য আইডি:* #${product.id || 'N/A'}
📦 *পণ্য:* ${prodName}
💰 *মূল্য:* ${formatPrice(product.price)}
📁 *ক্যাটাগরি:* ${product.category || 'অ্যাকোয়ারিয়াম'}

দয়া করে স্টক ও ডেলিভারির বিস্তারিত জানান।`
    : `Hello ${brand.name}! I would like to order:

🆔 *Product ID:* #${product.id || 'N/A'}
📦 *Product:* ${prodName}
💰 *Price:* ${formatPrice(product.price)}
📁 *Category:* ${product.category || 'Aquatics'}

Please let me know availability and delivery details.`;

  const whatsappUrl = `${socials.whatsapp}?text=${encodeURIComponent(whatsappText)}`;
  const messengerUrl = socials.messenger || socials.facebook;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-md bg-brand-card border border-brand-border rounded-2xl shadow-2xl overflow-hidden p-6 text-main">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 text-muted hover:text-main bg-brand-dark rounded-full border border-brand-border hover:border-brand-cyan/50 transition-all cursor-pointer"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="mb-5">
          <span className="text-brand-cyan text-xs font-bold uppercase tracking-wider block mb-1">
            {t('orderProduct')}
          </span>
          <h3 className="text-xl font-bold text-main font-display">
            {t('sendOrderRequest')}
          </h3>
        </div>

        {/* Product Card Details */}
        <div className="flex gap-4 p-3.5 bg-brand-dark border border-brand-border rounded-xl mb-4 items-center">
          {product.image && (
            <img
              src={product.image}
              alt={prodName}
              className="w-16 h-16 object-cover rounded-lg border border-brand-border flex-shrink-0"
            />
          )}
          <div className="flex-1 min-w-0">
            <h4 className="font-bold text-sm text-main truncate">{prodName} {prodQty && <span className="text-xs text-muted font-normal">({prodQty})</span>}</h4>
            <p className="text-xs text-muted truncate">{categoryLabel || t('allProducts')}</p>
            <p className="text-sm font-extrabold text-brand-cyan mt-1">{formatPrice(product.price)}</p>
          </div>
        </div>

        {prodDesc && (
          <div className="p-3 bg-brand-dark/50 border border-brand-border/60 rounded-xl mb-6 text-xs text-muted max-h-36 overflow-y-auto">
            <FormattedText text={prodDesc} />
          </div>
        )}

        <p className="text-xs text-muted mb-4 text-center">
          {t('chooseWhereToSend')}
        </p>

        {/* Ordering Action Buttons */}
        <div className="flex flex-col gap-2.5">
          {/* Send in WhatsApp */}
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={onClose}
            className="flex items-center justify-center gap-2.5 bg-[#25D366] hover:bg-[#20ba5a] text-white font-bold py-2.5 sm:py-3 px-4 rounded-xl shadow-md transition-all hover:scale-[1.01] active:scale-[0.98] text-xs sm:text-sm"
          >
            <svg className="w-4 h-4 sm:w-5 sm:h-5 fill-current shrink-0" viewBox="0 0 24 24">
              <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-1.107 4.043 4.143-1.085z" />
            </svg>
            <span>{t('sendInWhatsapp')}</span>
          </a>

          {/* Send in Messenger */}
          <a
            href={messengerUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={onClose}
            className="flex items-center justify-center gap-2.5 bg-[#0084FF] hover:bg-[#0073e6] text-white font-bold py-2.5 sm:py-3 px-4 rounded-xl shadow-md transition-all hover:scale-[1.01] active:scale-[0.98] text-xs sm:text-sm"
          >
            <svg className="w-4 h-4 sm:w-5 sm:h-5 fill-current shrink-0" viewBox="0 0 24 24">
              <path d="M12 0C5.373 0 0 4.974 0 11.111c0 3.498 1.744 6.614 4.469 8.654V24l4.088-2.242c1.092.302 2.25.464 3.443.464 6.627 0 12-4.975 12-11.111C24 4.974 18.627 0 12 0zm1.191 14.963l-3.055-3.26-5.963 3.26 6.559-6.963 3.13 3.26 5.888-3.26-6.559 6.963z" />
            </svg>
            <span>{t('sendInMessenger')}</span>
          </a>

          {/* Facebook Page Link */}
          <a
            href={socials.facebook}
            target="_blank"
            rel="noopener noreferrer"
            onClick={onClose}
            className="flex items-center justify-center gap-2 bg-brand-dark hover:bg-brand-border text-muted hover:text-main font-semibold py-2 px-4 rounded-xl border border-brand-border text-xs transition-colors"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>{t('visitFacebookPage')}</span>
          </a>

          {/* Direct Call Hotline */}
          <a
            href="tel:01787283804"
            onClick={onClose}
            className="flex items-center justify-center gap-2 text-xs text-muted hover:text-brand-cyan pt-1 transition-colors"
          >
            <Phone className="w-3.5 h-3.5" /> {t('callHotline')}
          </a>
        </div>
      </div>
    </div>
  );
}
