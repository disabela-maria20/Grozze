import type { Cinema, Showtime } from '@/shared/lib/types';
import type { ApiShowtimeRoom, ApiShowtimesResponse } from './apiTypes';
import { toCinema } from './toCinema';

const LANGUAGES: Record<string, string> = {
  dubbed: 'Dublado',
  subtitled: 'Legendado',
  national: 'Nacional',
  original: 'Nacional',
};

function language(v: string | null): string {
  const s = String(v || '').trim();
  return LANGUAGES[s.toLowerCase()] || s || 'Não informado';
}

/** "IMAX 2D", "3D"... */
function tech(room: ApiShowtimeRoom): string {
  return [room.imax ? 'IMAX' : '', String(room.format || '').trim()]
    .filter(Boolean)
    .join(' ') || 'Tradicional';
}

/** Sales channel name from the checkout URL ("checkout.ingresso.com"). */
function seller(url: string): string {
  try {
    const host = new URL(url).hostname.replace(/^(www|checkout)\./, '');
    if (host.startsWith('ingresso.')) return 'Ingresso.com';
    const name = host.split('.')[0];
    return name.charAt(0).toUpperCase() + name.slice(1);
  } catch {
    return '';
  }
}

/** Flattens days → cinemas → rooms → times into one row per session. */
export function toShowtimes(res: ApiShowtimesResponse): {
  rows: Showtime[];
  cinemas: Cinema[];
} {
  const movie = String(res.movie.id);
  const rows: Showtime[] = [];
  const cinemas = new Map<string, Cinema>();
  for (const day of res.showtimes || []) {
    for (const c of day.cinemas || []) {
      const theater = String(c.id);
      if (!cinemas.has(theater)) cinemas.set(theater, toCinema(c));
      for (const room of c.rooms || []) {
        for (const t of room.times || []) {
          const time = t.time.slice(0, 5);
          const purchaseUrl = /^https:\/\//.test(t.purchase_url || '')
            ? t.purchase_url!
            : '';
          rows.push({
            id: [movie, theater, day.date, room.id, time].join('|'),
            movie,
            theater,
            date: day.date,
            time,
            tech: tech(room),
            lang: language(room.language),
            room: room.name,
            seller: purchaseUrl ? seller(purchaseUrl) : '',
            purchaseUrl,
          });
        }
      }
    }
  }
  return { rows, cinemas: [...cinemas.values()] };
}
