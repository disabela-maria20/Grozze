'use client';

import { useState } from 'react';
import { GROZZE_API_KEY, useGrozzeListQuery } from '@/shared/api';
import {
  Button,
  Chip,
  EmptyState,
  FieldError,
  FilmLoader,
  inputClass,
} from '@/shared/ui';
import {
  useCreateLookupMutation,
  useDeleteLookupMutation,
  useUpdateLookupMutation,
  type GrozzeLookup,
} from '../api';

/** Each managed list: its label, admin path, public-list key and extra field. */
type GrozzeList = 'avatars' | 'languages' | 'experiences' | 'movieGenres';

interface ListConfig {
  label: string;
  lookup: GrozzeLookup;
  list: GrozzeList;
  hasCodigo: boolean;
  /** Same limit as the API schema. */
  maxNome: number;
}

const LISTS: ListConfig[] = [
  {
    label: 'Avatares',
    lookup: 'avatars',
    list: 'avatars',
    hasCodigo: false,
    maxNome: 50,
  },
  {
    label: 'Idiomas',
    lookup: 'languages',
    list: 'languages',
    hasCodigo: true,
    maxNome: 50,
  },
  {
    label: 'Experiências',
    lookup: 'experiences',
    list: 'experiences',
    hasCodigo: false,
    maxNome: 50,
  },
  {
    label: 'Gêneros',
    lookup: 'movie-genres',
    list: 'movieGenres',
    hasCodigo: false,
    maxNome: 100,
  },
];

/** Language code rule from the API: up to 10 letters, digits or hyphens. */
const CODIGO_PATTERN = /^[A-Z0-9-]{1,10}$/;

interface LookupRow {
  id: number;
  nome: string;
  codigo?: string;
}

/** Client-side check mirroring the API, so most mistakes never leave the form. */
function validate(config: ListConfig, nome: string, codigo: string) {
  if (!nome.trim()) return 'Informe o nome.';
  if (config.hasCodigo && !CODIGO_PATTERN.test(codigo.trim())) {
    return codigo.trim()
      ? 'Código: use letras, números e hífens.'
      : 'Informe o código.';
  }
  return undefined;
}

const disabledClass = 'disabled:opacity-45 disabled:cursor-not-allowed';

/** Name (and code) inputs shared by the add form and each row. */
function LookupFields({
  config,
  nome,
  codigo,
  onNome,
  onCodigo,
  placeholder,
}: {
  config: ListConfig;
  nome: string;
  codigo: string;
  onNome: (value: string) => void;
  onCodigo: (value: string) => void;
  placeholder?: boolean;
}) {
  return (
    <>
      <input
        className={`${inputClass} flex-1 min-w-0 basis-24`}
        aria-label="Nome"
        placeholder={placeholder ? 'Novo item' : undefined}
        maxLength={config.maxNome}
        value={nome}
        onChange={(event) => onNome(event.target.value)}
      />
      {config.hasCodigo && (
        <input
          className={`${inputClass} w-20! sm:w-28! shrink-0 uppercase placeholder:normal-case`}
          aria-label="Código"
          placeholder="Código"
          maxLength={10}
          value={codigo}
          onChange={(event) => onCodigo(event.target.value.toUpperCase())}
        />
      )}
    </>
  );
}

function ItemRow({ config, item }: { config: ListConfig; item: LookupRow }) {
  const [nome, setNome] = useState(item.nome);
  const [codigo, setCodigo] = useState(item.codigo ?? '');
  const update = useUpdateLookupMutation();
  const remove = useDeleteLookupMutation();

  const changed =
    nome.trim() !== item.nome || codigo.trim() !== (item.codigo ?? '');
  const invalid = validate(config, nome, codigo);
  const error = (changed && invalid) || (update.error ?? remove.error)?.message;

  const save = () =>
    update.mutate({
      lookup: config.lookup,
      id: item.id,
      body: {
        nome: nome.trim(),
        ...(config.hasCodigo && { codigo: codigo.trim() }),
      },
    });

  const confirmRemove = () => {
    if (window.confirm(`Excluir "${item.nome}"?`)) {
      remove.mutate({ lookup: config.lookup, id: item.id });
    }
  };

  return (
    <div className="border-b border-line py-2.5 last:border-b-0">
      <div className="flex flex-wrap sm:flex-nowrap items-center gap-2">
        <span className="text-faint text-xs w-8 shrink-0">#{item.id}</span>
        <LookupFields
          config={config}
          nome={nome}
          codigo={codigo}
          onNome={setNome}
          onCodigo={setCodigo}
        />
        <div className="flex gap-2 shrink-0 max-sm:ml-10">
          <Button
            small
            primary
            className={disabledClass}
            disabled={!changed || !!invalid || update.isPending}
            onClick={save}
          >
            {update.isPending ? 'Salvando…' : 'Salvar'}
          </Button>
          <Button
            small
            className={disabledClass}
            disabled={remove.isPending}
            onClick={confirmRemove}
          >
            Excluir
          </Button>
        </div>
      </div>
      {error && (
        <div className="mt-1.5 ml-10">
          <FieldError message={error} />
        </div>
      )}
    </div>
  );
}

