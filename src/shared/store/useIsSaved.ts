'use client';

import { useCallback } from 'react';
import { useAppStore } from './useAppStore';

/**
 * `(id) => boolean` for the account's saved movies or cinemas. Unlike the
 * store's `movieSaved`/`cinemaSaved`, it changes whenever the saved ids do,
 * so components re-render when the session is restored or a heart toggles.
 */
export function useIsSaved(kind: 'movie' | 'cinema') {
  const savedIds = useAppStore((s) =>
    kind === 'movie' ? s.account?.savedMovies : s.account?.savedCinemas
  );
  return useCallback(
    (id: string) => !!savedIds?.includes(String(id)),
    [savedIds]
  );
}
