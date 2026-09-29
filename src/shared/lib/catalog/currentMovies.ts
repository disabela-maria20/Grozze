import type { ContentState, Movie } from '../types';
import { allMovies } from './allMovies';
import { hasSessions } from './hasSessions';
import { status } from './status';

export function currentMovies(overrides?: ContentState | null): Movie[] {
  return allMovies(overrides)
    .filter((m) => status(m) === 'now' && hasSessions(m.id))
    .sort((a, b) => (a.rank || 99) - (b.rank || 99));
}
