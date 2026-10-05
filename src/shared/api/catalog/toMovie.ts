import {
  dateLabel,
  distributorSlug,
  nowInSaoPaulo,
  safeImage,
  validDate,
  videoId,
} from '@/shared/lib/catalog';
import type { Movie } from '@/shared/lib/types';
import type { ApiMovie } from './apiTypes';
import { CATALOG_IMAGE_URL } from './CATALOG_IMAGE_URL';

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
    source: 'API do catálogo',
    poster,
    backdrop: catalogImage(asset('capa')?.image) || poster,
    trailer: videoId(m.trailer || asset('trailer')?.url),
  };
}
