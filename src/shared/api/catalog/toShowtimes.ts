import type { Cinema, Showtime } from '@/shared/lib/types';
import type { ApiShowtimeRoom, ApiShowtimesResponse } from './apiTypes';
import { toCinema } from './toCinema';

const LANGUAGES: Record<string, string> = {
  dubbed: 'Dublado',
  subtitled: 'Legendado',
  national: 'Nacional',
  original: 'Nacional',
};

/** API language → Portuguese label; unknown values pass through. */
function language(value: string | null): string {
  const text = String(value || '').trim();
  return LANGUAGES[text.toLowerCase()] || text || 'Não informado';
}

/** "IMAX 2D", "3D"... */
function tech(room: ApiShowtimeRoom): string {
  return (
    [room.imax ? 'IMAX' : '', String(room.format || '').trim()]
      .filter(Boolean)
      .join(' ') || 'Tradicional'
  );
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
  const movieId = String(res.movie.id);
  const rows: Showtime[] = [];
  const cinemas = new Map<string, Cinema>();
  for (const day of res.showtimes || []) {
    for (const apiCinema of day.cinemas || []) {
      const theater = String(apiCinema.id);
      if (!cinemas.has(theater)) cinemas.set(theater, toCinema(apiCinema));
      for (const room of apiCinema.rooms || []) {
        for (const slot of room.times || []) {
          const time = slot.time.slice(0, 5);
          const purchaseUrl = /^https:\/\//.test(slot.purchase_url || '')
            ? slot.purchase_url!
            : '';
          rows.push({
            id: [movieId, theater, day.date, room.id, time].join('|'),
            movie: movieId,
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
