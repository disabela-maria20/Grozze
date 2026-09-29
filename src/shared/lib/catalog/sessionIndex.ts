import { SESSIONS } from './SESSIONS';

export const sessionIndex = new Map(SESSIONS.map((s) => [s.id, s]));
