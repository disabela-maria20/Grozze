'use client';

import { useQuery } from '@tanstack/react-query';
import { registerCinemas } from '@/shared/lib/catalog';
import { CATALOG_CACHE_SECONDS, getMovieShowtimes } from './catalog';

/** Upcoming sessions of one movie, nationwide (filter them by location). */
export function useMovieShowtimesQuery(movieId: string) {
  return useQuery({
    queryKey: ['catalog', 'showtimes', movieId],
    queryFn: async () => {
      const { rows, cinemas } = await getMovieShowtimes(movieId);
      registerCinemas(cinemas);
      return rows;
    },
    staleTime: CATALOG_CACHE_SECONDS * 1000,
  });
}
