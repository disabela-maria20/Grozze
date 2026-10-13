'use client';

import { useQuery } from '@tanstack/react-query';
import { registerCinemas } from '@/entities/cinema';
import { CATALOG_CACHE_SECONDS } from '@/shared/api';
import { getMovieShowtimes } from '@/entities/movie';

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
