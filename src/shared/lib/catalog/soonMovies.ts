import type { ContentState, Movie } from '../types';
import { allMovies } from './allMovies';
import { hasSessions } from './hasSessions';
import { status } from './status';

export function soonMovies(overrides?: ContentState | null): Movie[] {
  return allMovies(overrides).filter(
    (m) => status(m) === 'soon' && !hasSessions(m.id)
  );
}
