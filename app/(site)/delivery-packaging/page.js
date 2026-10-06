'use client';

import ContentPage from '@/components/ContentPage';
import deliveryPackaging from '@/lib/content/deliveryPackaging';
import { useLanguage } from '@/context/LanguageContext';

export default function DeliveryPackagingPage() {
  const { lang } = useLanguage();
  const page = deliveryPackaging[lang] || deliveryPackaging.en;

  return (
    <ContentPage title={page.title} subtitle={page.subtitle} sections={page.sections} />
  );
}
