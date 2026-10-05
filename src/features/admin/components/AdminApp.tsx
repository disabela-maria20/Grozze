'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  allBaseMovieIds,
  allCinemas,
  allMovies,
  baseMovie,
  movie,
  statusLabel,
} from '@/shared/lib/catalog';
import { CATALOG_API_URL } from '@/shared/api';
import { exportLeadsCsv, useAppStore, downloadFile } from '@/shared/store';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  useImportContentMutation,
  usePublishOverrideMutation,
  useRemoveOverrideMutation,
} from '../api';
import { cmsMovieSchema, type CmsMovieValues } from '../schema';
import { Button, Field, inputClass } from '@/shared/ui';
import type { Movie, MovieOverride } from '@/shared/lib/types';

/** `[query-string value, label]` pairs for the CMS top-level tabs. */
const TABS: [string, string][] = [
  ['filmes', 'Filmes'],
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
  ['poster', 'Pôster — URL HTTPS', 'url'],
  ['backdrop', 'Banner — URL HTTPS', 'url'],
  ['trailer', 'Trailer — ID ou URL do YouTube', 'text'],
];

const IMAGE_FIELDS: CmsFieldKey[] = ['poster', 'backdrop'];

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
  if (IMAGE_FIELDS.includes(key)) return 'Manter imagem de origem';
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
    formState: { errors },
  } = useForm<CmsMovieValues>({
    resolver: zodResolver(cmsMovieSchema),
    defaultValues: overrideValues(content.movies[id]),
  });

  if (!baseData)
    return <div className={EMPTY_BOX_CLASS}>Escolha um filme.</div>;
  const effective = movie(id, content)!;

  const submit = handleSubmit((values) =>
    publishOverride.mutate({ id, values })
  );

  const restoreAutomatic = () =>
    removeOverride.mutate(id, {
      onSuccess: () => reset(overrideValues(undefined)),
    });

  return (
    <div>
      <h2 className="text-[28px] leading-tight mb-2">{effective.t}</h2>
      <p className="text-xs text-faint mb-4">
        Campo vazio mantém o dado de origem. Publicar aplica o override a todas
        as telas.
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
            </Field>
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
        </Field>
        <div className="flex items-center gap-2.5 flex-wrap sticky bottom-3 p-3 border border-line rounded-2xl bg-[rgba(10,16,12,.96)]">
          <Button primary type="submit" disabled={publishOverride.isPending}>
            {publishOverride.isPending ? 'Publicando…' : 'Publicar'}
          </Button>
          <Button
            type="button"
            disabled={removeOverride.isPending}
            onClick={restoreAutomatic}
          >
            Restaurar automático
          </Button>
          <Link
            className="min-h-[46px] px-5 py-2.5 rounded-full border border-line inline-flex items-center gap-2 text-sm font-semibold"
            href={`/filme/${id}`}
          >
            Ver ficha
          </Link>
        </div>
        {Object.hasOwn(content.movies, id) && (
          <p className="text-xs text-faint mt-3">Override ativo.</p>
        )}
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
              {listedMovie.id} · {statusLabel(listedMovie)}
              {Object.hasOwn(content.movies, listedMovie.id)
                ? ' · Override'
                : ''}
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
  const content = useAppStore((s) => s.content);

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
          Os overrides publicados aqui se aplicam por cima dos dados da API, em
          todas as telas, incluindo a Home.
        </p>
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

  return (
    <div className="page pt-[120px] max-sm:pt-[101px] pb-13 min-h-[65vh]">
      <div className="w-[min(1220px,calc(100%-56px))] max-sm:w-[calc(100%-32px)] mx-auto">
        <header className="mb-4.5">
          <p className="text-[11px] tracking-[0.17em] uppercase font-extrabold text-lime mb-2">
            Conteúdo e operação
          </p>
          <h1 className="text-[48px] max-sm:text-[36px] -tracking-[0.05em] leading-[1.05]">
            Grozze CMS
          </h1>
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
        {tab === 'leads' && <LeadsTab />}
        {tab === 'auditoria' && <AuditTab />}
        {tab === 'dados' && <DataTab />}
      </div>
    </div>
  );
}
