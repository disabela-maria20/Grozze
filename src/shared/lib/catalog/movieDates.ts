import { SESSIONS } from './SESSIONS';
import { unique } from './unique';

export function movieDates(id: string): string[] {
  return unique(
    SESSIONS.filter((s) => s.movie === id).map((s) => s.date)
  ).sort();
}
