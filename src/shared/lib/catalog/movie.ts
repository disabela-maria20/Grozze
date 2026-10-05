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
