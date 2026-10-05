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
  audit: AuditEntry[];
  leads: Lead[];
  /**
   * Favorites saved in this browser before they lived in the account, by
   * e-mail. Sent to the account (and removed here) on that user's login.
   */
  localFavorites: Record<string, GrozzeFavorites>;
}

/** The only selectable city; also what gets stored for geolocation. */
export const defaultLocation = (): LocationState => ({
  label: 'São Paulo, SP',
  mode: 'manual',
});

export const defaultPersistedState = (): PersistedState => ({
  consent: null,
  content: { schemaVersion: 1, movies: {} },
  location: defaultLocation(),
  audit: [],
  leads: [],
  localFavorites: {},
});
