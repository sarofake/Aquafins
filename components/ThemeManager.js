'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

export default function ThemeManager() {
  const pathname = usePathname();

  useEffect(() => {
    if (pathname.startsWith('/admin')) {
      document.documentElement.classList.add('light');
    } else {
      document.documentElement.classList.remove('light');
    }
  }, [pathname]);

  return null;
}
