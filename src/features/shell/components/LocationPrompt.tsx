'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import { allCinemas } from '@/entities/cinema';
import { ipLocation } from '@/shared/api';
import { useAppStore } from '@/shared/store';

/** Longest wait for the catalog and the IP guess before asking anyway. */
const MAX_WAIT_MS = 6000;
const POLL_MS = 250;

/** Resolves once the cinema catalog has loaded (or after `MAX_WAIT_MS`). */
function catalogReady(): Promise<void> {
  return new Promise((resolve) => {
    const started = Date.now();
    const check = () => {
      if (allCinemas().length || Date.now() - started > MAX_WAIT_MS) resolve();
      else setTimeout(check, POLL_MS);
    };
    check();
  });
}

/**
 * On the first visit, asks once where the user goes to the movies (their
 * position or a city picked by hand). Closing the dialog keeps the default
 * city; it isn't asked again. Renders nothing.
 *
 * The dialog opens only after the catalog and the IP guess are in: opening
 * first and then adding the "you seem to be near…" line moved the whole
 * dialog (a large layout shift for PageSpeed and a jump for the user).
 */
export function LocationPrompt() {
  const pathname = usePathname();
  const queryClient = useQueryClient();

  useEffect(() => {
    // The CMS doesn't depend on the location
    if (pathname.startsWith('/admin')) return;
    let cancelled = false;

    const ask = async () => {
      if (useAppStore.getState().locationAsked) return;
      await Promise.all([
        catalogReady(),
        // Same query the dialog reads, so it opens with the answer cached
        queryClient
          .fetchQuery({
            queryKey: ['ip-location'],
            queryFn: ipLocation,
            staleTime: Infinity,
            retry: false,
          })
          .catch(() => null),
      ]);
      const state = useAppStore.getState();
      if (cancelled || state.locationAsked || state.dialog) return;
      state.markLocationAsked();
      state.openDialog('location');
    };

    if (useAppStore.persist.hasHydrated()) void ask();
    else {
      const unsubscribe = useAppStore.persist.onFinishHydration(
        () => void ask()
      );
      return () => {
        cancelled = true;
        unsubscribe();
      };
    }
    return () => {
      cancelled = true;
    };
  }, [pathname, queryClient]);

  return null;
}
