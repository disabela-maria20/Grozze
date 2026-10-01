import { baseMovies } from './baseMovies';

/** The API only lists movies that have upcoming sessions. */
export const hasSessions = (id: string): boolean => baseMovies.has(String(id));
