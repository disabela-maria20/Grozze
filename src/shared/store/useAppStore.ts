'use client';

import { validateOverride } from '@/shared/lib/catalog';
import type {
  AuditEntry,
  ConsentState,
  ContentState,
  Lead,
  LocationState,
  MovieOverride,
  Preferences,
  Profile,
} from '@/shared/lib/types';
import { create } from 'zustand';
import { type DialogState } from './DialogState';
import { KEYS } from './KEYS';
import { type PendingFavorite } from './PendingFavorite';
import { storage } from './storage';
import { tabStorage } from './tabStorage';

/** Maximum number of entries kept in the CMS audit log. */
const AUDIT_LOG_LIMIT = 250;

/** Normalizes an unknown value into a de-duplicated list of string ids. */
const arrayIds = (value: unknown): string[] =>
  Array.isArray(value) ? [...new Set(value.map((id) => String(id)))] : [];

const defaultPreferences = (): Preferences => ({
  language: 'Todos',
  format: 'Todos',
});

/** The only selectable city; also what gets persisted for geolocation. */
const defaultLocation = (): LocationState => ({
  label: 'São Paulo, SP',
  mode: 'manual',
});

/** Toast messages shown after saving/removing a favorite. */
const FAVORITE_TOASTS = {
  movie: { saved: 'Filme salvo', removed: 'Filme removido dos favoritos' },
  cinema: { saved: 'Cinema salvo', removed: 'Cinema removido dos favoritos' },
};

/** Field names of the legacy CMS (`grozzeCmsV27`) → `MovieOverride` fields. */
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

/**
 * Reads the stored profiles, importing the single user of the legacy app
 * (`grozzeUser` + its saved movies/cinemas) when it isn't registered yet.
 */
function migrateProfiles(): Record<string, Profile> {
  let profiles = storage.read<Record<string, Profile>>(KEYS.profiles, {});
  if (!profiles || typeof profiles !== 'object' || Array.isArray(profiles))
    profiles = {};
  const legacyUser = storage.read<{ email?: string; name?: string } | null>(
    'grozzeUser',
    null
  );
  if (
    legacyUser?.email &&
    !Object.hasOwn(profiles, legacyUser.email.toLowerCase())
  ) {
    const email = legacyUser.email.toLowerCase();
    profiles[email] = {
      name: String(legacyUser.name || email.split('@')[0]),
      email,
      savedMovies: arrayIds(storage.read('grozzeSaved', [])),
      savedCinemas: arrayIds(storage.read('grozzeFavCinemas', [])),
      preferences: defaultPreferences(),
      avatar: 'initial',
    };
    storage.write(KEYS.profiles, profiles);
  }
  return profiles;
}

/** A movie entry of the legacy CMS, keyed by its old field names. */
type LegacyMovie = Record<string, unknown> | null;

/**
 * Reads the stored CMS content, converting the legacy CMS overrides
 * (`grozzeCmsV27`) on first run.
 */
