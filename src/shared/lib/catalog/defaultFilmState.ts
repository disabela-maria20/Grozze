import { type SessionFilterState } from './SessionFilterState';
import { SESSIONS } from './SESSIONS';
import { unique } from './unique';

export function defaultFilmState(id: string): SessionFilterState {
  const dates = unique(
    SESSIONS.filter((s) => s.movie === id).map((s) => s.date)
  ).sort();
  return {
    date: dates[0] || '',
    tech: 'Todos',
    lang: 'Todos',
    cinema: 'Todos',
  };
}
