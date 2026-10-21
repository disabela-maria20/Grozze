'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { allCinemas } from '@/entities/cinema';
import { allMovies, movie, statusLabel, type Movie } from '@/entities/movie';
import { CATALOG_API_URL } from '@/shared/api';
import { useAppStore } from '@/shared/store';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  type OverrideImages,
  useImportContentMutation,
  usePublishOverrideMutation,
  useRemoveOverrideMutation,
  useSendLocalContentMutation,
} from '../api';
import {
  allBaseMovieIds,
  baseMovie,
  downloadFile,
  exportLeadsCsv,
} from '../lib';
import { cmsMovieSchema, type CmsMovieValues } from '../schema';
import { Button, Field, inputClass } from '@/shared/ui';
import type { MovieOverride } from '@/shared/lib/types';
import { BannersAdminTab } from './BannersAdminTab';
import { ImageField } from './ImageField';
import { NewsAdminTab } from './NewsAdminTab';
import { LookupsAdminTab } from './LookupsAdminTab';
import { UsersAdminTab } from './UsersAdminTab';

/** `[query-string value, label]` pairs for the CMS top-level tabs. */
const TABS: [string, string][] = [
  ['filmes', 'Filmes'],
  ['noticias', 'Notícias'],
  ['banners', 'Banners'],
  ['listas', 'Listas'],
  ['usuarios', 'Usuários'],
  ['leads', 'Leads'],
  ['auditoria', 'Auditoria'],
  ['dados', 'Dados e integrações'],
];

type CmsFieldKey = Exclude<keyof CmsMovieValues, 'syn'>;

/** `[form field, label, input type]` for every single-line editor input. */
const FIELDS: [CmsFieldKey, string, string][] = [
  ['t', 'Título', 'text'],
  ['releaseDate', 'Data de estreia', 'date'],
  ['director', 'Direção', 'text'],
  ['cast', 'Elenco (até quatro nomes)', 'text'],
  ['genre', 'Gênero', 'text'],
  ['dur', 'Duração', 'text'],
  ['rating', 'Classificação', 'text'],
  ['trailer', 'Trailer — ID ou URL do YouTube', 'text'],
];

/** Names of the edited fields, as the summary on top of the editor lists them. */
const OVERRIDE_LABELS: Record<keyof MovieOverride, string> = {
  t: 'Título',
  releaseDate: 'Data de estreia',
  director: 'Direção',
  cast: 'Elenco',
  genre: 'Gênero',
  dur: 'Duração',
  rating: 'Classificação',
  trailer: 'Trailer',
  trailerTitle: 'Título do trailer',
  poster: 'Pôster',
  backdrop: 'Banner',
  syn: 'Sinopse',
};

/** `[form field, label, preview shape]` of the images, picked as files. */
const IMAGE_INPUTS: ['poster' | 'backdrop', string, 'poster' | 'banner'][] = [
  ['poster', 'Pôster', 'poster'],
  ['backdrop', 'Banner', 'banner'],
];

const LEAD_COLUMNS = ['Data', 'Nome', 'E-mail', 'Origem', 'Marketing'];

const LEAD_CELL_CLASS = 'p-3.5 border-b border-line whitespace-nowrap';

const EMPTY_BOX_CLASS =
  'border border-line rounded-app p-5 bg-surface text-muted';

/** Converts a stored override into form values (missing fields become ''). */
function overrideValues(override: MovieOverride = {}): CmsMovieValues {
  return {
    t: override.t || '',
    releaseDate: override.releaseDate || '',
    director: override.director || '',
    cast: (override.cast || []).join(', '),
    genre: override.genre || '',
    dur: override.dur || '',
    rating: override.rating || '',
    poster: override.poster || '',
    backdrop: override.backdrop || '',
    trailer: override.trailer || '',
    syn: override.syn || '',
  };
}

/** Placeholder hinting at the source value that an empty field falls back to. */
function fieldPlaceholder(
  key: CmsFieldKey,
  baseData: Movie
): string | undefined {
  if (key === 'releaseDate') return undefined;
  if (key === 'cast') return (baseData.cast || []).join(', ');
  return (baseData[key as keyof Movie] as string | undefined) || 'Automático';
}

