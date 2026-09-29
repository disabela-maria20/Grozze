import type { ContentState, Movie } from '../types';
import { allMovies } from './allMovies';
import { hasSessions } from './hasSessions';

export function movieList(overrides?: ContentState | null): Movie[] {
  return allMovies(overrides).filter((m) => hasSessions(m.id));
}
