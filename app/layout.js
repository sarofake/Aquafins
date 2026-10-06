import './globals.css';
import { ThemeProvider } from '@/context/ThemeContext';
import { LanguageProvider } from '@/context/LanguageContext';
import ThemeManager from '@/components/ThemeManager';

export const metadata = {
  title: 'Aqua Fins Bangladesh | Premium Aquatics & Supplies',
  description: 'Discover hand-picked collection of state-of-the-art aquariums, exotic livestock, aquatic plants, and premium supplies across Bangladesh.',
  icons: {
    icon: '/aquafinsbangladesh logo.png',
    shortcut: '/aquafinsbangladesh logo.png',
    apple: '/aquafinsbangladesh logo.png',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="scroll-smooth" suppressHydrationWarning>
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