/** Updates the current URL's query string without reloading the page. */
function pushQueryParams(params: Record<string, string>) {
  const url = new URL(window.location.href);
  for (const [name, value] of Object.entries(params)) {
    url.searchParams.set(name, value);
  }
  window.history.pushState({}, '', url);
}

function SourceDataDetails({ baseData }: { baseData: Movie }) {
  return (
    <details className="text-xs text-faint mb-4.5">
      <summary className="cursor-pointer text-muted">
        Ver dado de origem e procedência
      </summary>
      <pre className="whitespace-pre-wrap break-words text-[11px] p-3.5 border border-line rounded-[10px] max-h-[250px] overflow-auto mt-2">
        {JSON.stringify(
          {
            id: baseData.id,
            title: baseData.t,
            synopsis: baseData.syn,
            director: baseData.director,
            releaseDate: baseData.releaseDate,
            cast: baseData.cast,
            source: baseData.source,
            asOf: baseData.sourceAsOf,
            imdb: baseData.imdb
              ? 'Nota herdada do arquivo; não verificada novamente'
              : null,
          },
          null,
          2
        )}
      </pre>
    </details>
  );
}

/** Clears an edited field so the catalog's value is used (on publish). */
function UseOriginalButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      className="mt-1.5 text-[11px] text-muted underline hover:text-lime"
      onClick={onClick}
    >
      Usar original
    </button>
  );
}

