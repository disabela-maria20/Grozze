import type { ContentState, Movie } from '../types';
import { baseMovies } from './baseMovies';
import { OVERRIDE_STRING_FIELDS } from './OVERRIDE_STRING_FIELDS';
import { safeImage } from './safeImage';
import { videoId } from './videoId';

/** Merges CMS overrides onto the base SEED movie, mirroring the original `movie()` resolver. */
export function movie(
  id: string,
  overrides?: ContentState | null
): Movie | null {
  const b = baseMovies.get(String(id));
  if (!b) return null;
  const o = overrides?.movies?.[String(id)] || {};
  const m: Movie = { ...b };
  for (const k of OVERRIDE_STRING_FIELDS) {
    const v = o[k];
    if (typeof v === 'string' && v.trim()) Object.assign(m, { [k]: v.trim() });
  }
  if (Array.isArray(o.cast) && o.cast.length) m.cast = o.cast.slice(0, 4);
  m.poster = safeImage(m.poster);
  m.backdrop = safeImage(m.backdrop) || m.poster;
  m.trailer = videoId(m.trailer);
  return m;
}
