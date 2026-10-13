import { type Movie, baseMovies } from '@/entities/movie';

export function baseMovie(id: string): Movie | null {
  return baseMovies.get(String(id)) || null;
}
