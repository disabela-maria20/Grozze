import type { Movie, MovieStatus } from './types';
import type { ContentState } from '@/shared/lib/types';
import { OVERRIDE_STRING_FIELDS } from './override';
import { safeImage, videoId } from '@/shared/lib/media';
import { addDays, nowInSaoPaulo, validDate } from '@/shared/lib/date';
import { unique } from '@/shared/lib/text';

/** Movies loaded from the catalog API. Filled by `setMovies`. */
export const baseMovies = new Map<string, Movie>();

/**
 * Replaces the in-memory movies with the ones fetched from the API, so the
 * synchronous resolvers (`movie`, `allMovies`...) keep working. Call it
 * before rendering anything that reads the catalog (see `CatalogGate`).
 */
export function setMovies(movies: Movie[]) {
  baseMovies.clear();
  for (const m of movies) baseMovies.set(m.id, Object.freeze(m));
}

/** Merges CMS overrides onto the base SEED movie, mirroring the original `movie()` resolver. */
export function movie(
  id: string,
  overrides?: ContentState | null
): Movie | null {
  const base = baseMovies.get(String(id));
  if (!base) return null;
  const override = overrides?.movies?.[String(id)] || {};
  const merged: Movie = { ...base };
  for (const field of OVERRIDE_STRING_FIELDS) {
    const value = override[field];
    if (typeof value === 'string' && value.trim())
      Object.assign(merged, { [field]: value.trim() });
  }
  if (Array.isArray(override.cast) && override.cast.length)
    merged.cast = override.cast.slice(0, 4);
  // Re-sanitize media: overrides may hold unsafe URLs or full YouTube links
  merged.poster = safeImage(merged.poster);
  merged.backdrop = safeImage(merged.backdrop) || merged.poster;
  merged.trailer = videoId(merged.trailer);
  return merged;
}

export function allMovies(overrides?: ContentState | null): Movie[] {
  return [...baseMovies.keys()]
    .map((id) => movie(id, overrides)!)
    .filter(Boolean);
}

/** The API only lists movies that have upcoming sessions. */
export const hasSessions = (id: string): boolean => baseMovies.has(String(id));

/** Pre-sale starts this many days before the release (sessions required). */
const PRESALE_DAYS = 7;

/** A movie with sessions released longer ago than this is a re-release. */
const RERELEASE_AFTER_DAYS = 365;

/**
 * Old movie back in theaters (re-release or special screening): it has
 * sessions but came out over a year ago. A December release still showing
 * in January doesn't count.
 */
export function isRerelease(m: Movie | null | undefined): boolean {
  if (!m || !hasSessions(m.id)) return false;
  const original = m.originalRelease || m.releaseDate;
  if (!validDate(original)) return false;
  return original < addDays(nowInSaoPaulo().date, -RERELEASE_AFTER_DAYS);
}

export function status(m: Movie | null | undefined): MovieStatus {
  if (!m) return 'soon';
  if (!validDate(m.releaseDate)) return 'now';
  const today = nowInSaoPaulo().date;
  const sessions = hasSessions(m.id);
  // Without sessions, a movie stays upcoming through its release day
  if (!sessions && m.releaseDate >= today) return 'soon';
  if (m.releaseDate > addDays(today, PRESALE_DAYS)) return 'soon';
  if (m.releaseDate > today) return 'presale';
  return 'now';
}

/**
 * Tag shown on a movie: pre-sale when it has sessions and the release is at
 * most a week away, in theaters when it has sessions and is released, coming
 * soon when the release is further away or it has no sessions yet, and no
 * tag for released movies without sessions. Old movies with sessions are
 * re-releases, whatever the session date.
 */
export function statusLabel(movie: Movie | null | undefined): string {
  if (!movie) return '';
  if (isRerelease(movie)) return 'Relançamento';
  const sessions = hasSessions(movie.id);
  const dated = validDate(movie.releaseDate);
  const today = nowInSaoPaulo().date;
  if (sessions && dated && movie.releaseDate > today) {
    return movie.releaseDate <= addDays(today, PRESALE_DAYS)
      ? 'Em pré-venda'
      : 'Em breve nos cinemas';
  }
  if (sessions) return 'Hoje nos cinemas';
  if (dated && movie.releaseDate < today) return '';
  return 'Em breve nos cinemas';
}

export function movieHref(id: string, scope?: string | null): string {
  return scope
    ? `/distribuidora/${encodeURIComponent(scope)}/filme/${encodeURIComponent(id)}`
    : `/filme/${encodeURIComponent(id)}`;
}

/** Every genre present in the catalog ("Terror, Drama" counts as two). */
export function genres(): string[] {
  return unique(
    [...baseMovies.values()].flatMap((m) =>
      m.genre
        .split(',')
        .map((g) => g.trim())
        .filter(Boolean)
    )
  ).sort((a, b) => a.localeCompare(b, 'pt-BR'));
}
