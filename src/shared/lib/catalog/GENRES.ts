import { baseMovies } from './baseMovies';
import { unique } from './unique';

/** Every genre present in the catalog ("Terror, Drama" counts as two). */
export function genres(): string[] {
  return unique(
    [...baseMovies.values()].flatMap((m) =>
      m.genre
        .split(',')
        .map((g) => g.trim())
        .filter(Boolean)
    )
  ).sort((a, b) => a.localeCompare(b, 'pt-BR'));
}
