import { type Movie, allMovies, hasSessions } from '@/entities/movie';
import type { ContentState } from '@/shared/lib/types';

export function movieList(overrides?: ContentState | null): Movie[] {
  return allMovies(overrides).filter((m) => hasSessions(m.id));
}
