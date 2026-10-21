'use client';

// The api barrel imports this store back (QueryProvider); safe because both
// sides only use the import inside functions, never while the module loads
import {
  grozzeAuth,
  type GrozzeFavorites,
  type GrozzeUser,
  toProfile,
} from '@/shared/api';
import type {
  AuditEntry,
  ConsentState,
  ContentState,
  Lead,
  LocationState,
  Profile,
} from '@/shared/lib/types';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { DialogState, PendingFavorite } from './types';
import { persistStorage, STORAGE_KEY } from './storage';
import { migrateLegacyStorage } from './migrateLegacyStorage';
import {
  defaultLocation,
  defaultPersistedState,
  type PersistedState,
  STORAGE_VERSION,
  upgradeLocation,
} from './persistedState';

/** Maximum number of entries kept in the CMS audit log. */
const AUDIT_LOG_LIMIT = 250;

/** A city with cinemas: name plus state abbreviation ("SP"). */
export interface Place {
  city: string;
  uf: string;
}

/** Normalizes an unknown value into a de-duplicated list of string ids. */
const arrayIds = (value: unknown): string[] =>
  Array.isArray(value) ? [...new Set(value.map((id) => String(id)))] : [];

/** Toast messages shown after saving/removing a favorite. */
const FAVORITE_TOASTS = {
  movie: { saved: 'Filme salvo', removed: 'Filme removido dos favoritos' },
  cinema: { saved: 'Cinema salvo', removed: 'Cinema removido dos favoritos' },
};

/** The audit log with a new entry on top, trimmed to the limit. */
function withAuditEntry(
  audit: AuditEntry[],
  action: string,
  id: string,
  fields: string[] = []
): AuditEntry[] {
  const entry: AuditEntry = {
    date: new Date().toISOString(),
    action,
    id: String(id || ''),
    fields,
    actor: 'Editor',
  };
  return [entry, ...audit].slice(0, AUDIT_LOG_LIMIT);
}

/**
 * The part of the state written to localStorage. Geolocation coordinates
 * stay in memory only: a reload keeps the region's name, not the position.
 */
function toPersisted(state: PersistedState): PersistedState {
  return {
    consent: state.consent,
    localContent: state.localContent,
    location:
      state.location.mode === 'geolocation'
        ? state.location.city
          ? {
              label: state.location.label,
              city: state.location.city,
              uf: state.location.uf,
              mode: 'manual',
            }
          : defaultLocation()
        : state.location,
    locationAsked: state.locationAsked,
    audit: state.audit,
    leads: state.leads,
    localFavorites: state.localFavorites,
  };
}

// Old versions used one key per subject; fold them into STORAGE_KEY first
migrateLegacyStorage();

/**
 * `loading` while the session is restored on page load (the access token
 * lives in memory, so every load asks the API); then `guest` or
 * `authenticated`.
 */
export type AuthStatus = 'loading' | 'guest' | 'authenticated';

interface AppState extends PersistedState {
  /** CMS overrides from the API, applied over the catalog (memory only). */
  content: ContentState;
  /** Logged-in user (from the Grozze API), in the shape the screens use. */
  account: Profile | null;
  authStatus: AuthStatus;
  pending: PendingFavorite | null;
  dialog: DialogState | null;
  toastMessage: string | null;
  toastToken: number;
  hasHero: boolean;
  setHasHero: (v: boolean) => void;

  profile: () => Profile | null;
  logged: () => boolean;
  movieSaved: (id: string) => boolean;
  cinemaSaved: (id: string) => boolean;

  toast: (message: string) => void;
  clearToast: () => void;
  openDialog: (id: string, props?: Record<string, unknown>) => void;
  closeDialog: (opts?: { keepPending?: boolean }) => void;

  requestFavorite: (kind: 'movie' | 'cinema', id: string, path: string) => void;
  applyFavorite: (
    kind: 'movie' | 'cinema',
    id: string,
    force?: boolean | null
  ) => void;

  /** Logs the user in the UI after a successful login or sign-up. */
  completeLogin: (
    user: GrozzeUser,
    options?: { signup?: boolean; marketingConsent?: boolean }
  ) => void;
  /** Session restored on page load (`null` = not logged in). */
  restoreSession: (user: GrozzeUser | null) => void;
  /** Refreshes the account after the API changed it (profile edits). */
  setAccount: (user: GrozzeUser) => void;
  logout: () => void;
  /** The API refused to renew the session (expired or revoked elsewhere). */
  sessionExpired: () => void;

