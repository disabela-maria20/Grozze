/** The app's only localStorage key (Zustand `persist`, see `persistedState`). */
export const STORAGE_KEY = 'grozze';

/**
 * Keys of older versions. Read once by `migrateLegacyStorage` and deleted,
 * so the browser ends up with `STORAGE_KEY` alone.
 */
export const LEGACY_STORAGE_KEYS = Object.freeze({
  profiles: 'grozze.v1.profiles',
  session: 'grozze.v1.session',
  content: 'grozze.v1.content',
  consent: 'grozze.v1.consent',
  location: 'grozze.v1.location',
  audit: 'grozze.v1.audit',
  leads: 'grozze.v1.leads',
  /** First version of the app (single user, before profiles). */
  user: 'grozzeUser',
  savedMovies: 'grozzeSaved',
  savedCinemas: 'grozzeFavCinemas',
  cms: 'grozzeCmsV27',
});
