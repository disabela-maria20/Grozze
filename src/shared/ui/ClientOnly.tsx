'use client';

import { useSyncExternalStore, type ReactNode } from 'react';

const noopSubscribe = () => () => {};

/**
 * Renders children only after the component has mounted in the browser, so
 * the server never renders (and never has to reconcile) markup that depends
 * on localStorage/sessionStorage-derived state (login, favorites, CMS
 * overrides). Equivalent to Astro's `client:only="react"` islands.
 */
export function ClientOnly({ children }: { children: ReactNode }) {
  const mounted = useSyncExternalStore(
    noopSubscribe,
    () => true,
    () => false
  );
  if (!mounted) return null;
  return <>{children}</>;
}
