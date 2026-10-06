import Hero from '@/components/Hero';
import Categories from '@/components/Categories';
import Featured from '@/components/Featured';
import ContactSection from '@/components/ContactSection';

export default function Home() {
  return (
    <>
      <Hero />
      <Categories />
      <Featured />
      <ContactSection />
    </>
  );
}