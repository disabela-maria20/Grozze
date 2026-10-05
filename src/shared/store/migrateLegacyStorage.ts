import type { GrozzeFavorites } from '@/shared/api';
import type { ContentState, MovieOverride, Profile } from '@/shared/lib/types';
import { LEGACY_STORAGE_KEYS, STORAGE_KEY } from './KEYS';
import {
  defaultPersistedState,
  type PersistedState,
  STORAGE_VERSION,
} from './persistedState';
import { storage } from './storage';

const KEYS = LEGACY_STORAGE_KEYS;

/** Normalizes an unknown value into a de-duplicated list of string ids. */
const arrayIds = (value: unknown): string[] =>
  Array.isArray(value) ? [...new Set(value.map((id) => String(id)))] : [];

/** Field names of the first CMS (`grozzeCmsV27`) → `MovieOverride` fields. */
const LEGACY_OVERRIDE_FIELDS: Record<
  string,
  Exclude<keyof MovieOverride, 'cast'>
> = {
  title: 't',
  synopsis: 'syn',
  director: 'director',
  hero: 'backdrop',
  poster: 'poster',
  trailer: 'trailer',
  trailerTitle: 'trailerTitle',
};

/** A movie entry of the first CMS, keyed by its old field names. */
type LegacyMovie = Record<string, unknown> | null;

/** CMS overrides: the v1 key, or else the first CMS converted. */
function legacyContent(): ContentState | null {
  const content = storage.read<ContentState | null>(KEYS.content, null);
  if (content?.movies) return content;

  const firstCms = storage.read<{ movies?: unknown } | null>(KEYS.cms, null);
  if (!firstCms?.movies || typeof firstCms.movies !== 'object') return null;
  const converted: ContentState = { schemaVersion: 1, movies: {} };
  for (const [id, legacyMovie] of Object.entries<LegacyMovie>(
    firstCms.movies as Record<string, LegacyMovie>
  )) {
    if (!legacyMovie || typeof legacyMovie !== 'object') continue;
    const override: MovieOverride = {};
    for (const [from, to] of Object.entries(LEGACY_OVERRIDE_FIELDS)) {
      const value = legacyMovie[from];
      if (typeof value === 'string' && value.trim())
        override[to] = value.trim();
    }
    if (Array.isArray(legacyMovie.cast))
      override.cast = legacyMovie.cast
        .filter((name: unknown): name is string => typeof name === 'string')
        .slice(0, 4);
    if (Object.keys(override).length) converted.movies[id] = override;
  }
  return converted;
}

/** Favorites of the local-only profiles and of the first app's single user. */
function legacyFavorites(): Record<string, GrozzeFavorites> {
  const favorites: Record<string, GrozzeFavorites> = {};
  const add = (email: string, movies: unknown, cinemas: unknown) => {
    const key = email.trim().toLowerCase();
    const current = favorites[key] ?? { movies: [], cinemas: [] };
    favorites[key] = {
      movies: arrayIds([...current.movies, ...arrayIds(movies)]),
      cinemas: arrayIds([...current.cinemas, ...arrayIds(cinemas)]),
    };
  };

  const profiles = storage.read<Record<string, Profile> | null>(
    KEYS.profiles,
    null
  );
  if (profiles && typeof profiles === 'object') {
    for (const [email, profile] of Object.entries(profiles)) {
      add(email, profile?.savedMovies, profile?.savedCinemas);
    }
  }
  const firstUser = storage.read<{ email?: string } | null>(KEYS.user, null);
  if (firstUser?.email) {
    add(
      firstUser.email,
      storage.read(KEYS.savedMovies, []),
      storage.read(KEYS.savedCinemas, [])
    );
  }

  // Nothing to send for accounts without favorites
  for (const [email, { movies, cinemas }] of Object.entries(favorites)) {
    if (!movies.length && !cinemas.length) delete favorites[email];
  }
  return favorites;
}

/**
 * Moves the data of the old keys (one per subject, plus the first version's)
 * into the single `persist` key, then deletes them. Runs before the store is
 * created; does nothing once the old keys are gone.
 */
export function migrateLegacyStorage() {
  const legacyKeys = Object.values(KEYS);
  const hasLegacy = legacyKeys.some(
    (key) => storage.read<unknown>(key, null) !== null
  );
  if (!hasLegacy) return;

  // Never overwrite data already saved in the new format
  if (storage.read<unknown>(STORAGE_KEY, null) === null) {
    const defaults = defaultPersistedState();
    const state: PersistedState = {
      consent: storage.read(KEYS.consent, defaults.consent),
      content: legacyContent() ?? defaults.content,
      location: storage.read(KEYS.location, defaults.location),
      audit: storage.read(KEYS.audit, defaults.audit),
      leads: storage.read(KEYS.leads, defaults.leads),
      localFavorites: legacyFavorites(),
    };
    storage.write(STORAGE_KEY, { state, version: STORAGE_VERSION });
  }

  for (const key of legacyKeys) storage.remove(key);
}
