import type { Cinema, LocationState } from '../types';
import { distanceKm } from './distanceKm';

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
