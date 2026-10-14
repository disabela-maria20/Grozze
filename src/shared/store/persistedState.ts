import type { GrozzeFavorites } from '@/shared/api';
import type {
  AuditEntry,
  ConsentState,
  ContentState,
  Lead,
  LocationState,
} from '@/shared/lib/types';

/** Bump when the shape below changes, and teach `persist` to migrate. */
export const STORAGE_VERSION = 1;

/**
 * What survives a reload, all under one localStorage key. The login is not
 * here: the session lives in the API's httpOnly cookie.
 */
export interface PersistedState {
  consent: ConsentState | null;
  /** CMS overrides edited in /admin. */
  content: ContentState;
  location: LocationState;
  /** The first-visit location question was already shown. */
  locationAsked: boolean;
  audit: AuditEntry[];
  leads: Lead[];
  /**
   * Favorites saved in this browser before they lived in the account, by
   * e-mail. Sent to the account (and removed here) on that user's login.
   */
  localFavorites: Record<string, GrozzeFavorites>;
}

/** No city yet: the site asks the user to pick one (or allow geolocation). */
export const defaultLocation = (): LocationState => ({
  label: '',
  mode: 'manual',
});

/** Locations saved before city/uf existed had only the label "City, UF". */
export function upgradeLocation(location: LocationState): LocationState {
  if (location.city) return location;
  const match = location.label.match(/^(.+),\s*([A-Z]{2})$/);
  return match
    ? { ...location, label: match[1], city: match[1], uf: match[2] }
    : defaultLocation();
}

export const defaultPersistedState = (): PersistedState => ({
  consent: null,
  content: { schemaVersion: 1, movies: {} },
  location: defaultLocation(),
  locationAsked: false,
  audit: [],
  leads: [],
  localFavorites: {},
});
