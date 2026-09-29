import moviesJson from '@/data/movies.json';
import type { Movie } from '../types';

export const baseMovies = new Map<string, Movie>(
  (moviesJson as Movie[]).map((m) => [String(m.id), Object.freeze({ ...m })])
);
