import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function SiteLayout({ children }) {
  return (
    <>
      <Header />
      <main className="flex-grow">{children}</main>
      <Footer />
    </>
  );
}