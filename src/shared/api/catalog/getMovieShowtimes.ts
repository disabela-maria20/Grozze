import type { Cinema, Showtime } from '@/shared/lib/types';
import type { ApiShowtimesResponse } from './apiTypes';
import { catalogGet } from './catalogGet';
import { toShowtimes } from './toShowtimes';

/**
 * `GET /api/movies/showtimes/{id}`, or the date + cinema variant when both
 * are given. Empty when the movie doesn't exist. The full response is
 * nationwide (several MB), so callers filter by location.
 */
export async function getMovieShowtimes(
  id: string,
  only?: { date: string; cinemaId: string }
): Promise<{ rows: Showtime[]; cinemas: Cinema[] }> {
  if (!/^\d+$/.test(id)) return { rows: [], cinemas: [] };
  const path = only
    ? `/api/movies/showtimes/${id}/date/${only.date}/cinema/${only.cinemaId}`
    : `/api/movies/showtimes/${id}`;
  const res = await catalogGet<ApiShowtimesResponse>(path);
  return res ? toShowtimes(res) : { rows: [], cinemas: [] };
}
