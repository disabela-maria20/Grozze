'use client';

import { useQuery } from '@tanstack/react-query';
import { registerCinemas } from '@/entities/cinema';
import { CATALOG_CACHE_SECONDS } from '@/shared/api';
import { getMovieShowtimes } from './api';

/** One cinema on one day (`/api/movies/showtimes/{id}/date/{date}/cinema/{cinemaId}`). */
export interface ShowtimesScope {
  date: string;
  cinemaId: string;
}

/**
 * Query options for a movie's sessions, shared by every screen that asks
 * for them (movie program, session dialog, cinema page), so one cache
 * serves all. Nationwide by default, or one cinema on one day with `only`.
 */
export function movieShowtimesQuery(movieId: string, only?: ShowtimesScope) {
  return {
    queryKey: ['catalog', 'showtimes', movieId, only?.date, only?.cinemaId],
    queryFn: async () => {
      const { rows, cinemas } = await getMovieShowtimes(movieId, only);
      registerCinemas(cinemas);
      return rows;
    },
    staleTime: CATALOG_CACHE_SECONDS * 1000,
  };
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
    ...movieShowtimesQuery(movieId, only ?? undefined),
    enabled: only !== null,
  });
}
