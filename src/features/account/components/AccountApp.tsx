'use client';

import Link from 'next/link';
import type { ReactNode } from 'react';
import { allMovies, sortedCinemas } from '@/shared/lib/catalog';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAppStore } from '@/shared/store';
import {
  useUpdatePreferencesMutation,
  useUpdateProfileNameMutation,
} from '../api';
import {
  FORMAT_OPTIONS,
  LANGUAGE_OPTIONS,
  preferencesSchema,
  type PreferencesValues,
  profileNameSchema,
  type ProfileNameValues,
} from '../schema';
import { AuthDialog } from '@/features/auth';
import { Avatar } from './Avatar';
import { CinemaCard } from '@/features/cinemas';
import { MovieCard } from '@/features/movies';
import {
  Button,
  EmptyState,
  Field,
  GenrePicker,
  TextLink,
  inputClass,
} from '@/shared/ui';

/** `[route segment under /minha-grozze, label]`; '' is the overview page. */
const ACCOUNT_TABS: [string, string][] = [
  ['', 'Visão geral'],
  ['salvos', 'Filmes favoritos'],
  ['cinemas', 'Cinemas favoritos'],
  ['preferencias', 'Preferências'],
  ['conta', 'Conta'],
];

const AVATAR_OPTIONS: ['initial' | 'star' | 'moon' | 'sun', string][] = [
  ['initial', 'Inicial'],
  ['star', '★'],
  ['moon', '☾'],
  ['sun', '☀'],
];
const AVATAR_CHARS: Record<string, string> = { star: '★', moon: '☾', sun: '☀' };

const PAGE_CLASS = 'page pt-[120px] max-sm:pt-[101px] pb-13 min-h-[65vh]';
const CARD_CLASS = 'p-6 max-sm:p-4.5 border border-line bg-surface rounded-app';
const PAGE_TITLE_CLASS = 'text-[42px] max-sm:text-[33px] -tracking-[0.05em]';
const STAT_LINK_CLASS = 'border border-line rounded-2xl p-4.5 bg-surface';
const SECTION_LINK_CLASS = 'text-xs text-[#dce3dc] hover:text-lime';
const OUTLINE_BUTTON_CLASS =
  'min-h-[46px] px-5 py-2.5 rounded-full border border-line inline-flex items-center gap-2 text-sm font-semibold';

type SavedMovies = ReturnType<typeof allMovies>;
type FavoriteCinemas = ReturnType<typeof sortedCinemas>;

function accountTabHref(segment: string) {
  return `/minha-grozze${segment ? '/' + segment : ''}`;
}

/** Empty state with a call-to-action link (used by every favorites list). */
function EmptyStateWithLink({
  message,
  href,
  linkLabel,
}: {
  message: string;
  href: string;
  linkLabel: string;
}) {
  return (
    <EmptyState>
      <p>{message}</p>
      <a className={OUTLINE_BUTTON_CLASS} href={href}>
        {linkLabel}
      </a>
    </EmptyState>
  );
}

function MovieGrid({ movies }: { movies: SavedMovies }) {
  return (
    <div className="grid grid-cols-4 max-sm:grid-cols-3 gap-4">
      {movies.map((savedMovie) => (
        <MovieCard key={savedMovie.id} m={savedMovie} />
      ))}
    </div>
  );
}

/** Cinema cards, or `emptyState` when there are none. */
function CinemaList({
  cinemas,
  emptyState,
}: {
  cinemas: FavoriteCinemas;
  emptyState: ReactNode;
}) {
  return (
    <div className="grid gap-3">
      {cinemas.length
        ? cinemas.map((cinema) => <CinemaCard key={cinema.id} c={cinema} />)
        : emptyState}
    </div>
  );
}

function SectionHeader({ title, link }: { title: string; link: ReactNode }) {
  return (
    <div className="flex justify-between items-end gap-6 mb-4">
      <h2 className="text-2xl m-0">{title}</h2>
      {link}
    </div>
  );
}

