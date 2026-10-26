'use client';

import { useQuery } from '@tanstack/react-query';
import { registerCinemas } from '@/entities/cinema';
import { getCinemaShowtimes, registerMovies } from '@/entities/movie';
import { CATALOG_CACHE_SECONDS } from '@/shared/api';

/**
 * A cinema's whole program (`GET /api/cinemas/{id}`): every day it has
 * sessions, each movie's rooms and times. Movies missing from the catalog
 * list are registered so their links resolve.
 */
export function useCinemaProgram(cinemaId: string) {
  return useQuery({
    queryKey: ['catalog', 'cinema-program', cinemaId],
    queryFn: async () => {
      const program = await getCinemaShowtimes(cinemaId);
      registerMovies(program.movies);
      if (program.cinema) registerCinemas([program.cinema]);
      return program;
    },
    staleTime: CATALOG_CACHE_SECONDS * 1000,
  });
}
