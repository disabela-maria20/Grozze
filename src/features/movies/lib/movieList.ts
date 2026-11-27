import {
  type Movie,
  allMovies,
  hasSessions,
  inComingSoon,
} from '@/entities/movie';
import type { ContentState } from '@/shared/lib/types';

/** The /filmes list: movies with sessions plus the announced releases. */
export function movieList(overrides?: ContentState | null): Movie[] {
  return allMovies(overrides).filter(
    (m) => hasSessions(m.id) || inComingSoon(m.id)
  );
}