function CookiePreferencesLink() {
  const openDialog = useAppStore((s) => s.openDialog);
  return (
    <TextLink onClick={() => openDialog('consent')}>
      Preferências de cookies →
    </TextLink>
  );
}

function OverviewTab({
  savedMovies,
  favoriteCinemas,
}: {
  savedMovies: SavedMovies;
  favoriteCinemas: FavoriteCinemas;
}) {
  const profile = useAppStore((s) => s.profile())!;
  const firstName = profile.name.split(' ')[0];
  return (
    <>
      <p className="text-[11px] tracking-[0.17em] uppercase font-extrabold text-lime mb-2">
        Minha Grozze
      </p>
      <h1 className={`${PAGE_TITLE_CLASS} leading-[1.1] m-0 mb-3`}>
        Olá, {firstName}.
      </h1>
      <p className="text-muted text-sm">
        Seus filmes e cinemas, no mesmo lugar.
      </p>
      <div className="grid grid-cols-2 gap-3 my-5.5">
        <Link className={STAT_LINK_CLASS} href="/minha-grozze/salvos">
          <b className="block text-[27px] leading-tight">
            {savedMovies.length}
          </b>
          <span className="text-xs text-muted">Filmes favoritos</span>
        </Link>
        <Link className={STAT_LINK_CLASS} href="/minha-grozze/cinemas">
          <b className="block text-[27px] leading-tight">
            {favoriteCinemas.length}
          </b>
          <span className="text-xs text-muted">Cinemas favoritos</span>
        </Link>
      </div>
      <section className="my-6.5">
        <SectionHeader
          title="Filmes favoritos"
          link={
            <Link className={SECTION_LINK_CLASS} href="/minha-grozze/salvos">
              Ver todos →
            </Link>
          }
        />
        {savedMovies.length ? (
          <MovieGrid movies={savedMovies.slice(0, 6)} />
        ) : (
          <EmptyStateWithLink
            message="Guarde os filmes que você quer encontrar depois."
            href="/filmes"
            linkLabel="Descobrir filmes"
          />
        )}
      </section>
      <section className="my-6.5">
        <SectionHeader
          title="Cinemas favoritos"
          link={
            <a className={SECTION_LINK_CLASS} href="/cinemas?favoritos=1">
              Gerenciar →
            </a>
          }
        />
        <CinemaList
          cinemas={favoriteCinemas}
          emptyState={
            <EmptyStateWithLink
              message="Seus cinemas favoritos aparecerão aqui."
              href="/cinemas"
              linkLabel="Encontrar cinemas"
            />
          }
        />
      </section>
    </>
  );
}

function SavedMoviesTab({ savedMovies }: { savedMovies: SavedMovies }) {
  return (
    <>
      <h1 className={`${PAGE_TITLE_CLASS} m-0 mb-4`}>Filmes favoritos</h1>
      {savedMovies.length ? (
        <MovieGrid movies={savedMovies} />
      ) : (
        <EmptyStateWithLink
          message="Nenhum filme salvo ainda."
          href="/filmes"
          linkLabel="Descobrir filmes"
        />
      )}
    </>
  );
}

function FavoriteCinemasTab({
  favoriteCinemas,
}: {
  favoriteCinemas: FavoriteCinemas;
}) {
  return (
    <>
      <h1 className={`${PAGE_TITLE_CLASS} m-0 mb-4`}>Cinemas favoritos</h1>
      <CinemaList
        cinemas={favoriteCinemas}
        emptyState={
          <EmptyStateWithLink
            message="Nenhum cinema favorito ainda."
            href="/cinemas"
            linkLabel="Encontrar cinemas"
          />
        }
      />
    </>
  );
}

