'use client';

import { useQuery } from '@tanstack/react-query';
import { registerCinemas } from '@/entities/cinema';
import { CATALOG_CACHE_SECONDS } from '@/shared/api';
import { getMovieShowtimes } from '@/entities/movie';

/** One cinema on one day (`/api/movies/showtimes/{id}/date/{date}/cinema/{cinemaId}`). */
export interface ShowtimesScope {
  date: string;
  cinemaId: string;
}

/**
 * Upcoming sessions of one movie: nationwide by default (filter them by
 * location), or just one cinema on one day when `only` is given. `only:
 * null` keeps the query idle.
 */
export function useMovieShowtimesQuery(
  movieId: string,
  only?: ShowtimesScope | null
) {
  return useQuery({
    queryKey: ['catalog', 'showtimes', movieId, only?.date, only?.cinemaId],
    queryFn: async () => {
      const { rows, cinemas } = await getMovieShowtimes(
        movieId,
        only ?? undefined
      );
      registerCinemas(cinemas);
      return rows;
    },
    enabled: only !== null,
    staleTime: CATALOG_CACHE_SECONDS * 1000,
  });
}
