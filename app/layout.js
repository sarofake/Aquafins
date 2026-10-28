import './globals.css';
import { ThemeProvider } from '@/context/ThemeContext';
import { LanguageProvider } from '@/context/LanguageContext';
import ThemeManager from '@/components/ThemeManager';
import { getSiteInfo, brandFromSiteInfo } from '@/lib/serverSiteInfo';

// Branding lives in the database (Admin → Site Info) so every deployment of this
// template shows its own name, logo and favicon. ISR keeps metadata fresh
// without a redeploy after the operator edits those settings; saves also purge
// the cache immediately via revalidatePath().
export const revalidate = 60;

export async function generateMetadata() {
  const info = await getSiteInfo();
  const brand = brandFromSiteInfo(info);

  return {
    title: {
      default: `${brand.name} | ${brand.tagline}`,
      template: `%s | ${brand.name}`,
    },
    description: info.site_description || undefined,
    applicationName: brand.name,
    icons: {
      icon: brand.faviconUrl,
      shortcut: brand.faviconUrl,
      apple: brand.faviconUrl,
    },
    openGraph: {
      title: `${brand.name} | ${brand.tagline}`,
      siteName: brand.name,
      type: 'website',
    },
  };
}

// Accepts #rgb / #rgba / #rrggbb / #rrggbbaa so a stored value can be injected
// into a CSS variable without any chance of breaking out of the declaration.
const COLOR_PATTERN = /^#(?:[0-9a-f]{3,4}|[0-9a-f]{6}|[0-9a-f]{8})$/i;

function themeVariables(info) {
  const primary = String(info?.primary_color || '').trim();
  const secondary = String(info?.secondary_color || '').trim();
  const style = {};

  // These are the same variables the theme uses, so Tailwind's bg-brand-cyan /
  // text-brand-cyan etc. pick the operator's colour up everywhere.
  if (COLOR_PATTERN.test(primary)) style['--brand-cyan'] = primary;
  if (COLOR_PATTERN.test(secondary)) {
    style['--brand-blue'] = secondary;
    style['--brand-accent'] = secondary;
  }

  return style;
}

export default async function RootLayout({ children }) {
  // Currency, colours and branding are per-deployment settings (Admin → Site
  // Info). Rendering the colours into the <html> style means no flash and no
  // extra client request.
  const info = await getSiteInfo();

  return (
    <html
      lang="en"
      className="scroll-smooth"
      style={themeVariables(info)}
      suppressHydrationWarning
    >
      <head>
        {/* Apply saved theme before paint to prevent flash (default: light / white) */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var s=localStorage.getItem('aquafins_theme');if(s==='dark'){document.documentElement.classList.remove('light');}else{document.documentElement.classList.add('light');}}catch(e){}})();`,
          }}
        />
        {/* Google Fonts */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Oswald:wght@600;700&family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body
        className="bg-brand-dark text-main min-h-screen font-sans selection:bg-brand-cyan selection:text-brand-dark flex flex-col justify-between"
        suppressHydrationWarning
      >
        <ThemeProvider>
          <LanguageProvider>
            <ThemeManager />
            {children}
          </LanguageProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}