'use client';

import { useQuery } from '@tanstack/react-query';
import { CATALOG_CACHE_SECONDS } from '@/shared/api';
import { useAppStore } from '@/shared/store';
import type { CityProgram } from './api';
import { hasSessions } from './model';

/** Lists with fewer movies than this invite the user to nearby cities. */
export const FEW_CITY_MOVIES = 8;

/** Ids of the catalog movies (the ones lists can show) playing in the city. */
const catalogMovieIds = (program: CityProgram) =>
  new Set(Object.keys(program.movies).filter(hasSessions));

/** Query for one city's movies (see `/api/city-program`), as a Set of ids. */
export function cityProgramQuery(uf: string, city: string) {
  return {
    queryKey: ['city-program', uf, city],
    queryFn: async (): Promise<CityProgram> => {
      const params = new URLSearchParams({ uf, city });
      const res = await fetch(`/api/city-program/?${params}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return res.json();
    },
    select: catalogMovieIds,
    staleTime: CATALOG_CACHE_SECONDS * 1000,
  };
}

/**
 * The movies playing in the city the user picked (or the one their position
 * pointed to). `movieIds` is `null` when there's nothing to filter by: no
 * city yet, or the program couldn't be loaded (lists stay nationwide rather
 * than empty).
 */
export function useCityProgram() {
  const uf = useAppStore((s) => s.location.uf) ?? '';
  const city = useAppStore((s) => s.location.city) ?? '';
  const scoped = !!(uf && city);
  const query = useQuery({ ...cityProgramQuery(uf, city), enabled: scoped });
  const movieIds = query.data ?? null;
  const count = movieIds?.size ?? 0;
  return {
    /** The city the lists are scoped to; '' without one. */
    city: scoped ? city : '',
    /** Waiting for the city's program (show placeholders, not the national list). */
    loading: scoped && query.isPending,
    movieIds,
    /** Movies of the catalog with sessions in the city. */
    count,
    /** Few (or no) movies in the city: worth suggesting nearby ones. */
    few: !!movieIds && count < FEW_CITY_MOVIES,
  };
}
