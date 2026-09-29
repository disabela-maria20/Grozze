import type { MovieOverride } from '../types';
import { OVERRIDE_STRING_FIELDS } from './OVERRIDE_STRING_FIELDS';
import { safeImage } from './safeImage';
import { validDate } from './validDate';
import { videoId } from './videoId';

export function validateOverride(
  input: Record<string, unknown>
): MovieOverride {
  const o: MovieOverride = {};
  for (const k of OVERRIDE_STRING_FIELDS) {
    const v = String(input[k] ?? '').trim();
    if (!v) continue;
    if (v.length > 10000) throw new Error('Campo muito longo.');
    if ((k === 'poster' || k === 'backdrop') && !safeImage(v))
      throw new Error('Use uma URL HTTPS válida para imagens.');
    if (k === 'trailer' && !videoId(v))
      throw new Error('Informe um ID ou link válido do YouTube.');
    if (k === 'releaseDate' && !validDate(v))
      throw new Error('Informe uma data de estreia válida.');
    o[k] = k === 'trailer' ? videoId(v) : v;
  }
  const castInput = input.cast;
  const cast = Array.isArray(castInput)
    ? castInput
    : String(castInput || '').split(',');
  const names = cast
    .filter((x): x is string => typeof x === 'string')
    .map((x) => x.trim())
    .filter(Boolean)
    .slice(0, 4);
  if (names.length) o.cast = names;
  return o;
}
