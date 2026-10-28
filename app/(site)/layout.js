import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { SiteInfoProvider } from '@/components/SiteInfoProvider';
import { getSiteInfo } from '@/lib/serverSiteInfo';

export default async function SiteLayout({ children }) {
  // Server-render the branding so the first paint already matches the database
  // (no flash of the default name, no hydration mismatch) and admins see their
  // changes without touching code.
  const siteInfo = await getSiteInfo();

  return (
    <SiteInfoProvider value={siteInfo}>
      <Header siteInfo={siteInfo} />
      <main className="flex-grow">{children}</main>
      <Footer siteInfo={siteInfo} />
    </SiteInfoProvider>
  );
}
