import { type Movie, allMovies, hasSessions, status } from '@/entities/movie';
import type { ContentState } from '@/shared/lib/types';

export function soonMovies(overrides?: ContentState | null): Movie[] {
  return allMovies(overrides).filter(
    (m) => status(m) === 'soon' && !hasSessions(m.id)
  );
}
