import type { Cinema } from './types';
import type { LocationState } from '@/shared/lib/types';
import { normalize } from '@/shared/lib/text';

/** Active cinemas loaded from the catalog API. Filled by `setCinemas`. */
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

/** The user picked a city or allowed geolocation. */
export const hasLocation = (location: LocationState): boolean =>
  !!(location.city || location.coords);

/** Radius used when the location comes from the browser geolocation. */
const NEARBY_KM = 50;

/**
 * Whether a cinema belongs to the user's location: within `NEARBY_KM` of the
 * coordinates when geolocation is on, otherwise in the selected city and
 * state. Names are compared ignoring case and accents, since the catalog
 * spells some cities both ways. The API is nationwide, so lists are always
 * scoped.
 */
export function inLocation(c: Cinema, location: LocationState): boolean {
  const km = distanceKm(c, location.coords);
  if (km !== null) return km <= NEARBY_KM;
  return (
    normalize(c.city) === normalize(location.city) &&
    normalize(c.uf) === normalize(location.uf)
  );
}

/** Full state names, shown instead of the abbreviations the catalog uses. */
const STATE_NAMES: Record<string, string> = {
  AC: 'Acre',
  AL: 'Alagoas',
  AM: 'Amazonas',
  AP: 'Amapá',
  BA: 'Bahia',
  CE: 'Ceará',
  DF: 'Distrito Federal',
  ES: 'Espírito Santo',
  GO: 'Goiás',
  MA: 'Maranhão',
  MG: 'Minas Gerais',
  MS: 'Mato Grosso do Sul',
  MT: 'Mato Grosso',
  PA: 'Pará',
  PB: 'Paraíba',
  PE: 'Pernambuco',
  PI: 'Piauí',
  PR: 'Paraná',
  RJ: 'Rio de Janeiro',
  RN: 'Rio Grande do Norte',
  RO: 'Rondônia',
  RR: 'Roraima',
  RS: 'Rio Grande do Sul',
  SC: 'Santa Catarina',
  SE: 'Sergipe',
  SP: 'São Paulo',
  TO: 'Tocantins',
};

/** A state (full name, plus the abbreviation used to match) and its cities. */
export interface LocationOption {
  uf: string;
  name: string;
  cities: string[];
}

/**
 * States with cinemas (all of them, or just `cinemas`), each with its
 * cities, both alphabetical. Cities spelled two ways ("Campos dos
 * Goytacazes" / "Campos Dos Goytacazes") appear once.
 */
export function locationOptions(
  cinemas: Cinema[] = allCinemas()
): LocationOption[] {
  const byUf = new Map<string, Map<string, string>>();
  for (const c of cinemas) {
    if (!c.uf || !c.city) continue;
    if (!byUf.has(c.uf)) byUf.set(c.uf, new Map());
    const cities = byUf.get(c.uf)!;
    if (!cities.has(normalize(c.city))) cities.set(normalize(c.city), c.city);
  }
  return [...byUf]
    .map(([uf, cities]) => ({
      uf,
      name: STATE_NAMES[uf] ?? uf,
      cities: [...cities.values()].sort((a, b) => a.localeCompare(b, 'pt-BR')),
    }))
    .sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'));
}

/** The cinema closest to `coords` (null when none has coordinates). */
export function nearestCinema(coords: {
  lat: number;
  lng: number;
}): Cinema | null {
  let nearest: Cinema | null = null;
  let best = Infinity;
  for (const c of allCinemas()) {
    const km = distanceKm(c, coords);
    if (km !== null && km < best) {
      best = km;
      nearest = c;
    }
  }
  return nearest;
}
