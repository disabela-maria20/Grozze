'use client';

import { useQuery } from '@tanstack/react-query';
import { setCinemas, getCinemas } from '@/entities/cinema';
import { setMovies, getMovies } from '@/entities/movie';
import { CATALOG_CACHE_SECONDS } from '@/shared/api';

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
      setMovies(movies);
      setCinemas(cinemas);
      return { movies, cinemas };
    },
    staleTime: CATALOG_CACHE_SECONDS * 1000,
  });
}
