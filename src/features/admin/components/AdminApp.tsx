'use client';

import { useMemo, useState } from 'react';
import { allBaseMovieIds } from '@/shared/lib/catalog/allBaseMovieIds';
import { allCinemas } from '@/shared/lib/catalog/allCinemas';
import { allMovies } from '@/shared/lib/catalog/allMovies';
import { baseMovie } from '@/shared/lib/catalog/baseMovie';
import { META } from '@/shared/lib/catalog/META';
import { movie } from '@/shared/lib/catalog/movie';
import { SESSIONS } from '@/shared/lib/catalog/SESSIONS';
import { statusLabel } from '@/shared/lib/catalog/statusLabel';
import { exportLeadsCsv } from '@/shared/store/exportLeadsCsv';
import { useAppStore } from '@/shared/store/useAppStore';
import { downloadFile } from '@/shared/store/downloadFile';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useImportContentMutation } from '../api/useImportContentMutation';
import { usePublishOverrideMutation } from '../api/usePublishOverrideMutation';
import { useRemoveOverrideMutation } from '../api/useRemoveOverrideMutation';
import { cmsMovieSchema, type CmsMovieValues } from '../schema/cmsMovieSchema';
import { Button } from '@/shared/ui/Button';
import { Field } from '@/shared/ui/Field';
import { inputClass } from '@/shared/ui/inputClass';
import type { Movie, MovieOverride } from '@/shared/lib/types';

const TABS: [string, string][] = [
  ['filmes', 'Filmes'],
  ['leads', 'Leads'],
  ['auditoria', 'Auditoria'],
  ['dados', 'Dados e integrações'],
];

