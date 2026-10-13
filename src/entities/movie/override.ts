import type { MovieOverride } from '@/shared/lib/types';
import { safeImage, videoId } from '@/shared/lib/media';
import { validDate } from '@/shared/lib/date';

export const OVERRIDE_STRING_FIELDS: Exclude<keyof MovieOverride, 'cast'>[] = [
  't',
  'syn',
  'director',
  'genre',
  'dur',
  'rating',
  'releaseDate',
  'poster',
  'backdrop',
  'trailer',
  'trailerTitle',
];

/**
 * Builds a clean override from CMS form values: trims text, drops empty
 * fields, normalizes the trailer to a YouTube id and keeps up to 4 cast
 * names (array or comma-separated text). Throws a user-facing message on
 * invalid input.
 */
export function validateOverride(
  input: Record<string, unknown>
): MovieOverride {
  const override: MovieOverride = {};
  for (const field of OVERRIDE_STRING_FIELDS) {
    const value = String(input[field] ?? '').trim();
    if (!value) continue;
    if (value.length > 10000) throw new Error('Campo muito longo.');
    if ((field === 'poster' || field === 'backdrop') && !safeImage(value))
      throw new Error('Use uma URL HTTPS válida para imagens.');
    if (field === 'trailer' && !videoId(value))
      throw new Error('Informe um ID ou link válido do YouTube.');
    if (field === 'releaseDate' && !validDate(value))
      throw new Error('Informe uma data de estreia válida.');
    override[field] = field === 'trailer' ? videoId(value) : value;
  }
  const castInput = input.cast;
  const cast = Array.isArray(castInput)
    ? castInput
    : String(castInput || '').split(',');
  const names = cast
    .filter((name): name is string => typeof name === 'string')
    .map((name) => name.trim())
    .filter(Boolean)
    .slice(0, 4);
  if (names.length) override.cast = names;
  return override;
}
