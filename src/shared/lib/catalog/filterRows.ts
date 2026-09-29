import type { Showtime } from '../types';
import { type SessionFilterState } from './SessionFilterState';
import { SESSIONS } from './SESSIONS';

export function filterRows(
  id: string,
  f: SessionFilterState,
  exclude = ''
): Showtime[] {
  return SESSIONS.filter(
    (s) =>
      s.movie === id &&
      s.date === f.date &&
      (exclude === 'tech' || f.tech === 'Todos' || s.tech === f.tech) &&
      (exclude === 'lang' || f.lang === 'Todos' || s.lang === f.lang) &&
      (exclude === 'cinema' || f.cinema === 'Todos' || s.theater === f.cinema)
  );
}
