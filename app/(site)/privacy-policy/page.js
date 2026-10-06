'use client';

import ContentPage from '@/components/ContentPage';
import privacyPolicy from '@/lib/content/privacyPolicy';
import { useLanguage } from '@/context/LanguageContext';

export default function PrivacyPolicyPage() {
  const { lang } = useLanguage();
  const page = privacyPolicy[lang] || privacyPolicy.en;

  return (
    <ContentPage title={page.title} subtitle={page.subtitle} sections={page.sections} />
  );
}
