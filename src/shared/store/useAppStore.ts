'use client';

import { validateOverride } from '@/shared/lib/catalog/validateOverride';
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

const arrayIds = (v: unknown): string[] =>
  Array.isArray(v) ? [...new Set(v.map((x) => String(x)))] : [];

function migrateProfiles(): Record<string, Profile> {
  let profiles = storage.read<Record<string, Profile>>(KEYS.profiles, {});
  if (!profiles || typeof profiles !== 'object' || Array.isArray(profiles))
    profiles = {};
  const old = storage.read<{ email?: string; name?: string } | null>(
    'grozzeUser',
    null
  );
  if (old?.email && !Object.hasOwn(profiles, old.email.toLowerCase())) {
    const email = old.email.toLowerCase();
    profiles[email] = {
      name: String(old.name || email.split('@')[0]),
      email,
      savedMovies: arrayIds(storage.read('grozzeSaved', [])),
      savedCinemas: arrayIds(storage.read('grozzeFavCinemas', [])),
      preferences: { language: 'Todos', format: 'Todos' },
      avatar: 'initial',
    };
    storage.write(KEYS.profiles, profiles);
  }
  return profiles;
}

function migrateContent(): ContentState {
  const existing = storage.read<ContentState | null>(KEYS.content, null);
  if (existing?.movies) return existing;
  const content: ContentState = { schemaVersion: 1, movies: {} };
  const old = storage.read<{ movies?: unknown } | null>('grozzeCmsV27', {});
  if (old?.movies && typeof old.movies === 'object') {
    for (const [id, o] of Object.entries<Record<string, unknown> | null>(
      old.movies as Record<string, Record<string, unknown> | null>
    )) {
      if (!o || typeof o !== 'object') continue;
      const v: MovieOverride = {};
      const fieldMap: Record<string, Exclude<keyof MovieOverride, 'cast'>> = {
        title: 't',
        synopsis: 'syn',
        director: 'director',
        hero: 'backdrop',
        poster: 'poster',
        trailer: 'trailer',
        trailerTitle: 'trailerTitle',
      };
      for (const [from, to] of Object.entries(fieldMap)) {
        const value = o[from];
        if (typeof value === 'string' && value.trim()) v[to] = value.trim();
      }
      if (Array.isArray(o.cast))
        v.cast = o.cast
          .filter((x: unknown): x is string => typeof x === 'string')
          .slice(0, 4);
      if (Object.keys(v).length) content.movies[id] = v;
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
    marketingConsent?: boolean
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

function logAudit(action: string, id: string, fields: string[] = []) {
  const a = storage.read<AuditEntry[]>(KEYS.audit, []);
  a.unshift({
    date: new Date().toISOString(),
    action,
    id: String(id || ''),
    fields,
    actor: 'Editor de homologação',
  });
  storage.write(KEYS.audit, a.slice(0, 250));
  return a.slice(0, 250);
}

const initialProfiles = migrateProfiles();

const initialContent = migrateContent();

const initialSession = tabStorage.read<{ email: string; mode: string } | null>(
  KEYS.session,
  null
);

const initialUserKey =
  initialSession?.email && Object.hasOwn(initialProfiles, initialSession.email)
    ? initialSession.email
    : null;

export const useAppStore = create<AppState>((set, get) => ({
  profiles: initialProfiles,
  userKey: initialUserKey,
  consent: storage.read<ConsentState | null>(KEYS.consent, null),
  content: initialContent,
  location: storage.read<LocationState>(KEYS.location, {
    label: 'São Paulo, SP',
    mode: 'manual',
  }),
  audit: storage.read<AuditEntry[]>(KEYS.audit, []),
  leads: storage.read<Lead[]>(KEYS.leads, []),
  pending: null,
  dialog: null,
  toastMessage: null,
  toastToken: 0,
  hasHero: false,
  setHasHero: (v) => set({ hasHero: v }),

  profile: () => {
    const { userKey, profiles } = get();
    return userKey && Object.hasOwn(profiles, userKey)
      ? profiles[userKey]
      : null;
  },
  logged: () => !!get().profile(),
  movieSaved: (id) => {
    const p = get().profile();
    return !!p && arrayIds(p.savedMovies).includes(String(id));
  },
  cinemaSaved: (id) => {
    const p = get().profile();
    return !!p && arrayIds(p.savedCinemas).includes(String(id));
  },

  toast: (message) =>
    set((s) => ({ toastMessage: message, toastToken: s.toastToken + 1 })),
  clearToast: () => set({ toastMessage: null }),
  openDialog: (id, props) => set({ dialog: { id, props } }),
  closeDialog: () => set({ dialog: null }),

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

  applyFavorite: (kind, id, force = null) => {
    const state = get();
    const p = state.profile();
    if (!p) return;
    const key = kind === 'movie' ? 'savedMovies' : 'savedCinemas';
    const set2 = new Set(arrayIds(p[key]));
    const next = force === null ? !set2.has(id) : force;
    if (next) set2.add(id);
    else set2.delete(id);
    const updatedProfile: Profile = { ...p, [key]: [...set2] };
    const profiles = { ...state.profiles, [p.email]: updatedProfile };
    storage.write(KEYS.profiles, profiles);
    set({ profiles });
    state.toast(
      next
        ? kind === 'movie'
          ? 'Filme salvo'
          : 'Cinema salvo'
        : kind === 'movie'
          ? 'Filme removido dos favoritos'
          : 'Cinema removido dos favoritos'
    );
  },

  completeLogin: (name, email, signup = false, marketingConsent = false) => {
    const normalizedEmail = email.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
      get().toast('Informe um e-mail válido.');
      return { ok: false, hadPending: false };
    }
    const state = get();
    const prev = Object.hasOwn(state.profiles, normalizedEmail)
      ? state.profiles[normalizedEmail]
      : null;
    const nextProfile: Profile = {
      name: name.trim() || prev?.name || normalizedEmail.split('@')[0],
      email: normalizedEmail,
      savedMovies: arrayIds(prev?.savedMovies),
      savedCinemas: arrayIds(prev?.savedCinemas),
      avatar: prev?.avatar || 'initial',
      preferences: prev?.preferences || { language: 'Todos', format: 'Todos' },
    };
    const profiles = { ...state.profiles, [normalizedEmail]: nextProfile };
    storage.write(KEYS.profiles, profiles);
    tabStorage.write(KEYS.session, { email: normalizedEmail, mode: 'demo' });
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
      get().toast('Você entrou na conta de teste.');
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
    const p = state.profile();
    if (!p) return;
    const updated = { ...p, name: name.trim() };
    const profiles = { ...state.profiles, [p.email]: updated };
    storage.write(KEYS.profiles, profiles);
    set({ profiles });
    state.toast('Dados atualizados.');
  },

  updatePreferences: (prefs) => {
    const state = get();
    const p = state.profile();
    if (!p) return;
    const updated = { ...p, preferences: prefs };
    const profiles = { ...state.profiles, [p.email]: updated };
    storage.write(KEYS.profiles, profiles);
    set({ profiles });
    state.toast('Preferências salvas.');
  },

  setAvatar: (avatar) => {
    const state = get();
    const p = state.profile();
    if (!p) return;
    const updated = { ...p, avatar };
    const profiles = { ...state.profiles, [p.email]: updated };
    storage.write(KEYS.profiles, profiles);
    set({ profiles });
  },

  saveConsent: (optional) => {
    const consent: ConsentState = {
      version: 1,
      essential: true,
      preferences: !!optional,
      date: new Date().toISOString(),
    };
    storage.write(KEYS.consent, consent);
    set((s) => ({
      consent,
      dialog: s.dialog?.id === 'consent' ? null : s.dialog,
    }));
    get().toast('Preferências de cookies salvas.');
  },

  setLocationManual: () => {
    const location: LocationState = { label: 'São Paulo, SP', mode: 'manual' };
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
    storage.write(KEYS.location, { label: 'São Paulo, SP', mode: 'manual' });
    set({ location, dialog: null });
    get().toast('Localização usada para ordenar os cinemas da amostra.');
  },

  publishOverride: (id, values) => {
    const o = validateOverride(values);
    const state = get();
    const movies = { ...state.content.movies };
    if (Object.keys(o).length) movies[id] = o;
    else delete movies[id];
    const content: ContentState = { schemaVersion: 1, movies };
    storage.write(KEYS.content, content);
    const audit = logAudit('Override publicado', id, Object.keys(o));
    set({ content, audit });
    state.toast('Conteúdo publicado nesta homologação.');
  },

  removeOverride: (id) => {
    const state = get();
    const movies = { ...state.content.movies };
    delete movies[id];
    const content: ContentState = { schemaVersion: 1, movies };
    storage.write(KEYS.content, content);
    const audit = logAudit('Override removido', id);
    set({ content, audit });
    state.toast('Dados de origem restaurados.');
  },

  importContent: (json) => {
    const data = json as { schemaVersion?: unknown; movies?: unknown } | null;
    if (
      data?.schemaVersion !== 1 ||
      !data.movies ||
      typeof data.movies !== 'object'
    ) {
      throw new Error('Formato de arquivo inválido.');
    }
    const next: ContentState = { schemaVersion: 1, movies: {} };
    for (const [id, o] of Object.entries(
      data.movies as Record<string, Record<string, unknown>>
    )) {
      next.movies[id] = validateOverride(o);
    }
    storage.write(KEYS.content, next);
    const audit = logAudit(
      'Overrides importados',
      '-',
      Object.keys(next.movies)
    );
    set({ content: next, audit });
    get().toast('Overrides importados nesta homologação.');
  },

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
    const existing = leads.find((l) => l.key === key);
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
    let next: Lead[];
    if (existing) next = leads.map((l) => (l.key === key ? item : l));
    else next = [item, ...leads];
    storage.write(KEYS.leads, next);
    set({ leads: next });
  },
}));
