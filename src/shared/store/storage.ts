import type { PersistStorage } from 'zustand/middleware';

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

/** Faithful port of the original app's `safeStorage()`: works even when storage APIs throw (privacy mode, disabled cookies) by falling back to an in-memory Map, and never blows up during SSR where `window` doesn't exist. */
export function safeStorage(kind: 'localStorage' | 'sessionStorage') {
  const memory = new Map<string, string>();
  let native: Storage | null = null;
  try {
    if (typeof window !== 'undefined') {
      native = window[kind];
      const probeKey = 'gz-test';
      native.setItem(probeKey, '1');
      native.removeItem(probeKey);
    }
  } catch {
    native = null;
  }
  return {
    read<T>(key: string, fallback: T): T {
      try {
        const raw = native ? native.getItem(key) : memory.get(key);
        return raw ? (JSON.parse(raw) as T) : fallback;
      } catch {
        return fallback;
      }
    },
    write(key: string, value: unknown) {
      const raw = JSON.stringify(value);
      try {
        if (native) native.setItem(key, raw);
        else memory.set(key, raw);
      } catch {
        native = null;
        memory.set(key, raw);
      }
    },
    remove(key: string) {
      try {
        native?.removeItem(key);
      } catch {
        /* ignore */
      }
      memory.delete(key);
    },
  };
}

export const storage = safeStorage('localStorage');

/**
 * Zustand `persist` on top of `safeStorage`, so private mode or disabled
 * storage falls back to memory instead of throwing.
 */
export function persistStorage<T>(): PersistStorage<T> {
  return {
    getItem: (name) => storage.read(name, null),
    setItem: (name, value) => storage.write(name, value),
    removeItem: (name) => storage.remove(name),
  };
}