const FIELDS: [Exclude<keyof CmsMovieValues, 'syn'>, string, string][] = [
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

function overrideValues(o: MovieOverride = {}): CmsMovieValues {
  return {
    t: o.t || '',
    releaseDate: o.releaseDate || '',
    director: o.director || '',
    cast: (o.cast || []).join(', '),
    genre: o.genre || '',
    dur: o.dur || '',
    rating: o.rating || '',
    poster: o.poster || '',
    backdrop: o.backdrop || '',
    trailer: o.trailer || '',
    syn: o.syn || '',
  };
}

function CmsMovieEditor({ id }: { id: string }) {
  const content = useAppStore((s) => s.content);
  const publishOverride = usePublishOverrideMutation();
  const removeOverride = useRemoveOverrideMutation();
  const b = baseMovie(id);
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

  if (!b)
    return (
      <div className="border border-line rounded-app p-5 bg-surface text-muted">
        Escolha um filme.
      </div>
    );
  const effective = movie(id, content)!;

  const submit = handleSubmit((values) =>
    publishOverride.mutate({ id, values })
  );

  return (
    <div>
      <h2 className="text-[28px] leading-tight mb-2">{effective.t}</h2>
      <p className="text-xs text-faint mb-4">
        Campo vazio mantém o dado de origem. Publicar aplica o override a todas
        as telas.
      </p>
      <details className="text-xs text-faint mb-4.5">
        <summary className="cursor-pointer text-muted">
          Ver dado de origem e procedência
        </summary>
        <pre className="whitespace-pre-wrap break-words text-[11px] p-3.5 border border-line rounded-[10px] max-h-[250px] overflow-auto mt-2">
          {JSON.stringify(
            {
              id: b.id,
              title: b.t,
              synopsis: b.syn,
              director: b.director,
              releaseDate: b.releaseDate,
              cast: b.cast,
              source: b.source,
              asOf: b.sourceAsOf,
              imdb: b.imdb
                ? 'Nota herdada do arquivo; não verificada novamente'
                : null,
            },
            null,
            2
          )}
        </pre>
      </details>
      <form noValidate onSubmit={submit}>
        <div className="grid grid-cols-2 max-sm:grid-cols-1 gap-4.5">
          {FIELDS.map(([k, l, type]) => (
            <Field key={k} label={l} error={errors[k]?.message}>
              <input
                className={inputClass}
                type={type}
                aria-invalid={!!errors[k]}
                {...register(k)}
                placeholder={
                  k === 'releaseDate'
                    ? undefined
                    : ['poster', 'backdrop'].includes(k)
                      ? 'Manter imagem de origem'
                      : k === 'cast'
                        ? (b.cast || []).join(', ')
                        : (b[k as keyof Movie] as string | undefined) ||
                          'Automático'
                }
              />
            </Field>
          ))}
        </div>
        <Field label="Sinopse editorial" error={errors.syn?.message}>
          <textarea
            className={`${inputClass} min-h-[130px] resize-y`}
            aria-invalid={!!errors.syn}
            {...register('syn')}
            placeholder={b.syn || 'Sinopse ainda não fornecida pela origem'}
          />
        </Field>
        <div className="flex items-center gap-2.5 flex-wrap sticky bottom-3 p-3 border border-line rounded-2xl bg-[rgba(10,16,12,.96)]">
          <Button primary type="submit" disabled={publishOverride.isPending}>
            {publishOverride.isPending ? 'Publicando…' : 'Publicar'}
          </Button>
          <Button
            type="button"
            disabled={removeOverride.isPending}
            onClick={() =>
              removeOverride.mutate(id, {
                onSuccess: () => reset(overrideValues(undefined)),
              })
            }
          >
            Restaurar automático
          </Button>
          <a
            className="min-h-[46px] px-5 py-2.5 rounded-full border border-line inline-flex items-center gap-2 text-sm font-semibold"
            href={`/filme/${id}`}
          >
            Ver ficha
          </a>
        </div>
        {Object.hasOwn(content.movies, id) && (
          <p className="text-xs text-faint mt-3">Override ativo.</p>
        )}
      </form>
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
                {['Data', 'Nome', 'E-mail', 'Origem', 'Marketing'].map((h) => (
                  <th
                    key={h}
                    className="p-3.5 border-b border-line text-muted font-semibold bg-surface whitespace-nowrap"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {leads.map((l) => (
                <tr key={l.id}>
                  <td className="p-3.5 border-b border-line whitespace-nowrap">
                    {l.createdAt.slice(0, 10)}
                  </td>
                  <td className="p-3.5 border-b border-line whitespace-nowrap">
                    {l.name}
                  </td>
                  <td className="p-3.5 border-b border-line whitespace-nowrap">
                    {l.email}
                  </td>
                  <td className="p-3.5 border-b border-line whitespace-nowrap">
                    {l.source}
                  </td>
                  <td className="p-3.5 border-b border-line whitespace-nowrap">
                    {l.marketingConsent ? 'Autorizado' : 'Não autorizado'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="border border-line rounded-app p-5 bg-surface text-muted">
          Nenhum formulário recebido.
        </div>
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
          audit.map((a, i) => (
            <div
              key={i}
              className="border border-line rounded-[13px] p-3.5 text-sm"
            >
              <small className="block text-muted text-xs mb-1.5">
                {a.date} · {a.actor}
              </small>
              <strong>
                {a.action} · {movie(a.id, content)?.t || a.id}
              </strong>
              <div>{a.fields.join(', ')}</div>
            </div>
          ))
        ) : (
          <div className="border border-line rounded-app p-5 bg-surface text-muted">
            Nenhuma intervenção registrada.
          </div>
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

  const onImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (file) importContent.mutate(file);
  };

  return (
    <div>
      <h2 className="text-2xl mb-4">Snapshot e integrações</h2>
      <div className="p-6 max-sm:p-4.5 border border-line bg-surface rounded-app">
        <p className="m-0 mb-2">
          <strong>
            {allBaseMovieIds().length} filmes · {allCinemas().length} cinemas ·{' '}
            {SESSIONS.length} sessões
          </strong>
        </p>
        <p className="text-muted text-sm">{META.caveat}</p>
        <p className="text-xs text-faint mt-2.5">
          Os títulos de Em breve foram incorporados à mesma coleção. Todas as
          telas, incluindo a Home e o CMS, usam o mesmo resolvedor de conteúdo.
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
  // Rendered inside <ClientOnly>, so `window` is available here
  const [tab, setTab] = useState(
    () => new URLSearchParams(window.location.search).get('tab') ?? 'filmes'
  );
  const [selectedId, setSelectedId] = useState<string>(
    () =>
      new URLSearchParams(window.location.search).get('id') ??
      allBaseMovieIds()[0]
  );
  const content = useAppStore((s) => s.content);

  const movies = useMemo(() => allMovies(content), [content]);

  const selectTab = (t: string) => {
    setTab(t);
    const url = new URL(window.location.href);
    url.searchParams.set('tab', t);
    window.history.pushState({}, '', url);
  };
  const selectMovie = (id: string) => {
    setSelectedId(id);
    const url = new URL(window.location.href);
    url.searchParams.set('tab', 'filmes');
    url.searchParams.set('id', id);
    window.history.pushState({}, '', url);
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
          {TABS.map(([v, l]) => (
            <button
              key={v}
              onClick={() => selectTab(v)}
              className={`border border-line bg-surface2 text-[#cbd5cd] rounded-full px-3.5 py-2 min-h-10 text-[13px] whitespace-nowrap shrink-0 ${
                tab === v
                  ? 'bg-lime! text-[#081004]! border-lime! font-bold!'
                  : ''
              }`}
            >
              {l}
            </button>
          ))}
        </nav>
        {tab === 'filmes' && (
          <div className="grid grid-cols-[270px_1fr] max-md:grid-cols-1 gap-6.5 items-start">
            <aside className="border border-line rounded-2xl bg-surface p-2 max-h-[72vh] max-md:max-h-none overflow-auto sticky top-[104px] max-md:static">
              {movies.map((m) => (
                <button
                  key={m.id}
                  onClick={() => selectMovie(m.id)}
                  className={`block w-full text-left rounded-[10px] p-3 text-[13px] leading-tight ${selectedId === m.id ? 'bg-lime-soft text-lime' : ''}`}
                >
                  {m.t}
                  <small className="block text-[10px] text-faint mt-1">
                    {m.id} · {statusLabel(m)}
                    {Object.hasOwn(content.movies, m.id) ? ' · Override' : ''}
                  </small>
                </button>
              ))}
            </aside>
            <div>
              <CmsMovieEditor key={selectedId} id={selectedId} />
            </div>
          </div>
        )}
        {tab === 'leads' && <LeadsTab />}
        {tab === 'auditoria' && <AuditTab />}
        {tab === 'dados' && <DataTab />}
      </div>
    </div>
  );
}
