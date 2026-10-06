'use client';

import ContentPage from '@/components/ContentPage';
import termsAndConditions from '@/lib/content/termsAndConditions';
import { useLanguage } from '@/context/LanguageContext';

export default function TermsAndConditionsPage() {
  const { lang } = useLanguage();
  const page = termsAndConditions[lang] || termsAndConditions.en;

  return (
    <ContentPage title={page.title} subtitle={page.subtitle} sections={page.sections} />
  );
}
