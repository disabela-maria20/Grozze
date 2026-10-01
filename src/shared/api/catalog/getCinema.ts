import type { Cinema } from '@/shared/lib/types';
import type { ApiCinemaResponse } from './apiTypes';
import { catalogGet } from './catalogGet';
import { toCinema } from './toCinema';

/** `GET /api/cinemas/{id}` — `null` when the cinema is unknown or inactive. */
export async function getCinema(id: string): Promise<Cinema | null> {
  if (!/^\d+$/.test(id)) return null;
  const res = await catalogGet<ApiCinemaResponse>(`/api/cinemas/${id}`);
  return res?.cinema ? toCinema(res.cinema) : null;
}
