'use client';

import { useEffect } from 'react';
import {
  GROZZE_API_KEY,
  GrozzeApiError,
  grozzeAuth,
  setSessionLostHandler,
} from '@/shared/api';
import { useAppStore } from '@/shared/store';

/** Another tab may be renewing the same session; its new cookie lands by then. */
const RETRY_DELAY_MS = 1000;

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Restores the login on page load from the httpOnly refresh cookie (the
 * access token is kept in memory only, so it never survives a reload).
 * Renders nothing.
 */
export function SessionBootstrap() {
  useEffect(() => {
    const store = useAppStore.getState();
    setSessionLostHandler(() => useAppStore.getState().sessionExpired());

    if (!GROZZE_API_KEY) {
      store.restoreSession(null);
      return;
    }

    let cancelled = false;
    const restore = async () => {
      try {
        return await grozzeAuth.restore();
      } catch (err) {
        if (!(err instanceof GrozzeApiError) || err.status !== 401) throw err;
        await wait(RETRY_DELAY_MS);
        return grozzeAuth.restore();
      }
    };
    restore()
      .then((user) => !cancelled && store.restoreSession(user))
      .catch(() => !cancelled && store.restoreSession(null));
    return () => {
      cancelled = true;
    };
  }, []);

  return null;
}
