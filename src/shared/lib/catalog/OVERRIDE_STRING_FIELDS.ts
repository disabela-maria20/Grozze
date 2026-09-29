import type { MovieOverride } from '../types';

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
