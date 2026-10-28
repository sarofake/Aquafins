'use client';

import { createContext, useContext } from 'react';

const SiteInfoContext = createContext(null);

/**
 * Carries the server-rendered site settings (name, logo, socials, contact) into
 * every client component, so the first paint already shows the deployment's own
 * branding instead of the template defaults.
 */
export function SiteInfoProvider({ value, children }) {
  return <SiteInfoContext.Provider value={value}>{children}</SiteInfoContext.Provider>;
}

export function useSiteInfoSeed() {
  return useContext(SiteInfoContext);
}