function PreferencesTab() {
  const profile = useAppStore((s) => s.profile())!;
  const updatePreferences = useUpdatePreferencesMutation();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<PreferencesValues>({
    resolver: zodResolver(preferencesSchema),
    defaultValues: {
      language: (profile.preferences?.language ||
        'Todos') as PreferencesValues['language'],
      format: (profile.preferences?.format ||
        'Todos') as PreferencesValues['format'],
      genres: profile.preferences?.genres ?? [],
    },
  });

  return (
    <>
      <h1 className={`${PAGE_TITLE_CLASS} m-0 mb-3`}>Preferências</h1>
      <p className="text-muted text-sm mb-5">
        Suas escolhas priorizam sessões compatíveis sem esconder as outras.
      </p>
      <form
        className={CARD_CLASS}
        onSubmit={handleSubmit((values) => updatePreferences.mutate(values))}
      >
        <Field label="Idioma preferido" error={errors.language?.message}>
          <select
            className={inputClass}
            aria-invalid={!!errors.language}
            {...register('language')}
          >
            {LANGUAGE_OPTIONS.map((option) => (
              <option key={option}>{option}</option>
            ))}
          </select>
        </Field>
        <Field label="Experiência preferida" error={errors.format?.message}>
          <select
            className={inputClass}
            aria-invalid={!!errors.format}
            {...register('format')}
          >
            {FORMAT_OPTIONS.map((option) => (
              <option key={option}>{option}</option>
            ))}
          </select>
        </Field>
        <GenrePicker
          label="Gêneros favoritos"
          error={errors.genres?.message}
          inputProps={register('genres')}
        />
        <Button primary type="submit" disabled={updatePreferences.isPending}>
          {updatePreferences.isPending ? 'Salvando…' : 'Salvar preferências'}
        </Button>
      </form>
      <div className="mt-5">
        <CookiePreferencesLink />
      </div>
    </>
  );
}

function AvatarPicker() {
  const profile = useAppStore((s) => s.profile())!;
  const setAvatar = useAppStore((s) => s.setAvatar);
  const currentAvatar = profile.avatar || 'initial';
  const initial = profile.name.charAt(0).toUpperCase();
  return (
    <div
      className="flex flex-wrap gap-2.5 mb-5"
      role="group"
      aria-label="Escolha seu avatar"
    >
      {AVATAR_OPTIONS.map(([avatar]) => (
        <button
          key={avatar}
          type="button"
          onClick={() => setAvatar(avatar)}
          aria-pressed={currentAvatar === avatar}
          aria-label={`Avatar ${avatar}`}
          className="p-1 bg-none border border-transparent rounded-full aria-[pressed=true]:border-lime"
        >
          <span className="w-[60px] h-[60px] text-[25px] inline-grid place-items-center rounded-full font-extrabold bg-lime text-[#091006]">
            {avatar === 'initial' ? initial : AVATAR_CHARS[avatar]}
          </span>
        </button>
      ))}
    </div>
  );
}

function AccountTab() {
  const profile = useAppStore((s) => s.profile())!;
  const logout = useAppStore((s) => s.logout);
  const updateProfileName = useUpdateProfileNameMutation();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ProfileNameValues>({
    resolver: zodResolver(profileNameSchema),
    defaultValues: { name: profile.name },
  });

  return (
    <>
      <h1 className={`${PAGE_TITLE_CLASS} m-0 mb-3`}>Sua conta</h1>
      <form
        className={CARD_CLASS}
        noValidate
        onSubmit={handleSubmit(({ name }) => updateProfileName.mutate(name))}
      >
        <AvatarPicker />
        <Field label="Nome" error={errors.name?.message}>
          <input
            className={inputClass}
            autoComplete="name"
            aria-invalid={!!errors.name}
            {...register('name')}
          />
        </Field>
        <Field label="E-mail">
          <input className={inputClass} value={profile.email} readOnly />
        </Field>
        <Button primary type="submit" disabled={updateProfileName.isPending}>
          {updateProfileName.isPending ? 'Salvando…' : 'Salvar dados'}
        </Button>
        <TextLink className="ml-4" onClick={logout} type="button">
          Sair
        </TextLink>
      </form>
      <div className="mt-4.5">
        <CookiePreferencesLink />
      </div>
    </>
  );
}

