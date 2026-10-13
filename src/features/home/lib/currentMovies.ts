import { type Movie, allMovies, status } from '@/entities/movie';
import type { ContentState } from '@/shared/lib/types';

/** Movies showing now: the ones with artwork first, newest releases first. */
export function currentMovies(overrides?: ContentState | null): Movie[] {
  return allMovies(overrides)
    .filter((m) => status(m) === 'now')
    .sort(
      (a, b) =>
        Number(!!b.poster) - Number(!!a.poster) ||
        b.releaseDate.localeCompare(a.releaseDate)
    );
}
