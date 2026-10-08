'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  type GrozzeNews,
  type GrozzeNewsInput,
  type GrozzeNewsStatus,
} from '@/shared/api';
import { dateLabel } from '@/shared/lib/catalog';
import {
  Button,
  Chip,
  EmptyState,
  Field,
  FilmLoader,
  inputClass,
} from '@/shared/ui';
import { newsSchema, type NewsFormValues } from '../schema';
import { RichEditor } from './RichEditor';
import { MoviePicker } from './MoviePicker';
import {
  useAdminNewsListQuery,
  useAdminNewsQuery,
  useCreateNewsMutation,
  useDeleteNewsMutation,
  useUpdateNewsMutation,
} from '../api';

const EMPTY_BOX = 'border border-line rounded-app p-5 bg-surface text-muted';

const STATUS_FILTERS: [string, GrozzeNewsStatus | undefined][] = [
  ['Todas', undefined],
  ['Rascunhos', 'draft'],
  ['Publicadas', 'published'],
];

/** ISO (UTC) → value for `<input type="datetime-local">` in local time. */
function isoToLocalInput(iso: string | null): string {
  if (!iso) return '';
  const date = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function emptyValues(): NewsFormValues {
  return {
    title: '',
    slug: '',
    summary: '',
    content: '',
    coverImageUrl: '',
    status: 'draft',
    publishedAt: '',
    movieIds: [],
  };
}

function articleToValues(article: GrozzeNews): NewsFormValues {
  return {
    title: article.title,
    slug: article.slug,
    summary: article.summary ?? '',
    content: article.content,
    coverImageUrl: article.coverImageUrl ?? '',
    status: article.status,
    publishedAt: isoToLocalInput(article.publishedAt),
    movieIds: article.relatedMovies,
  };
}

/** Form values → API payload. Empty optional fields are cleared (`null`). */
function toPayload(values: NewsFormValues): GrozzeNewsInput {
  return {
    title: values.title.trim(),
    slug: values.slug.trim() || undefined,
    summary: values.summary.trim() || null,
    content: values.content.trim(),
    coverImageUrl: values.coverImageUrl.trim() || null,
    status: values.status,
    publishedAt: values.publishedAt
      ? new Date(values.publishedAt).toISOString()
      : undefined,
    movieIds: values.movieIds,
  };
}

function NewsEditor({
  article,
  onDone,
}: {
  article: GrozzeNews | null;
  onDone: () => void;
}) {
  const create = useCreateNewsMutation();
  const update = useUpdateNewsMutation();
  const remove = useDeleteNewsMutation();
  const saving = create.isPending || update.isPending;

  const {
    register,
    handleSubmit,
    setValue,
    control,
    formState: { errors },
  } = useForm<NewsFormValues>({
    resolver: zodResolver(newsSchema),
    defaultValues: article ? articleToValues(article) : emptyValues(),
  });
  // Lista atual de filmes relacionados, para o picker refletir seleção/remoção
  const movieIds = useWatch({ control, name: 'movieIds' });

  const submit = handleSubmit((values) => {
    const body = toPayload(values);
    if (article) update.mutate({ id: article.id, body });
    else create.mutate(body, { onSuccess: onDone });
  });

  const onDelete = () => {
    if (article) remove.mutate(article.id, { onSuccess: onDone });
  };

  return (
    <form noValidate onSubmit={submit}>
      <div className="flex items-center justify-between gap-3 mb-3">
        <h2 className="text-[24px] leading-tight m-0">
          {article ? 'Editar notícia' : 'Nova notícia'}
        </h2>
        {article && article.status === 'published' && (
          <Link
            className="text-sm text-lime hover:underline"
            href={`/noticia/${article.slug}`}
            target="_blank"
          >
            Ver no site
          </Link>
        )}
      </div>

      <Field label="Título" error={errors.title?.message}>
        <input className={inputClass} {...register('title')} />
      </Field>
      <Field
        label="Endereço (slug) — vazio gera a partir do título"
        error={errors.slug?.message}
      >
        <input
          className={inputClass}
          placeholder="estreias-de-outubro"
          {...register('slug')}
        />
      </Field>
      <Field label="Resumo" error={errors.summary?.message}>
        <input className={inputClass} {...register('summary')} />
      </Field>
      <Field
        label="Imagem de capa — URL http(s)"
        error={errors.coverImageUrl?.message}
      >
        <input
          className={inputClass}
          type="url"
          {...register('coverImageUrl')}
        />
      </Field>
      <div className="grid grid-cols-2 max-sm:grid-cols-1 gap-4.5">
        <Field label="Status" error={errors.status?.message}>
          <select className={inputClass} {...register('status')}>
            <option value="draft">Rascunho</option>
            <option value="published">Publicada</option>
          </select>
        </Field>
        <Field
          label="Publicar em (vazio = agora ao publicar)"
          error={errors.publishedAt?.message}
        >
          <input
            className={inputClass}
            type="datetime-local"
            {...register('publishedAt')}
          />
        </Field>
      </div>
      <Field label="Texto" error={errors.content?.message}>
        {/* Campo real registrado no RHF; o editor atualiza via setValue */}
        <input type="hidden" {...register('content')} />
        <RichEditor
          initialHTML={article?.content ?? ''}
          onChange={(html) =>
            setValue('content', html, {
              shouldValidate: true,
              shouldDirty: true,
            })
          }
        />
      </Field>
      <Field label="Filmes relacionados" error={errors.movieIds?.message}>
        <MoviePicker
          value={movieIds ?? []}
          onChange={(ids) =>
            setValue('movieIds', ids, {
              shouldValidate: true,
              shouldDirty: true,
            })
          }
        />
      </Field>

      <div className="flex items-center gap-2.5 flex-wrap sticky bottom-3 p-3 border border-line rounded-2xl bg-[rgba(10,16,12,.96)]">
        <Button primary type="submit" disabled={saving}>
          {saving ? 'Salvando…' : article ? 'Salvar' : 'Criar'}
        </Button>
        <Button type="button" onClick={onDone}>
          Cancelar
        </Button>
        {article && (
          <Button
            type="button"
            className="ml-auto border-red-400/40 text-red-300"
            disabled={remove.isPending}
            onClick={onDelete}
          >
            Excluir
          </Button>
        )}
      </div>
    </form>
  );
}

/** Loads the selected article, then shows the editor (remounted per id). */
function EditorLoader({ id, onDone }: { id: string; onDone: () => void }) {
  const { data, isPending, isError } = useAdminNewsQuery(id);
  if (isPending) return <FilmLoader label="Carregando notícia…" />;
  if (isError || !data)
    return (
      <div className={EMPTY_BOX}>Não foi possível carregar a notícia.</div>
    );
  return <NewsEditor key={data.id} article={data} onDone={onDone} />;
}

export function NewsAdminTab() {
  const [selected, setSelected] = useState<string | 'new' | null>(null);
  const [status, setStatus] = useState<GrozzeNewsStatus | undefined>();
  const [search, setSearch] = useState('');
  const { data, isPending } = useAdminNewsListQuery({
    page: 1,
    pageSize: 50,
    status,
    search: search.trim() || undefined,
  });
  const items = data?.items ?? [];

  return (
    <div className="grid grid-cols-[320px_1fr] max-md:grid-cols-1 gap-6.5 items-start">
      <aside className="max-md:order-2">
        <Button full primary onClick={() => setSelected('new')}>
          + Nova notícia
        </Button>
        <input
          className={`${inputClass} mt-3`}
          placeholder="Buscar por título…"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />
        <div className="flex gap-1.5 flex-wrap my-3">
          {STATUS_FILTERS.map(([label, value]) => (
            <Chip
              key={label}
              active={status === value}
              onClick={() => setStatus(value)}
            >
              {label}
            </Chip>
          ))}
        </div>
        <div className="border border-line rounded-2xl bg-surface p-2 max-h-[64vh] max-md:max-h-none overflow-auto">
          {isPending ? (
            <FilmLoader label="Carregando…" compact className="p-3" />
          ) : items.length === 0 ? (
            <p className="text-muted text-sm p-3">Nenhuma notícia.</p>
          ) : (
            items.map((item) => (
              <button
                key={item.id}
                onClick={() => setSelected(item.id)}
                className={`block w-full text-left rounded-[10px] p-3 text-[13px] leading-tight ${selected === item.id ? 'bg-lime-soft text-lime' : ''}`}
              >
                {item.title}
                <small className="block text-[10px] text-faint mt-1">
                  {item.status === 'published' ? 'Publicada' : 'Rascunho'}
                  {item.publishedAt
                    ? ` · ${dateLabel(item.publishedAt.slice(0, 10), true)}`
                    : ''}
                </small>
              </button>
            ))
          )}
        </div>
      </aside>

      <div className="max-md:order-1">
        {selected === 'new' ? (
          <NewsEditor article={null} onDone={() => setSelected(null)} />
        ) : selected ? (
          <EditorLoader id={selected} onDone={() => setSelected(null)} />
        ) : (
          <EmptyState title="Selecione uma notícia ou crie uma nova." />
        )}
      </div>
    </div>
  );
}
