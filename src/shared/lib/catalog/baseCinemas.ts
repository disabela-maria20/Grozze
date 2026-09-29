import cinemasJson from '@/data/cinemas.json';
import type { Cinema } from '../types';

export const baseCinemas = new Map<string, Cinema>(
  (cinemasJson as Cinema[]).map((c) => [String(c.id), Object.freeze({ ...c })])
);
