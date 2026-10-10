import Hero from '@/components/Hero';
import AnnouncementBanner from '@/components/AnnouncementBanner';
import Categories from '@/components/Categories';
import Featured from '@/components/Featured';
import ContactSection from '@/components/ContactSection';

export default function Home() {
  return (
    <>
      <Hero />
      <AnnouncementBanner />
      <Categories />
      <Featured />
      <ContactSection />
    </>
  );
}