  saveConsent: (optional: boolean) => void;
  setLocationManual: (place: Place) => void;
  /** `place` is the nearest cinema's city, or null when none is known. */
  setLocationGeo: (
    coords: { lat: number; lng: number },
    place: Place | null
  ) => void;
  markLocationAsked: () => void;

  /** Overrides loaded from the API (see `useMovieOverridesQuery`). */
  setContent: (content: ContentState) => void;
  /** An admin saved overrides in the API: apply them and log it here. */
  recordContentChange: (
    content: ContentState,
    action: string,
    id: string,
    fields?: string[]
  ) => void;
  clearLocalContent: () => void;

  captureLead: (input: {
    source: string;
    name: string;
    email: string;
    marketingConsent?: boolean;
    message?: string;
    scope?: string;
  }) => void;
}

export const useAppStore = create<AppState>()(
  persist<AppState, [], [], PersistedState>(
    (set, get) => {
      /** Replaces the saved ids of the logged-in account. */
      const setFavorites = (favorites: GrozzeFavorites) => {
        const account = get().account;
        if (!account) return;
        set({
          account: {
            ...account,
            savedMovies: favorites.movies,
            savedCinemas: favorites.cinemas,
          },
        });
      };

      /** This browser's favorites of `email`, forgotten here once taken. */
      const takeLocalFavorites = (email: string) => {
        const { [email]: favorites, ...others } = get().localFavorites;
        if (favorites) set({ localFavorites: others });
        return favorites ?? { movies: [], cinemas: [] };
      };

      return {
        ...defaultPersistedState(),
        content: { schemaVersion: 1, movies: {} },
        account: null,
        authStatus: 'loading',
        pending: null,
        dialog: null,
        toastMessage: null,
        toastToken: 0,
        hasHero: false,
        setHasHero: (hasHero) => set({ hasHero }),

        profile: () => get().account,
        logged: () => get().authStatus === 'authenticated' && !!get().account,
        movieSaved: (id) => {
          const profile = get().profile();
          return (
            !!profile && arrayIds(profile.savedMovies).includes(String(id))
          );
        },
        cinemaSaved: (id) => {
          const profile = get().profile();
          return (
            !!profile && arrayIds(profile.savedCinemas).includes(String(id))
          );
        },

        // A new token re-triggers the toast even when the message repeats
        toast: (message) =>
          set((state) => ({
            toastMessage: message,
            toastToken: state.toastToken + 1,
          })),
        clearToast: () => set({ toastMessage: null }),
        openDialog: (id, props) => set({ dialog: { id, props } }),
        closeDialog: () => set({ dialog: null }),

        /**
         * Toggles a favorite, or — when logged out — remembers it (with the scroll
         * position) and opens the login dialog; `completeLogin` applies it.
         */
        requestFavorite: (kind, id, path) => {
          const strId = String(id);
          if (!get().logged()) {
            set({
              pending: {
                kind,
                id: strId,
                path,
                scrollY: typeof window !== 'undefined' ? window.scrollY : 0,
              },
            });
            get().openDialog('auth', { signup: false });
            return;
          }
          get().applyFavorite(kind, strId);
        },

        /**
         * `force` null toggles; true/false saves/removes. The heart changes right
         * away and goes back if the API refuses.
         */
        applyFavorite: (kind, id, force = null) => {
          const state = get();
          const account = state.account;
          if (!account) return;
          const key = kind === 'movie' ? 'savedMovies' : 'savedCinemas';
          const previousIds = arrayIds(account[key]);
          const savedIds = new Set(previousIds);
          const shouldSave = force === null ? !savedIds.has(id) : force;
          if (shouldSave) savedIds.add(id);
          else savedIds.delete(id);
          set({ account: { ...account, [key]: [...savedIds] } });
          const messages =
            kind === 'movie' ? FAVORITE_TOASTS.movie : FAVORITE_TOASTS.cinema;
          state.toast(shouldSave ? messages.saved : messages.removed);

          grozzeAuth
            .setFavorite(kind, id, shouldSave)
            .then(setFavorites)
            .catch((err: unknown) => {
              const current = get().account;
              if (current) set({ account: { ...current, [key]: previousIds } });
              get().toast(
                err instanceof Error
                  ? err.message
                  : 'Não foi possível salvar o favorito.'
              );
            });
        },

        completeLogin: (
          user,
          { signup = false, marketingConsent = false } = {}
        ) => {
          const state = get();
          set({
            account: toProfile(user),
            authStatus: 'authenticated',
            dialog: null,
          });
          if (signup) {
            state.captureLead({
              source: 'Cadastro',
              name: user.name,
              email: user.email,
              marketingConsent,
            });
          }

          // Favorites saved in this browser before the account move into it
          const localFavorites = takeLocalFavorites(user.email);
          if (localFavorites.movies.length || localFavorites.cinemas.length) {
            grozzeAuth
              .mergeFavorites(localFavorites)
              .then(setFavorites)
              .catch(() => {});
          }

          const pending = state.pending;
          if (pending) {
            set({ pending: null });
            get().applyFavorite(pending.kind, pending.id, true);
            if (typeof window !== 'undefined')
              window.scrollTo({ top: pending.scrollY, behavior: 'instant' });
          } else {
            get().toast('Você entrou na sua conta.');
          }
        },

        restoreSession: (user) =>
          set(
            user
              ? { account: toProfile(user), authStatus: 'authenticated' }
              : { account: null, authStatus: 'guest' }
          ),

        setAccount: (user) =>
          set({ account: toProfile(user), authStatus: 'authenticated' }),

        logout: () => {
          void grozzeAuth.logout();
          set({ account: null, authStatus: 'guest', dialog: null });
          get().toast('Você saiu da conta.');
        },

        sessionExpired: () => {
          if (!get().account) return;
          set({ account: null, authStatus: 'guest' });
          get().toast('Sua sessão expirou. Entre novamente.');
        },

        saveConsent: (optional) => {
          const consent: ConsentState = {
            version: 1,
            essential: true,
            preferences: !!optional,
            date: new Date().toISOString(),
          };
          set((state) => ({
            consent,
            dialog: state.dialog?.id === 'consent' ? null : state.dialog,
          }));
          get().toast('Preferências de cookies salvas.');
        },

        setLocationManual: ({ city, uf }) => {
          set({
            location: { label: city, city, uf, mode: 'manual' },
            dialog: null,
          });
          get().toast('Localização selecionada.');
        },

        setLocationGeo: (coords, place) => {
          const location: LocationState = {
            label: place?.city ?? 'Perto de você',
            city: place?.city,
            uf: place?.uf,
            mode: 'geolocation',
            coords,
          };
          // Coordinates stay in memory: `toPersisted` stores only the label
          set({ location, dialog: null });
          get().toast(
            'Localização usada para mostrar os cinemas perto de você.'
          );
        },

        markLocationAsked: () => set({ locationAsked: true }),

        setContent: (content) => set({ content }),

        recordContentChange: (content, action, id, fields) =>
          set((state) => ({
            content,
            audit: withAuditEntry(state.audit, action, id, fields),
          })),

        clearLocalContent: () => set({ localContent: null }),

        /** Upserts a lead; the same e-mail + source updates the existing one. */
        captureLead: ({
          source,
          name,
          email,
          marketingConsent = false,
          message = '',
          scope,
        }) => {
          const leads = get().leads;
          const key = email.trim().toLowerCase() + '|' + source;
          const existing = leads.find((lead) => lead.key === key);
          const item: Lead = {
            id:
              existing?.id ||
              'lead-' +
                Date.now() +
                '-' +
                Math.random().toString(36).slice(2, 7),
            key,
            name: String(name),
            email: String(email).toLowerCase(),
            source,
            message,
            marketingConsent: !!marketingConsent,
            consentVersion: 1,
            scope: scope || 'consumer',
            createdAt: existing?.createdAt || new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };
          const nextLeads = existing
            ? leads.map((lead) => (lead.key === key ? item : lead))
            : [item, ...leads];
          set({ leads: nextLeads });
        },
      };
    },
    {
      name: STORAGE_KEY,
      version: STORAGE_VERSION,
      storage: persistStorage<PersistedState>(),
      partialize: toPersisted,
      // Older saves lack newer fields (and had the "City, UF" label)
      merge: (persisted, current) => {
        const saved = (persisted ?? {}) as Partial<PersistedState> & {
          /** Overrides lived in the browser before the API */
          content?: ContentState;
        };
        const { content: legacyContent, ...rest } = saved;
        return {
          ...current,
          ...rest,
          localContent:
            rest.localContent ??
            (legacyContent && Object.keys(legacyContent.movies ?? {}).length
              ? legacyContent
              : null),
          // A city saved by an older version stays selected (the location
          // question still opens once, starting on it)
          location: upgradeLocation(saved.location ?? current.location),
        };
      },
    }
  )
);
