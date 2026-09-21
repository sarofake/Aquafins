'use client';

import { createContext, useContext, useEffect, useState, useCallback } from 'react';

const STORAGE_KEY = 'aquafins_theme';

const ThemeContext = createContext({ theme: 'auto', resolvedTheme: 'dark', toggleTheme: () => {} });

function deviceTheme() {
  if (typeof window === 'undefined') return 'dark';
  return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
}

function resolveTheme(mode) {
  return mode === 'auto' ? deviceTheme() : mode;
}

function applyTheme(mode) {
  if (typeof document === 'undefined') return;
  document.documentElement.classList.toggle('light', resolveTheme(mode) === 'light');
}

function loadSavedTheme() {
  if (typeof window === 'undefined') return 'auto';
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === 'light' || saved === 'dark' || saved === 'auto') return saved;
  } catch {}
  return 'auto';
}

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState('auto');
  const [resolvedTheme, setResolvedTheme] = useState('dark');

  useEffect(() => {
    const saved = loadSavedTheme();
    setTheme(saved);
    setResolvedTheme(resolveTheme(saved));
    applyTheme(saved);

    const mq = window.matchMedia('(prefers-color-scheme: light)');
    const onChange = () => {
      setTheme((current) => {
        if (current === 'auto') {
          setResolvedTheme(deviceTheme());
          applyTheme('auto');
        }
        return current;
      });
    };
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme((prev) => {
      const next = prev === 'auto' ? 'light' : prev === 'light' ? 'dark' : 'auto';
      applyTheme(next);
      setResolvedTheme(resolveTheme(next));
      try { localStorage.setItem(STORAGE_KEY, next); } catch {}
      return next;
    });
  }, []);

  return (
    <ThemeContext.Provider value={{ theme, resolvedTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);
