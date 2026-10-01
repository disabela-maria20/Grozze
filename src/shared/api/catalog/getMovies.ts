import type { Movie } from '@/shared/lib/types';
import type { ApiMoviesResponse } from './apiTypes';
import { catalogGet } from './catalogGet';
import { toMovie } from './toMovie';

/** `GET /api/movies` — movies with upcoming sessions. */
export async function getMovies(): Promise<Movie[]> {
  const res = await catalogGet<ApiMoviesResponse>('/api/movies');
  return (res?.movies || []).map(toMovie);
}
