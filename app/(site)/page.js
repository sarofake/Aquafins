import Hero from '@/components/Hero';
import AnnouncementBanner from '@/components/AnnouncementBanner';
import Categories from '@/components/Categories';
import Featured from '@/components/Featured';
import ContactSection from '@/components/ContactSection';
import { getHeroSlides } from '@/lib/serverData';

export default async function Home() {
  const heroSlides = await getHeroSlides();

  return (
    <>
      <Hero initialSlides={heroSlides} />
      <AnnouncementBanner />
      <Categories />
      <Featured />
      <ContactSection />
    </>
  );
}