function CmsMovieEditor({ id }: { id: string }) {
  const content = useAppStore((s) => s.content);
  const publishOverride = usePublishOverrideMutation();
  const removeOverride = useRemoveOverrideMutation();
  const baseData = baseMovie(id);
  // Initialised once per movie; the parent remounts this editor via `key={id}`
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    control,
    formState: { errors },
  } = useForm<CmsMovieValues>({
    resolver: zodResolver(cmsMovieSchema),
    defaultValues: overrideValues(content.movies[id]),
  });
  const [images, setImages] = useState<OverrideImages>({});
  // Published image URLs ('' = the catalog's); files replace them on publish
  const [posterUrl, backdropUrl] = useWatch({
    control,
    name: ['poster', 'backdrop'],
  });
  const publishedImage = {
    poster: posterUrl ?? '',
    backdrop: backdropUrl ?? '',
  };
  const formValues = useWatch({ control });

  if (!baseData)
    return <div className={EMPTY_BOX_CLASS}>Escolha um filme.</div>;
  const effective = movie(id, content)!;

  // One request: the fields plus the picked image files (stored in S3)
  const submit = handleSubmit((values) =>
    publishOverride.mutate(
      {
        id,
        // Not in the form; sent back so publishing doesn't drop it
        values: {
          ...values,
          trailerTitle: content.movies[id]?.trailerTitle ?? '',
        },
        images,
      },
      {
        onSuccess: ({ override }) => {
          setImages({});
          reset(overrideValues(override ?? undefined));
        },
      }
    )
  );

  const published = content.movies[id];
  const editedFields = published
    ? (Object.keys(published) as (keyof MovieOverride)[]).map(
        (field) => OVERRIDE_LABELS[field] ?? field
      )
    : [];

  /** Drops the whole edit right away (the API also deletes its S3 images). */
  const restoreOriginal = () => {
    if (
      !window.confirm(
        'Voltar ao original apaga todas as edições deste filme, inclusive as imagens enviadas. O site volta a mostrar os dados do catálogo. Continuar?'
      )
    )
      return;
    removeOverride.mutate(id, {
      onSuccess: () => {
        setImages({});
        reset(overrideValues(undefined));
      },
    });
  };

  /** Clears one field; the source data comes back when the edit is published. */
  const resetToSource = (field: keyof CmsMovieValues) =>
    setValue(field, '', { shouldDirty: true });

  return (
    <div>
      <h2 className="text-[28px] leading-tight mb-2">{effective.t}</h2>
      {editedFields.length ? (
        <div className="mb-4 p-4 border border-lime/30 bg-lime-soft rounded-2xl flex items-center justify-between gap-4 flex-wrap">
          <p className="m-0 text-sm text-[#cbd5cd]">
            O site está mostrando as suas edições em:{' '}
            <strong className="text-app-text">{editedFields.join(', ')}</strong>
            .
          </p>
          <Button
            type="button"
            disabled={removeOverride.isPending}
            onClick={restoreOriginal}
          >
            {removeOverride.isPending ? 'Voltando…' : 'Voltar ao original'}
          </Button>
        </div>
      ) : (
        <p className="mb-4 text-sm text-muted">
          O site mostra os dados originais do catálogo.
        </p>
      )}
      <p className="text-xs text-faint mb-4">
        Campo vazio mantém o dado do catálogo. Publicar aplica as edições em
        todas as telas.
      </p>
      <SourceDataDetails baseData={baseData} />
      <form noValidate onSubmit={submit}>
        <div className="grid grid-cols-2 max-sm:grid-cols-1 gap-4.5">
          {FIELDS.map(([key, label, type]) => (
            <Field key={key} label={label} error={errors[key]?.message}>
              <input
                className={inputClass}
                type={type}
                aria-invalid={!!errors[key]}
                {...register(key)}
                placeholder={fieldPlaceholder(key, baseData)}
              />
              {formValues[key] ? (
                <UseOriginalButton onClick={() => resetToSource(key)} />
              ) : null}
            </Field>
          ))}
        </div>
        <div className="grid grid-cols-2 max-sm:grid-cols-1 gap-4.5">
          {IMAGE_INPUTS.map(([key, label, shape]) => (
            <div key={key}>
              <input type="hidden" {...register(key)} />
              <ImageField
                label={label}
                shape={shape}
                publishedUrl={publishedImage[key]}
                sourceUrl={baseData[key]}
                file={images[key] ?? null}
                error={errors[key]?.message}
                onFileChange={(file) =>
                  setImages((current) => ({ ...current, [key]: file }))
                }
                onRestoreSource={() => {
                  setImages((current) => ({ ...current, [key]: null }));
                  setValue(key, '', { shouldDirty: true });
                }}
              />
            </div>
          ))}
        </div>
        <Field label="Sinopse editorial" error={errors.syn?.message}>
          <textarea
            className={`${inputClass} min-h-[130px] resize-y`}
            aria-invalid={!!errors.syn}
            {...register('syn')}
            placeholder={
              baseData.syn || 'Sinopse ainda não fornecida pela origem'
            }
          />
          {formValues.syn ? (
            <UseOriginalButton onClick={() => resetToSource('syn')} />
          ) : null}
        </Field>
        <div className="flex items-center gap-2.5 flex-wrap sticky bottom-3 p-3 border border-line rounded-2xl bg-[rgba(10,16,12,.96)]">
          <Button primary type="submit" disabled={publishOverride.isPending}>
            {publishOverride.isPending ? 'Publicando…' : 'Publicar'}
          </Button>
          <Link
            className="min-h-[46px] px-5 py-2.5 rounded-full border border-line inline-flex items-center gap-2 text-sm font-semibold"
            href={`/filme/${id}`}
          >
            Ver ficha
          </Link>
        </div>
      </form>
    </div>
  );
}

function MoviesTab({
  movies,
  selectedId,
  onSelectMovie,
}: {
  movies: Movie[];
  selectedId: string;
  onSelectMovie: (id: string) => void;
}) {
  const content = useAppStore((s) => s.content);
  return (
    <div className="grid grid-cols-[270px_1fr] max-md:grid-cols-1 gap-6.5 items-start">
      <aside className="border border-line rounded-2xl bg-surface p-2 max-h-[72vh] max-md:max-h-none overflow-auto sticky top-[104px] max-md:static">
        {movies.map((listedMovie) => (
          <button
            key={listedMovie.id}
            onClick={() => onSelectMovie(listedMovie.id)}
            className={`block w-full text-left rounded-[10px] p-3 text-[13px] leading-tight ${selectedId === listedMovie.id ? 'bg-lime-soft text-lime' : ''}`}
          >
            {listedMovie.t}
            <small className="block text-[10px] text-faint mt-1">
              {[listedMovie.id, statusLabel(listedMovie)]
                .filter(Boolean)
                .join(' · ')}
              {Object.hasOwn(content.movies, listedMovie.id) && (
                <span className="text-lime font-semibold"> · Editado</span>
              )}
            </small>
          </button>
        ))}
      </aside>
      <div>
        <CmsMovieEditor key={selectedId} id={selectedId} />
      </div>
    </div>
  );
}

