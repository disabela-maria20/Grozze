import { SESSIONS } from './SESSIONS';

export const hasSessions = (id: string): boolean =>
  SESSIONS.some((s) => s.movie === String(id));
