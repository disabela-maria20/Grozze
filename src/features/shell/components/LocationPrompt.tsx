'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { useAppStore } from '@/shared/store';

/**
 * On the first visit, asks once where the user goes to the movies (their
 * position or a city picked by hand). Closing the dialog keeps the default
 * city; it isn't asked again. Renders nothing.
 */
export function LocationPrompt() {
  const pathname = usePathname();

  useEffect(() => {
    // The CMS doesn't depend on the location
    if (pathname.startsWith('/admin')) return;
    const ask = () => {
      const state = useAppStore.getState();
      if (state.locationAsked || state.dialog) return;
      state.markLocationAsked();
      state.openDialog('location');
    };
    if (useAppStore.persist.hasHydrated()) ask();
    else return useAppStore.persist.onFinishHydration(ask);
  }, [pathname]);

  return null;
}
