import type { Cinema } from '@/shared/lib/types';
import type { ApiCinema } from './apiTypes';

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
  };
}
