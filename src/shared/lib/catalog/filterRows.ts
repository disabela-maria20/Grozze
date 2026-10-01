import type { Showtime } from '../types';
import { type SessionFilterState } from './SessionFilterState';

export function filterRows(
  rows: Showtime[],
  f: SessionFilterState,
  exclude = ''
): Showtime[] {
  return rows.filter(
    (s) =>
      s.date === f.date &&
      (exclude === 'tech' || f.tech === 'Todos' || s.tech === f.tech) &&
      (exclude === 'lang' || f.lang === 'Todos' || s.lang === f.lang) &&
      (exclude === 'cinema' || f.cinema === 'Todos' || s.theater === f.cinema)
  );
}
