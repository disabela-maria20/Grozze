import { type SessionFilterState } from './SessionFilterState';

/** Empty date means "first available date" once the showtimes load. */
export function defaultFilmState(): SessionFilterState {
  return {
    date: '',
    tech: 'Todos',
    lang: 'Todos',
    cinema: 'Todos',
  };
}
