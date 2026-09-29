import type { Movie, MovieStatus } from '../types';
import { META } from './META';
import { SESSIONS } from './SESSIONS';
import { hasSessions } from './hasSessions';
import { validDate } from './validDate';

export function status(m: Movie | null | undefined): MovieStatus {
  if (!m) return 'soon';
  if (m.presale && SESSIONS.some((s) => s.movie === m.id)) return 'presale';
  if (validDate(m.releaseDate) && m.releaseDate > META.referenceDate) {
    return hasSessions(m.id) ? 'presale' : 'soon';
  }
  return 'now';
}