/** Picks the main-panel content for the `/minha-grozze/<part>` route. */
function renderAccountPart(
  part: string,
  savedMovies: SavedMovies,
  favoriteCinemas: FavoriteCinemas
): ReactNode {
  switch (part) {
    case 'salvos':
      return <SavedMoviesTab savedMovies={savedMovies} />;
    case 'cinemas':
      return <FavoriteCinemasTab favoriteCinemas={favoriteCinemas} />;
    case 'preferencias':
      return <PreferencesTab />;
    case 'conta':
      return <AccountTab />;
    default:
      return (
        <OverviewTab
          savedMovies={savedMovies}
          favoriteCinemas={favoriteCinemas}
        />
      );
  }
}

function AccountSidebar({ part }: { part: string }) {
  const profile = useAppStore((s) => s.profile());
  const logout = useAppStore((s) => s.logout);
  return (
    <aside className="border border-line rounded-[19px] p-5 sticky top-[104px] min-w-0 max-sm:static max-sm:w-full max-sm:border-0 max-sm:p-0 max-sm:rounded-none">
      <div className="text-center min-w-0 max-sm:grid max-sm:grid-cols-[48px_1fr] max-sm:text-left max-sm:gap-x-3 max-sm:items-center">
        <Avatar size="large" />
        <strong className="block mt-2.5 text-base max-sm:mt-0 max-sm:self-end break-words">
          {profile!.name}
        </strong>
        <small className="block text-muted text-xs mt-1 max-sm:self-start break-words">
          {profile!.email}
        </small>
      </div>
      <nav
        className="grid gap-1 mt-5 max-sm:flex max-sm:overflow-auto max-sm:no-scrollbar max-sm:mt-4 max-sm:pb-1"
        aria-label="Minha Grozze"
      >
        {ACCOUNT_TABS.map(([segment, label]) => (
          <a
            key={segment}
            href={accountTabHref(segment)}
            className={`px-3 py-2.5 rounded-xl text-left text-[13px] whitespace-nowrap max-sm:border max-sm:border-line max-sm:rounded-full max-sm:flex-none ${
              part === segment ? 'bg-lime-soft text-lime' : 'text-muted'
            }`}
          >
            {label}
          </a>
        ))}
        <button
          type="button"
          onClick={logout}
          className="px-3 py-2.5 rounded-xl text-left text-[13px] text-muted max-sm:hidden"
        >
          Sair
        </button>
      </nav>
    </aside>
  );
}

export function AccountApp({ part = '' }: { part?: string }) {
  const content = useAppStore((s) => s.content);
  const logged = useAppStore((s) => s.logged());
  const cinemaSaved = useAppStore((s) => s.cinemaSaved);
  const movieSaved = useAppStore((s) => s.movieSaved);

  if (!logged) {
    return (
      <div className={PAGE_CLASS}>
        <div className="w-[min(1220px,530px)] max-sm:w-[calc(100%-32px)] mx-auto">
          <div className={CARD_CLASS}>
            <AuthDialog signup={false} />
          </div>
        </div>
      </div>
    );
  }

  const savedMovies = allMovies(content).filter((m) => movieSaved(m.id));
  const favoriteCinemas = sortedCinemas(cinemaSaved).filter((c) =>
    cinemaSaved(c.id)
  );

  return (
    <div className={PAGE_CLASS}>
      <div className="w-[min(1220px,calc(100%-56px))] max-sm:w-[calc(100%-32px)] mx-auto grid grid-cols-[215px_1fr] max-md:grid-cols-[180px_1fr] max-sm:flex max-sm:flex-col gap-9 max-md:gap-6 max-sm:gap-5.5 items-start">
        <AccountSidebar part={part} />
        <section className="min-w-0 w-full">
          {renderAccountPart(part, savedMovies, favoriteCinemas)}
        </section>
      </div>
    </div>
  );
}
