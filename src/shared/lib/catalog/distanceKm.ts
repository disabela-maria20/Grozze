import type { Cinema } from '../types';

export function distanceKm(
  c: Cinema,
  pos?: { lat: number; lng: number } | null
): number | null {
  if (!pos) return null;
  const rad = (d: number) => (d * Math.PI) / 180;
  const a =
    Math.sin(rad(c.lat - pos.lat) / 2) ** 2 +
    Math.cos(rad(pos.lat)) *
      Math.cos(rad(c.lat)) *
      Math.sin(rad(c.lng - pos.lng) / 2) ** 2;
  return 6371 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}
