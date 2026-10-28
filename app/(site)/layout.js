import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { SiteInfoProvider } from '@/components/SiteInfoProvider';
import { CategoriesProvider } from '@/components/CategoriesProvider';
import { getSiteInfo } from '@/lib/serverSiteInfo';
import { getCategories } from '@/lib/serverData';

// Storefront content (branding, categories, products) is regenerated at most
// once a minute, so admin edits show up quickly without a redeploy.
export const revalidate = 60;

export default async function SiteLayout({ children }) {
  // Server-render the branding and the category tree so the first paint already
  // matches the database (no flash of the default name, no hydration mismatch)
  // and admins see their changes without touching code.
  const [siteInfo, categories] = await Promise.all([getSiteInfo(), getCategories()]);

  return (
    <SiteInfoProvider value={siteInfo}>
      <CategoriesProvider value={categories}>
        <Header siteInfo={siteInfo} />
        <main className="flex-grow">{children}</main>
        <Footer siteInfo={siteInfo} />
      </CategoriesProvider>
    </SiteInfoProvider>
  );
}