function AddItem({ config }: { config: ListConfig }) {
  const [nome, setNome] = useState('');
  const [codigo, setCodigo] = useState('');
  const create = useCreateLookupMutation();

  const typed = !!nome.trim() || !!codigo.trim();
  const invalid = validate(config, nome, codigo);
  const error = (typed && invalid) || create.error?.message;

  const add = () =>
    create.mutate(
      {
        lookup: config.lookup,
        body: {
          nome: nome.trim(),
          ...(config.hasCodigo && { codigo: codigo.trim() }),
        },
      },
      {
        onSuccess: () => {
          setNome('');
          setCodigo('');
        },
      }
    );

  return (
    <form
      noValidate
      className="mb-4"
      onSubmit={(event) => {
        event.preventDefault();
        if (!invalid) add();
      }}
    >
      <div className="flex flex-wrap sm:flex-nowrap items-center gap-2">
        <LookupFields
          config={config}
          nome={nome}
          codigo={codigo}
          onNome={(value) => {
            setNome(value);
            create.reset();
          }}
          onCodigo={(value) => {
            setCodigo(value);
            create.reset();
          }}
          placeholder
        />
        <Button
          primary
          type="submit"
          className={`${disabledClass} shrink-0`}
          disabled={!!invalid || create.isPending}
        >
          {create.isPending ? 'Adicionando…' : 'Adicionar'}
        </Button>
      </div>
      {error && (
        <div className="mt-1.5">
          <FieldError message={error} />
        </div>
      )}
    </form>
  );
}

export function LookupsAdminTab() {
  const [active, setActive] = useState<ListConfig>(LISTS[0]);
  const { data, isLoading, isError, error, refetch } = useGrozzeListQuery(
    active.list
  );
  const items = (data ?? []) as LookupRow[];

  const body = !GROZZE_API_KEY ? (
    <EmptyState title="API da Grozze não configurada.">
      Defina NEXT_PUBLIC_GROZZE_API_KEY no .env do front para carregar as
      listas.
    </EmptyState>
  ) : isLoading ? (
    <FilmLoader label="Carregando…" compact />
  ) : isError ? (
    <EmptyState title="Não foi possível carregar a lista.">
      <p className="mb-3">{error instanceof Error && error.message}</p>
      <Button small onClick={() => refetch()}>
        Tentar de novo
      </Button>
    </EmptyState>
  ) : items.length === 0 ? (
    <p className="text-muted text-sm">Nenhum item.</p>
  ) : (
    items.map((item) => (
      // The list in the key resets the row's inputs when switching lists
      // (ids repeat across lists); the values reset them after a save.
      <ItemRow
        key={`${active.lookup}:${item.id}:${item.nome}:${item.codigo ?? ''}`}
        config={active}
        item={item}
      />
    ))
  );

  return (
    <div>
      <div className="flex gap-1.5 flex-wrap mb-5">
        {LISTS.map((config) => (
          <Chip
            key={config.lookup}
            active={active.lookup === config.lookup}
            onClick={() => setActive(config)}
          >
            {config.label}
          </Chip>
        ))}
      </div>

      <div className="border border-line rounded-2xl bg-surface p-5 max-sm:p-4 max-w-[720px]">
        {GROZZE_API_KEY && <AddItem key={active.lookup} config={active} />}
        {body}
      </div>
      <p className="text-xs text-faint mt-3 max-w-[720px]">
        Excluir um item usado por algum usuário é bloqueado pela API (exceto
        gêneros, que saem das preferências automaticamente).
      </p>
    </div>
  );
}
