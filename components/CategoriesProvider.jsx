'use client';

import { createContext, useContext } from 'react';

const CategoriesContext = createContext(null);

/**
 * Carries the server-rendered category tree into every client component
 * (header, footer, catalog, home page). Without it the header/footer chips had
 * to be hardcoded, and admin-created categories never appeared in the nav.
 */
export function CategoriesProvider({ value, children }) {
  return <CategoriesContext.Provider value={value}>{children}</CategoriesContext.Provider>;
}

export function useCategoriesSeed() {
  return useContext(CategoriesContext);
}
