import { type Movie, allMovies, isRerelease, status } from '@/entities/movie';
import type { ContentState } from '@/shared/lib/types';

export function preMovies(overrides?: ContentState | null): Movie[] {
  return allMovies(overrides).filter(
    (m) => status(m) === 'presale' && !isRerelease(m)
  );
}
