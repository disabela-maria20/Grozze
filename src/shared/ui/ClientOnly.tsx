"use client";

import { useEffect, useState, type ReactNode } from "react";

/**
 * Renders children only after the component has mounted in the browser, so
 * the server never renders (and never has to reconcile) markup that depends
 * on localStorage/sessionStorage-derived state (login, favorites, CMS
 * overrides). Equivalent to Astro's `client:only="react"` islands.
 */
export function ClientOnly({ children }: { children: ReactNode }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return null;
  return <>{children}</>;
}
