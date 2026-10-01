import type { ContentState, Movie } from '../types';
import { allMovies } from './allMovies';
import { status } from './status';

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
