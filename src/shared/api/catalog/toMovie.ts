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
  const f = String(file || '').trim();
  if (!f) return '';
  return safeImage(
    /^https?:\/\//i.test(f)
      ? f
      : `${CATALOG_IMAGE_URL}/${encodeURIComponent(f)}`
  );
}

/** "99" → "1h39"; "45" → "45 min". */
function duration(minutes: string | null): string {
  const n = Number.parseInt(minutes || '', 10);
  if (!Number.isFinite(n) || n <= 0) return '';
  if (n < 60) return `${n} min`;
  return `${Math.floor(n / 60)}h${String(n % 60).padStart(2, '0')}`;
}

/** "0" / "Livre" → "Livre"; "16 anos" → "16"; "Verifique..." → "". */
function rating(value: string | null): string {
  const v = String(value || '').trim();
  if (/^0$|livre/i.test(v)) return 'Livre';
  return v.match(/^\d+/)?.[0] || '';
}

const day = (v: string | null | undefined) => {
  const d = String(v || '').slice(0, 10);
  return validDate(d) ? d : '';
};

export function toMovie(m: ApiMovie): Movie {
  const asset = (type: string) => m.assets?.find((a) => a.type === type);
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
    genre: (m.genres || '').trim(),
    dur: duration(m.duration),
    rating: rating(m.age_rating),
    syn: (m.synopsis || '').trim(),
    cast: (m.cast || '')
      .split(/\r?\n|,/)
      .map((x) => x.trim())
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
