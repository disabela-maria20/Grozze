'use client';

// The api barrel imports this store back (QueryProvider); safe because both
// sides only use the import inside functions, never while the module loads
import {
  grozzeAuth,
  type GrozzeFavorites,
  type GrozzeUser,
  toProfile,
} from '@/shared/api';
import { validateOverride } from '@/shared/lib/catalog';
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
import { type DialogState } from './DialogState';
import { STORAGE_KEY } from './KEYS';
import { migrateLegacyStorage } from './migrateLegacyStorage';
import { type PendingFavorite } from './PendingFavorite';
import {
  defaultLocation,
  defaultPersistedState,
  type PersistedState,
  STORAGE_VERSION,
} from './persistedState';
import { persistStorage } from './storage';

/** Maximum number of entries kept in the CMS audit log. */
const AUDIT_LOG_LIMIT = 250;

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
 * stay in memory only: the stored location is always the manual one.
 */
function toPersisted(state: PersistedState): PersistedState {
  return {
    consent: state.consent,
    content: state.content,
    location:
      state.location.mode === 'geolocation'
        ? defaultLocation()
        : state.location,
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
  setLocationManual: () => void;
  setLocationGeo: (coords: { lat: number; lng: number }) => void;

  publishOverride: (id: string, values: Record<string, unknown>) => void;
  removeOverride: (id: string) => void;
  importContent: (json: unknown) => void;

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

      /** Publishes new CMS content and records the change in the audit log. */
      const saveContent = (
        content: ContentState,
        auditAction: string,
        auditId: string,
        auditFields?: string[]
      ) =>
        set((state) => ({
          content,
          audit: withAuditEntry(state.audit, auditAction, auditId, auditFields),
        }));

      /** This browser's favorites of `email`, forgotten here once taken. */
      const takeLocalFavorites = (email: string) => {
        const { [email]: favorites, ...others } = get().localFavorites;
        if (favorites) set({ localFavorites: others });
        return favorites ?? { movies: [], cinemas: [] };
      };

      return {
        ...defaultPersistedState(),
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

        setLocationManual: () => {
          set({ location: defaultLocation(), dialog: null });
          get().toast('Localização selecionada.');
        },

        setLocationGeo: (coords) => {
          const location: LocationState = {
            label: 'São Paulo, SP',
            mode: 'geolocation',
            coords,
          };
          // Kept in memory only: `toPersisted` stores the manual location
          set({ location, dialog: null });
          get().toast(
            'Localização usada para mostrar os cinemas perto de você.'
          );
        },

        publishOverride: (id, values) => {
          const override = validateOverride(values);
          const state = get();
          const movies = { ...state.content.movies };
          // An empty override means "back to the source data"
          if (Object.keys(override).length) movies[id] = override;
          else delete movies[id];
          saveContent(
            { schemaVersion: 1, movies },
            'Override publicado',
            id,
            Object.keys(override)
          );
          state.toast('Conteúdo publicado.');
        },

        removeOverride: (id) => {
          const state = get();
          const movies = { ...state.content.movies };
          delete movies[id];
          saveContent({ schemaVersion: 1, movies }, 'Override removido', id);
          state.toast('Dados de origem restaurados.');
        },

        /** Replaces every override with the ones of an exported JSON file. */
        importContent: (json) => {
          const data = json as {
            schemaVersion?: unknown;
            movies?: unknown;
          } | null;
          if (
            data?.schemaVersion !== 1 ||
            !data.movies ||
            typeof data.movies !== 'object'
          ) {
            throw new Error('Formato de arquivo inválido.');
          }
          const imported: ContentState = { schemaVersion: 1, movies: {} };
          for (const [id, values] of Object.entries(
            data.movies as Record<string, Record<string, unknown>>
          )) {
            imported.movies[id] = validateOverride(values);
          }
          saveContent(
            imported,
            'Overrides importados',
            '-',
            Object.keys(imported.movies)
          );
          get().toast('Overrides importados.');
        },

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
    }
  )
);
