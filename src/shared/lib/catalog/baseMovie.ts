import type { Movie } from '../types';
import { baseMovies } from './baseMovies';

export function baseMovie(id: string): Movie | null {
  return baseMovies.get(String(id)) || null;
}
