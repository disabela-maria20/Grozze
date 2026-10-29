'use client';

import { useQuery } from '@tanstack/react-query';
import { GROZZE_CONTENT_STALE_MS } from '@/shared/api';
import { useAppStore } from '@/shared/store';
import { grozzeMovieOverrides, movieOverridesQueryKey } from './overrides';

/**
 * CMS overrides from the API. On success they're loaded into the store's
 * `content`, which every screen already passes to `movie()`/`allMovies()`.
 */
export function useMovieOverridesQuery() {
  return useQuery({
    queryKey: movieOverridesQueryKey,
    queryFn: async () => {
      const content = await grozzeMovieOverrides.list();
      useAppStore.getState().setContent(content);
      return content;
    },
    staleTime: GROZZE_CONTENT_STALE_MS,
  });
}
