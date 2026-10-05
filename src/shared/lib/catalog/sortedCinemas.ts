import type { Cinema } from '../types';
import { allCinemas } from './allCinemas';
import { distanceKm } from './distanceKm';

/** Stand-in distance that sorts cinemas without one after the located ones. */
const UNKNOWN_DISTANCE_KM = 999;

/** Saved cinemas first, then nearest, then by name. */
export function sortedCinemas(
  isCinemaSaved: (id: string) => boolean,
  coords?: { lat: number; lng: number } | null
): Cinema[] {
  return allCinemas().sort(
    (a, b) =>
      Number(isCinemaSaved(b.id)) - Number(isCinemaSaved(a.id)) ||
      (distanceKm(a, coords) ?? UNKNOWN_DISTANCE_KM) -
        (distanceKm(b, coords) ?? UNKNOWN_DISTANCE_KM) ||
      a.name.localeCompare(b.name)
  );
}
