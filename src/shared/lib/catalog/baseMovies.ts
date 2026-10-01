import type { Movie } from '../types';

/** Movies loaded from the catalog API. Filled by `setCatalog`. */
export const baseMovies = new Map<string, Movie>();
