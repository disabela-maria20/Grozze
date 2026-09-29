import type { ContentState, Movie } from '../types';
import { baseMovies } from './baseMovies';
import { movie } from './movie';

export function allMovies(overrides?: ContentState | null): Movie[] {
  return [...baseMovies.keys()]
    .map((id) => movie(id, overrides)!)
    .filter(Boolean);
}
