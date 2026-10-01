'use client';

import { useQuery } from '@tanstack/react-query';
import { setCatalog } from '@/shared/lib/catalog';
import { CATALOG_CACHE_SECONDS, getCinemas, getMovies } from './catalog';

export const catalogQueryKey = ['catalog'] as const;

/**
 * Movies and cinemas from the catalog API. On success the data is also
 * loaded into the synchronous catalog resolvers (`movie`, `cinema`...),
 * which is why pages render behind `CatalogGate`.
 */
export function useCatalogQuery() {
  return useQuery({
    queryKey: catalogQueryKey,
    queryFn: async () => {
      const [movies, cinemas] = await Promise.all([getMovies(), getCinemas()]);
      setCatalog({ movies, cinemas });
      return { movies, cinemas };
    },
    staleTime: CATALOG_CACHE_SECONDS * 1000,
  });
}
