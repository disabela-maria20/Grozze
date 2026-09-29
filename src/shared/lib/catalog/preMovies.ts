import type { ContentState, Movie } from '../types';
import { allMovies } from './allMovies';
import { status } from './status';

export function preMovies(overrides?: ContentState | null): Movie[] {
  return allMovies(overrides).filter((m) => status(m) === 'presale');
}