function migrateContent(): ContentState {
  const existing = storage.read<ContentState | null>(KEYS.content, null);
  if (existing?.movies) return existing;
  const content: ContentState = { schemaVersion: 1, movies: {} };
  const legacy = storage.read<{ movies?: unknown } | null>('grozzeCmsV27', {});
  if (legacy?.movies && typeof legacy.movies === 'object') {
    for (const [id, legacyMovie] of Object.entries<LegacyMovie>(
      legacy.movies as Record<string, LegacyMovie>
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
      if (Object.keys(override).length) content.movies[id] = override;
    }
  }
  storage.write(KEYS.content, content);
  return content;
}

interface AppState {
  profiles: Record<string, Profile>;
  userKey: string | null;
  consent: ConsentState | null;
  content: ContentState;
  location: LocationState;
  audit: AuditEntry[];
  leads: Lead[];
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

  completeLogin: (
    name: string,
    email: string,
    signup?: boolean,
    marketingConsent?: boolean,
    favoriteGenres?: string[]
  ) => { ok: boolean; hadPending: boolean };
  logout: () => void;
  updateProfileName: (name: string) => void;
  updatePreferences: (prefs: Preferences) => void;
  setAvatar: (avatar: Profile['avatar']) => void;

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

/** Prepends an entry to the persisted audit log and returns the trimmed log. */
function logAudit(action: string, id: string, fields: string[] = []) {
  const auditLog = storage.read<AuditEntry[]>(KEYS.audit, []);
  auditLog.unshift({
    date: new Date().toISOString(),
    action,
    id: String(id || ''),
    fields,
    actor: 'Editor',
  });
  storage.write(KEYS.audit, auditLog.slice(0, AUDIT_LOG_LIMIT));
  return auditLog.slice(0, AUDIT_LOG_LIMIT);
}

const initialProfiles = migrateProfiles();

const initialContent = migrateContent();

/** The login lasts for the browser tab (sessionStorage). */
const initialSession = tabStorage.read<{ email: string } | null>(
  KEYS.session,
  null
);

const initialUserKey =
  initialSession?.email && Object.hasOwn(initialProfiles, initialSession.email)
    ? initialSession.email
    : null;

export const useAppStore = create<AppState>((set, get) => {
  /** Replaces a profile (keyed by its email), persists and publishes the map. */
  const saveProfile = (updated: Profile) => {
    const profiles = { ...get().profiles, [updated.email]: updated };
    storage.write(KEYS.profiles, profiles);
    set({ profiles });
  };

  /** Persists the CMS content, records the change in the audit log and publishes both. */
  const saveContent = (
    content: ContentState,
    auditAction: string,
    auditId: string,
    auditFields?: string[]
  ) => {
    storage.write(KEYS.content, content);
    const audit = logAudit(auditAction, auditId, auditFields);
    set({ content, audit });
  };

  return {
    profiles: initialProfiles,
    userKey: initialUserKey,
    consent: storage.read<ConsentState | null>(KEYS.consent, null),
    content: initialContent,
    location: storage.read<LocationState>(KEYS.location, defaultLocation()),
    audit: storage.read<AuditEntry[]>(KEYS.audit, []),
    leads: storage.read<Lead[]>(KEYS.leads, []),
    pending: null,
    dialog: null,
    toastMessage: null,
    toastToken: 0,
    hasHero: false,
    setHasHero: (hasHero) => set({ hasHero }),

    profile: () => {
      const { userKey, profiles } = get();
      return userKey && Object.hasOwn(profiles, userKey)
        ? profiles[userKey]
        : null;
    },
    logged: () => !!get().profile(),
    movieSaved: (id) => {
      const profile = get().profile();
      return !!profile && arrayIds(profile.savedMovies).includes(String(id));
    },
    cinemaSaved: (id) => {
      const profile = get().profile();
      return !!profile && arrayIds(profile.savedCinemas).includes(String(id));
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

    /** `force` null toggles; true/false saves/removes. */
    applyFavorite: (kind, id, force = null) => {
      const state = get();
      const profile = state.profile();
      if (!profile) return;
      const key = kind === 'movie' ? 'savedMovies' : 'savedCinemas';
      const savedIds = new Set(arrayIds(profile[key]));
      const shouldSave = force === null ? !savedIds.has(id) : force;
      if (shouldSave) savedIds.add(id);
      else savedIds.delete(id);
      saveProfile({ ...profile, [key]: [...savedIds] });
      const messages =
        kind === 'movie' ? FAVORITE_TOASTS.movie : FAVORITE_TOASTS.cinema;
      state.toast(shouldSave ? messages.saved : messages.removed);
    },

    /**
     * Logs in (creating or updating the profile for the e-mail), records a
     * lead on signup and applies the favorite that required the login.
     */
    completeLogin: (
      name,
      email,
      signup = false,
      marketingConsent = false,
      favoriteGenres
    ) => {
      const normalizedEmail = email.trim().toLowerCase();
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
        get().toast('Informe um e-mail válido.');
        return { ok: false, hadPending: false };
      }
      const state = get();
      const previousProfile = Object.hasOwn(state.profiles, normalizedEmail)
        ? state.profiles[normalizedEmail]
        : null;
      const nextProfile: Profile = {
        name:
          name.trim() || previousProfile?.name || normalizedEmail.split('@')[0],
        email: normalizedEmail,
        savedMovies: arrayIds(previousProfile?.savedMovies),
        savedCinemas: arrayIds(previousProfile?.savedCinemas),
        avatar: previousProfile?.avatar || 'initial',
        preferences: {
          ...(previousProfile?.preferences || defaultPreferences()),
          ...(favoriteGenres ? { genres: favoriteGenres } : {}),
        },
      };
      const profiles = { ...state.profiles, [normalizedEmail]: nextProfile };
      storage.write(KEYS.profiles, profiles);
      tabStorage.write(KEYS.session, { email: normalizedEmail });
      if (signup) {
        state.captureLead({
          source: 'Cadastro',
          name: nextProfile.name,
          email: normalizedEmail,
          marketingConsent,
        });
      }
      const pending = state.pending;
      set({ profiles, userKey: normalizedEmail, dialog: null });
      if (pending) {
        set({ pending: null });
        get().applyFavorite(pending.kind, pending.id, true);
        if (typeof window !== 'undefined')
          window.scrollTo({ top: pending.scrollY, behavior: 'instant' });
      } else {
        get().toast('Você entrou na sua conta.');
      }
      return { ok: true, hadPending: !!pending };
    },

    logout: () => {
      tabStorage.remove(KEYS.session);
      set({ userKey: null, dialog: null });
      get().toast('Você saiu da conta.');
    },

    updateProfileName: (name) => {
      const state = get();
      const profile = state.profile();
      if (!profile) return;
      saveProfile({ ...profile, name: name.trim() });
      state.toast('Dados atualizados.');
    },

    updatePreferences: (prefs) => {
      const state = get();
      const profile = state.profile();
      if (!profile) return;
      saveProfile({ ...profile, preferences: prefs });
      state.toast('Preferências salvas.');
    },

    setAvatar: (avatar) => {
      const profile = get().profile();
      if (!profile) return;
      saveProfile({ ...profile, avatar });
    },

    saveConsent: (optional) => {
      const consent: ConsentState = {
        version: 1,
        essential: true,
        preferences: !!optional,
        date: new Date().toISOString(),
      };
      storage.write(KEYS.consent, consent);
      set((state) => ({
        consent,
        dialog: state.dialog?.id === 'consent' ? null : state.dialog,
      }));
      get().toast('Preferências de cookies salvas.');
    },

    setLocationManual: () => {
      const location = defaultLocation();
      storage.write(KEYS.location, location);
      set({ location, dialog: null });
      get().toast('Localização selecionada.');
    },

    setLocationGeo: (coords) => {
      const location: LocationState = {
        label: 'São Paulo, SP',
        mode: 'geolocation',
        coords,
      };
      // Coordinates are kept in memory only: the stored location stays manual
      storage.write(KEYS.location, defaultLocation());
      set({ location, dialog: null });
      get().toast('Localização usada para mostrar os cinemas perto de você.');
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
      const data = json as { schemaVersion?: unknown; movies?: unknown } | null;
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
      const leads = storage.read<Lead[]>(KEYS.leads, []);
      const key = email.trim().toLowerCase() + '|' + source;
      const existing = leads.find((lead) => lead.key === key);
      const item: Lead = {
        id:
          existing?.id ||
          'lead-' + Date.now() + '-' + Math.random().toString(36).slice(2, 7),
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
      storage.write(KEYS.leads, nextLeads);
      set({ leads: nextLeads });
    },
  };
});
