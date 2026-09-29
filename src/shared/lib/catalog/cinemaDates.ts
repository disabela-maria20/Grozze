import { SESSIONS } from './SESSIONS';
import { unique } from './unique';

export function cinemaDates(id: string): string[] {
  return unique(
    SESSIONS.filter((s) => s.theater === id).map((s) => s.date)
  ).sort();
}
