/** Free IP geolocation service: no key, CORS enabled. */
const IP_LOCATION_URL = 'https://get.geojs.io/v1/ip/geo.json';

/**
 * Approximate position of the visitor from their IP address (city-level at
 * best; mobile carriers often resolve to another city). Null outside Brazil
 * or when the service fails, so callers just skip the suggestion.
 */
export async function ipLocation(): Promise<{
  lat: number;
  lng: number;
} | null> {
  try {
    const res = await fetch(IP_LOCATION_URL);
    if (!res.ok) return null;
    const data = (await res.json()) as {
      country_code?: string;
      latitude?: string;
      longitude?: string;
    };
    if (data.country_code !== 'BR') return null;
    const lat = Number(data.latitude);
    const lng = Number(data.longitude);
    return Number.isFinite(lat) && Number.isFinite(lng) ? { lat, lng } : null;
  } catch {
    return null;
  }
}
