import type { Cinema } from './types';
import type { LocationState } from '@/shared/lib/types';

/** Active cinemas loaded from the catalog API. Filled by `setCatalog`. */
export const baseCinemas = new Map<string, Cinema>();

/**
 * Loads the cinemas fetched from the API into the synchronous resolvers
 * (`cinema`, `allCinemas`...). Not cleared first: cinemas registered from
 * showtimes stay resolvable.
 */
export function setCinemas(cinemas: Cinema[]) {
  for (const c of cinemas) baseCinemas.set(c.id, Object.freeze(c));
}

/** Adds cinemas seen in a showtimes response that the list did not include. */
export function registerCinemas(cinemas: Cinema[]) {
  for (const c of cinemas) {
    if (!baseCinemas.has(c.id)) baseCinemas.set(c.id, Object.freeze(c));
  }
}

export function cinema(id: string | undefined | null): Cinema | null {
  if (!id) return null;
  return baseCinemas.get(String(id)) || null;
}

export const allCinemas = () => [...baseCinemas.values()];

const EARTH_RADIUS_KM = 6371;

const toRadians = (degrees: number) => (degrees * Math.PI) / 180;

/** Great-circle (haversine) distance; `null` without a position or cinema coordinates. */
export function distanceKm(
  cinema: Cinema,
  position?: { lat: number; lng: number } | null
): number | null {
  if (!position || cinema.lat === null || cinema.lng === null) return null;
  const haversine =
    Math.sin(toRadians(cinema.lat - position.lat) / 2) ** 2 +
    Math.cos(toRadians(position.lat)) *
      Math.cos(toRadians(cinema.lat)) *
      Math.sin(toRadians(cinema.lng - position.lng) / 2) ** 2;
  return (
    EARTH_RADIUS_KM *
    2 *
    Math.atan2(Math.sqrt(haversine), Math.sqrt(1 - haversine))
  );
}

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

/** Radius used when the location comes from the browser geolocation. */
const NEARBY_KM = 50;

/**
 * Whether a cinema belongs to the user's location: within `NEARBY_KM` of the
 * coordinates when geolocation is on, otherwise in the selected city
 * ("São Paulo, SP"). The API is nationwide, so lists are always scoped.
 */
export function inLocation(c: Cinema, location: LocationState): boolean {
  const km = distanceKm(c, location.coords);
  if (km !== null) return km <= NEARBY_KM;
  return `${c.city}, ${c.uf}` === location.label;
}
