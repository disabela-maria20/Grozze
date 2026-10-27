import type { Cinema } from './types';
import { safeImage } from '@/shared/lib/media';
import {
  type ApiCinema,
  type ApiCinemaResponse,
  catalogGet,
  type ApiCinemasResponse,
} from '@/shared/api';

/** Trimmed string; '' for null/undefined. */
const text = (value: string | null | undefined) => String(value ?? '').trim();

/** Maps an API cinema to the app's `Cinema` ("S/N" street numbers are dropped). */
export function toCinema(c: ApiCinema): Cinema {
  const number = text(c.number);
  const street = [text(c.address), /^s\/?n$/i.test(number) ? '' : number]
    .filter(Boolean)
    .join(', ');
  const neighborhood = text(c.neighborhood);
  return {
    id: String(c.id),
    name: text(c.alias) || text(c.name),
    network: text(c.network),
    address: [street, neighborhood].filter(Boolean).join(' — '),
    neighborhood,
    city: text(c.city),
    uf: text(c.uf ?? c.state_code).toUpperCase(),
    lat: typeof c.latitude === 'number' ? c.latitude : null,
    lng: typeof c.longitude === 'number' ? c.longitude : null,
    roomCount: c.total_rooms || 0,
    phones: (c.telephones || []).filter(Boolean),
    siteUrl: /^https:\/\//.test(text(c.site_url)) ? text(c.site_url) : '',
    postalCode: text(c.postal_code),
    image: safeImage(c.images?.find((image) => image.url)?.url),
  };
}

/** `GET /api/cinemas/{id}` — `null` when the cinema is unknown or inactive. */
export async function getCinema(id: string): Promise<Cinema | null> {
  if (!/^\d+$/.test(id)) return null;
  const res = await catalogGet<ApiCinemaResponse>(`/api/cinemas/${id}`);
  return res?.cinema ? toCinema(res.cinema) : null;
}

/** `GET /api/cinemas` — active cinemas. */
export async function getCinemas(): Promise<Cinema[]> {
  const res = await catalogGet<ApiCinemasResponse>('/api/cinemas');
  return (res?.cinemas || []).map(toCinema);
}
