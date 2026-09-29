import type { Cinema } from '../types';
import { baseCinemas } from './baseCinemas';

export function cinema(id: string | undefined | null): Cinema | null {
  if (!id) return null;
  return baseCinemas.get(String(id)) || null;
}
