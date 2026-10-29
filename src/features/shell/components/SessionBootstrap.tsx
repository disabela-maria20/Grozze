'use client';

import { useEffect } from 'react';
import {
  GROZZE_API_KEY,
  grozzeAuth,
  setSessionLostHandler,
} from '@/shared/api';
import { useAppStore } from '@/shared/store';

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
    grozzeAuth
      .restore()
      .then((user) => !cancelled && store.restoreSession(user))
      .catch(() => !cancelled && store.restoreSession(null));
    return () => {
      cancelled = true;
    };
  }, []);

  return null;
}
