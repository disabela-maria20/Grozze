import type { Cinema } from '../types';
import { allCinemas } from './allCinemas';
import { distanceKm } from './distanceKm';

export function sortedCinemas(
  isCinemaSaved: (id: string) => boolean,
  coords?: { lat: number; lng: number } | null
): Cinema[] {
  return allCinemas().sort(
    (a, b) =>
      Number(isCinemaSaved(b.id)) - Number(isCinemaSaved(a.id)) ||
      (distanceKm(a, coords) ?? 999) - (distanceKm(b, coords) ?? 999) ||
      a.name.localeCompare(b.name)
  );
}
