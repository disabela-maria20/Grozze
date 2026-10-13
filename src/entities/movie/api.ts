import { dateLabel, nowInSaoPaulo, validDate } from '@/shared/lib/date';
import { distributorSlug } from '@/entities/distributor';
import { safeImage, videoId } from '@/shared/lib/media';
import type { Movie, Showtime } from './types';
import {
  CATALOG_IMAGE_URL,
  type ApiMovie,
  type ApiMoviesResponse,
  catalogGet,
  type ApiShowtimeRoom,
  type ApiShowtimesResponse,
} from '@/shared/api';
import { type Cinema, toCinema } from '@/entities/cinema';

/** File names are relative to the image host; full URLs pass through. */
export function catalogImage(file: string | null | undefined): string {
  const fileName = String(file || '').trim();
  if (!fileName) return '';
  return safeImage(
    /^https?:\/\//i.test(fileName)
      ? fileName
      : `${CATALOG_IMAGE_URL}/${encodeURIComponent(fileName)}`
  );
}

/** "99" → "1h39"; "45" → "45 min". */
function duration(minutes: string | null): string {
  const total = Number.parseInt(minutes || '', 10);
  if (!Number.isFinite(total) || total <= 0) return '';
  if (total < 60) return `${total} min`;
  return `${Math.floor(total / 60)}h${String(total % 60).padStart(2, '0')}`;
}

/** "0" / "Livre" → "Livre"; "16 anos" → "16"; "Verifique..." → "". */
function rating(value: string | null): string {
  const text = String(value || '').trim();
  if (/^0$|livre/i.test(text)) return 'Livre';
  return text.match(/^\d+/)?.[0] || '';
}

/** Spelling variants the API uses for the same genre. */
const GENRE_ALIASES: Record<string, string> = {
  'ficção-científica': 'Ficção científica',
};

/**
 * Cleans the API genre list into "Drama, Terror": accepts plain lists and
 * JSON-array strings ('["Drama", "Terror"]'), capitalizes ("animação" →
 * "Animação"), unifies spelling variants and drops duplicates.
 */
function genres(value: string | null): string {
  const names = String(value || '')
    .replace(/[[\]"]/g, '')
    .split(',')
    .map((name) => name.trim().replace(/\s+/g, ' '))
    .filter(Boolean)
    .map(
      (name) =>
        GENRE_ALIASES[name.toLocaleLowerCase('pt-BR')] ||
        name.charAt(0).toLocaleUpperCase('pt-BR') + name.slice(1)
    );
  return [...new Set(names)].join(', ');
}

/** "YYYY-MM-DD HH:mm:ss" → "YYYY-MM-DD"; '' when missing or invalid. */
const day = (value: string | null | undefined) => {
  const date = String(value || '').slice(0, 10);
  return validDate(date) ? date : '';
};

/** Maps an API movie to the app's `Movie`. */
export function toMovie(m: ApiMovie): Movie {
  const asset = (type: string) =>
    m.assets?.find((candidate) => candidate.type === type);
  const released = day(m.release_date);
  const firstShowtime = day(m.first_showtime_date);
  const today = nowInSaoPaulo().date;
  // A past release whose sessions haven't started yet is a re-release (or a
  // return to theaters): what matters to the user is when sessions begin.
  const releaseDate =
    !released || (released < today && firstShowtime > today)
      ? firstShowtime || released
      : released;
  const poster = catalogImage(m.poster || asset('cartaz')?.image);
  return {
    id: String(m.id),
    t: m.title.trim(),
    genre: genres(m.genres),
    dur: duration(m.duration),
    rating: rating(m.age_rating),
    syn: (m.synopsis || '').trim(),
    cast: (m.cast || '')
      .split(/\r?\n|,/)
      .map((name) => name.trim())
      .filter(Boolean)
      .slice(0, 4),
    director: (m.director || '').trim(),
    distLabel: (m.distributor || '').trim(),
    dist: distributorSlug(m.distributor),
    release: dateLabel(releaseDate),
    releaseDate,
    originalRelease: released,
    firstShowtime,
    source: 'API do catálogo',
    poster,
    backdrop: catalogImage(asset('capa')?.image) || poster,
    trailer: videoId(m.trailer || asset('trailer')?.url),
  };
}

/** `GET /api/movies` — movies with upcoming sessions. */
export async function getMovies(): Promise<Movie[]> {
  const res = await catalogGet<ApiMoviesResponse>('/api/movies');
  return (res?.movies || []).map(toMovie);
}

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
