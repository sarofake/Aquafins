'use client';

import ContentPage from '@/components/ContentPage';
import howToBuy from '@/lib/content/howToBuy';
import { useLanguage } from '@/context/LanguageContext';

export default function HowToBuyPage() {
  const { lang } = useLanguage();
  const page = howToBuy[lang] || howToBuy.en;

  return (
    <ContentPage title={page.title} subtitle={page.subtitle} sections={page.sections} />
  );
}
