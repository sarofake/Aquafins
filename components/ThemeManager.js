'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

export default function ThemeManager() {
  const pathname = usePathname();

  useEffect(() => {
    if (pathname.startsWith('/admin')) {
      document.documentElement.classList.add('light');
    } else {
      const saved = localStorage.getItem('aquafins_theme');
      if (saved === 'dark') {
        document.documentElement.classList.remove('light');
      } else {
        document.documentElement.classList.add('light');
      }
    }
  }, [pathname]);

  return null;
}