function LeadsTab() {
  const leads = useAppStore((s) => s.leads);
  return (
    <div>
      <div className="flex justify-between items-end gap-6 mb-4.5">
        <div>
          <h2 className="text-2xl m-0">Leads e formulários</h2>
          <p className="text-muted text-sm mt-1">
            Base local separada do conteúdo editorial.
          </p>
        </div>
        <Button onClick={() => exportLeadsCsv(leads)}>Exportar CSV</Button>
      </div>
      {leads.length ? (
        <div className="overflow-auto border border-line rounded-2xl">
          <table className="w-full border-collapse text-[13px] text-left">
            <thead>
              <tr>
                {LEAD_COLUMNS.map((column) => (
                  <th
                    key={column}
                    className="p-3.5 border-b border-line text-muted font-semibold bg-surface whitespace-nowrap"
                  >
                    {column}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {leads.map((lead) => (
                <tr key={lead.id}>
                  <td className={LEAD_CELL_CLASS}>
                    {lead.createdAt.slice(0, 10)}
                  </td>
                  <td className={LEAD_CELL_CLASS}>{lead.name}</td>
                  <td className={LEAD_CELL_CLASS}>{lead.email}</td>
                  <td className={LEAD_CELL_CLASS}>{lead.source}</td>
                  <td className={LEAD_CELL_CLASS}>
                    {lead.marketingConsent ? 'Autorizado' : 'Não autorizado'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className={EMPTY_BOX_CLASS}>Nenhum formulário recebido.</div>
      )}
      <p className="text-xs text-faint mt-4">
        Não há envio a CRM ou campanha de e-mail. Não confunda cadastro com
        consentimento para marketing.
      </p>
    </div>
  );
}

function AuditTab() {
  const audit = useAppStore((s) => s.audit);
  const content = useAppStore((s) => s.content);
  return (
    <div>
      <h2 className="text-2xl mb-4">Histórico editorial</h2>
      <div className="grid gap-2.5">
        {audit.length ? (
          audit.map((entry, index) => (
            <div
              key={index}
              className="border border-line rounded-[13px] p-3.5 text-sm"
            >
              <small className="block text-muted text-xs mb-1.5">
                {entry.date} · {entry.actor}
              </small>
              <strong>
                {entry.action} · {movie(entry.id, content)?.t || entry.id}
              </strong>
              <div>{entry.fields.join(', ')}</div>
            </div>
          ))
        ) : (
          <div className={EMPTY_BOX_CLASS}>Nenhuma intervenção registrada.</div>
        )}
      </div>
    </div>
  );
}

function DataTab() {
  const importContent = useImportContentMutation();
  const sendLocal = useSendLocalContentMutation();
  const content = useAppStore((s) => s.content);
  const localCount = useAppStore(
    (s) => Object.keys(s.localContent?.movies ?? {}).length
  );

  const exportContentJson = () => {
    downloadFile(
      'grozze-overrides-v1.json',
      JSON.stringify(content, null, 2),
      'application/json'
    );
  };

  const onImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    // Reset so picking the same file again still triggers `onChange`
    event.target.value = '';
    if (file) importContent.mutate(file);
  };

  return (
    <div>
      <h2 className="text-2xl mb-4">Catálogo e integrações</h2>
      <div className="p-6 max-sm:p-4.5 border border-line bg-surface rounded-app">
        <p className="m-0 mb-2">
          <strong>
            {allBaseMovieIds().length} filmes · {allCinemas().length} cinemas
          </strong>
        </p>
        <p className="text-muted text-sm">
          Filmes, cinemas e sessões vêm da API {CATALOG_API_URL} (cache de cinco
          minutos). As sessões são carregadas por filme.
        </p>
        <p className="text-xs text-faint mt-2.5">
          Os overrides ficam salvos na API da Grozze (as imagens enviadas, no
          S3) e se aplicam por cima dos dados do catálogo, em todas as telas e
          para todos os visitantes. Importar substitui todos os overrides.
        </p>
        {localCount > 0 && (
          <div className="mt-4 p-4 border border-lime/30 bg-lime-soft rounded-2xl text-sm">
            <p className="m-0 mb-3">
              Este navegador tem <strong>{localCount}</strong> override(s)
              publicados antes de eles serem salvos no servidor. Eles não
              aparecem no site até serem enviados.
            </p>
            <Button
              primary
              disabled={sendLocal.isPending}
              onClick={() => sendLocal.mutate()}
            >
              {sendLocal.isPending ? 'Enviando…' : 'Enviar para o servidor'}
            </Button>
          </div>
        )}
        <div className="flex items-center gap-2.5 flex-wrap mt-4.5">
          <Button onClick={exportContentJson}>Exportar overrides JSON</Button>
          <label className="min-h-[46px] px-5 py-2.5 rounded-full border border-line bg-white/[0.035] inline-flex items-center justify-center gap-2 text-sm font-semibold cursor-pointer hover:bg-lime-soft hover:border-lime/40 transition-colors">
            Importar overrides
            <input
              type="file"
              accept="application/json"
              hidden
              onChange={onImport}
            />
          </label>
        </div>
      </div>
    </div>
  );
}

export function AdminApp() {
  const searchParams = useSearchParams();
  const [tab, setTab] = useState(() => searchParams.get('tab') ?? 'filmes');
  const [selectedId, setSelectedId] = useState<string>(
    () => searchParams.get('id') ?? allBaseMovieIds()[0]
  );
  const content = useAppStore((s) => s.content);

  const movies = useMemo(() => allMovies(content), [content]);

  const selectTab = (nextTab: string) => {
    setTab(nextTab);
    pushQueryParams({ tab: nextTab });
  };
  const selectMovie = (id: string) => {
    setSelectedId(id);
    pushQueryParams({ tab: 'filmes', id });
  };

  const logout = useAppStore((s) => s.logout);

  return (
    <div className="page pt-[120px] max-sm:pt-[101px] pb-13 min-h-[65vh]">
      <div className="w-[min(1220px,calc(100%-56px))] max-sm:w-[calc(100%-32px)] mx-auto">
        <header className="mb-4.5 flex items-start justify-between gap-4">
          <div>
            <p className="text-[11px] tracking-[0.17em] uppercase font-extrabold text-lime mb-2">
              Conteúdo e operação
            </p>
            <h1 className="text-[48px] max-sm:text-[36px] -tracking-[0.05em] leading-[1.05]">
              Grozze CMS
            </h1>
          </div>
          <Button type="button" onClick={logout} className="shrink-0">
            Sair
          </Button>
        </header>
        <nav className="flex gap-2 mb-6 overflow-auto no-scrollbar">
          {TABS.map(([value, label]) => (
            <button
              key={value}
              onClick={() => selectTab(value)}
              className={`border border-line bg-surface2 text-[#cbd5cd] rounded-full px-3.5 py-2 min-h-10 text-[13px] whitespace-nowrap shrink-0 ${
                tab === value
                  ? 'bg-lime! text-[#081004]! border-lime! font-bold!'
                  : ''
              }`}
            >
              {label}
            </button>
          ))}
        </nav>
        {tab === 'filmes' && (
          <MoviesTab
            movies={movies}
            selectedId={selectedId}
            onSelectMovie={selectMovie}
          />
        )}
        {tab === 'noticias' && <NewsAdminTab />}
        {tab === 'banners' && <BannersAdminTab />}
        {tab === 'listas' && <LookupsAdminTab />}
        {tab === 'usuarios' && <UsersAdminTab />}
        {tab === 'leads' && <LeadsTab />}
        {tab === 'auditoria' && <AuditTab />}
        {tab === 'dados' && <DataTab />}
      </div>
    </div>
  );
}
