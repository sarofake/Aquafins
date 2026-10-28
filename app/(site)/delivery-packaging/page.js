'use client';

import ContentPage from '@/components/ContentPage';
import deliveryPackaging from '@/lib/content/deliveryPackaging';
import { useLanguage } from '@/context/LanguageContext';
import { useSiteInfo } from '@/hooks/useSiteInfo';

export default function DeliveryPackagingPage() {
  const { lang, t } = useLanguage();
  const { info } = useSiteInfo();
  const page = deliveryPackaging[lang] || deliveryPackaging.en;

  const pick = (enKey, bnKey) =>
    ((lang === 'bn' ? info[bnKey] || info[enKey] : info[enKey]) || '').trim();

  // Admin → Site Info → Delivery & Returns. The template copy above stays as
  // the packaging guide; these two blocks are the operator's own policy and are
  // omitted entirely when the fields are empty.
  const deliveryInfo = pick('delivery_info', 'delivery_info_bn');
  const returnPolicy = pick('return_policy', 'return_policy_bn');

  const policySections = [
    deliveryInfo && { type: 'heading', text: t('deliveryInfoTitle') },
    deliveryInfo && { type: 'paragraph', text: deliveryInfo },
    returnPolicy && { type: 'heading', text: t('returnPolicyTitle') },
    returnPolicy && { type: 'paragraph', text: returnPolicy },
  ].filter(Boolean);

  return (
    <ContentPage
      title={page.title}
      subtitle={page.subtitle}
      sections={[...page.sections, ...policySections]}
    />
  );
}
