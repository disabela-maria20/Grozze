import type { Cinema, Movie } from '../types';
import { baseCinemas } from './baseCinemas';
import { baseMovies } from './baseMovies';

/**
 * Replaces the in-memory catalog with the data fetched from the API, so the
 * synchronous resolvers (`movie`, `cinema`, `allMovies`...) keep working.
 * Call it before rendering anything that reads the catalog (see
 * `CatalogGate`).
 */
export function setCatalog(data: { movies: Movie[]; cinemas: Cinema[] }) {
  baseMovies.clear();
  for (const m of data.movies) baseMovies.set(m.id, Object.freeze(m));
  // Not cleared: cinemas registered from showtimes stay resolvable
  for (const c of data.cinemas) baseCinemas.set(c.id, Object.freeze(c));
}

/** Adds cinemas seen in a showtimes response that the list did not include. */
export function registerCinemas(cinemas: Cinema[]) {
  for (const c of cinemas) {
    if (!baseCinemas.has(c.id)) baseCinemas.set(c.id, Object.freeze(c));
  }
}
