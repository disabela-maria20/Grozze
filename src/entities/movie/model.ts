import type { Movie, MovieStatus } from './types';
import type { ContentState, MovieOverride } from '@/shared/lib/types';
import { OVERRIDE_STRING_FIELDS } from './override';
import { safeImage, videoId } from '@/shared/lib/media';
import { addDays, nowInSaoPaulo, validDate } from '@/shared/lib/date';
import { unique } from '@/shared/lib/text';

/** Movies loaded from the catalog API. Filled by `setMovies`. */
export const baseMovies = new Map<string, Movie>();

/** Ids of the movies that have upcoming sessions. */
const withSessions = new Set<string>();

/**
 * Ids `/api/movies/coming-soon` lists (the coming-soon page). `null` when
 * that route failed: `upcoming` then falls back to the release dates.
 */
let comingSoonIds: Set<string> | null = null;

/**
 * Replaces the in-memory movies with the ones fetched from the API, so the
 * synchronous resolvers (`movie`, `allMovies`...) keep working. Call it
 * before rendering anything that reads the catalog (see `CatalogGate`).
 * `movies` have sessions (`/api/movies`); `comingSoon` are announced
 * releases (`/api/movies/coming-soon`), with sessions or not.
 */
export function setMovies(movies: Movie[], comingSoon: Movie[] | null = null) {
  baseMovies.clear();
  withSessions.clear();
  comingSoonIds = comingSoon && new Set(comingSoon.map((m) => m.id));
  for (const m of movies) {
    baseMovies.set(m.id, Object.freeze(m));
    withSessions.add(m.id);
  }
  // Movies with sessions keep their richer `/api/movies` entry (banner, trailer)
  for (const m of comingSoon || []) {
    if (!baseMovies.has(m.id)) baseMovies.set(m.id, Object.freeze(m));
  }
}

/**
 * Adds movies seen elsewhere (a cinema's program) that the catalog list
 * doesn't have, so links to them resolve. Catalog entries win.
 */
export function registerMovies(movies: Movie[]) {
  for (const m of movies) {
    if (!baseMovies.has(m.id)) baseMovies.set(m.id, Object.freeze(m));
    // In a cinema's program, so it has sessions
    withSessions.add(m.id);
  }
}

/** Merges CMS overrides onto the base SEED movie, mirroring the original `movie()` resolver. */
export function movie(
  id: string,
  overrides?: ContentState | null
): Movie | null {
  const base = baseMovies.get(String(id));
  if (!base) return null;
  return withOverride(base, overrides?.movies?.[String(id)]);
}

/**
 * A catalog movie with its CMS edits applied (pure: also used on the
 * server, for page metadata).
 */
export function withOverride(base: Movie, override: MovieOverride = {}): Movie {
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

/** Listed by `/api/movies` (or a cinema's program): it has upcoming sessions. */
export const hasSessions = (id: string): boolean =>
  withSessions.has(String(id));

/** Pre-sale starts this many days before the release (sessions required). */
const PRESALE_DAYS = 7;

export function status(m: Movie | null | undefined): MovieStatus {
  if (!m) return 'soon';
  // Without sessions a movie is still upcoming (announced, not playing)
  if (!hasSessions(m.id)) return 'soon';
  if (!validDate(m.releaseDate)) return 'now';
  const today = nowInSaoPaulo().date;
  if (m.releaseDate > addDays(today, PRESALE_DAYS)) return 'soon';
  if (m.releaseDate > today) return 'presale';
  return 'now';
}

const PRESALE_LABEL = 'Em pré-venda';

/**
 * Listed on the coming-soon page: the movies `/api/movies/coming-soon`
 * returns (without it, the ones not in theaters yet), with a release date.
 * Movies tagged "Em pré-venda" stay out: their tickets are already on sale.
 */
export const upcoming = (m: Movie): boolean =>
  validDate(m.releaseDate) &&
  statusLabel(m) !== PRESALE_LABEL &&
  (comingSoonIds ? comingSoonIds.has(m.id) : status(m) !== 'now');

/**
 * Tag shown on a movie, from its next session: in theaters when it has a
 * session today, pre-sale when its sessions only start later, and coming
 * soon when it has no session yet.
 */
export function statusLabel(movie: Movie | null | undefined): string {
  if (!movie) return '';
  const next = movie.firstShowtime;
  if (!next || !validDate(next)) return 'Em breve nos cinemas';
  return next > nowInSaoPaulo().date ? PRESALE_LABEL : 'Hoje nos cinemas';
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
