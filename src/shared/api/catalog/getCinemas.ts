import type { Cinema } from '@/shared/lib/types';
import type { ApiCinemasResponse } from './apiTypes';
import { catalogGet } from './catalogGet';
import { toCinema } from './toCinema';

/** `GET /api/cinemas` — active cinemas. */
export async function getCinemas(): Promise<Cinema[]> {
  const res = await catalogGet<ApiCinemasResponse>('/api/cinemas');
  return (res?.cinemas || []).map(toCinema);
}
