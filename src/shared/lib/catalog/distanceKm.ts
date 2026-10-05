import type { Cinema } from '../types';

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
