'use client';

import { useState } from 'react';
import { useGrozzeListQuery, type GrozzeLookup } from '@/shared/api';
import { Button, Chip, EmptyState, FilmLoader, inputClass } from '@/shared/ui';
import {
  useCreateLookupMutation,
  useDeleteLookupMutation,
  useUpdateLookupMutation,
} from '../api';

/** Each managed list: its label, admin path, public-list key and extra field. */
type GrozzeList = 'avatars' | 'languages' | 'experiences' | 'movieGenres';

interface ListConfig {
  label: string;
  lookup: GrozzeLookup;
  list: GrozzeList;
  hasCodigo: boolean;
}

const LISTS: ListConfig[] = [
  { label: 'Avatares', lookup: 'avatars', list: 'avatars', hasCodigo: false },
  { label: 'Idiomas', lookup: 'languages', list: 'languages', hasCodigo: true },
  {
    label: 'Experiências',
    lookup: 'experiences',
    list: 'experiences',
    hasCodigo: false,
  },
  {
    label: 'Gêneros',
    lookup: 'movie-genres',
    list: 'movieGenres',
    hasCodigo: false,
  },
];

interface LookupRow {
  id: number;
  nome: string;
  codigo?: string;
}

function ItemRow({ config, item }: { config: ListConfig; item: LookupRow }) {
  const [nome, setNome] = useState(item.nome);
  const [codigo, setCodigo] = useState(item.codigo ?? '');
  const update = useUpdateLookupMutation();
  const remove = useDeleteLookupMutation();

  const changed = nome !== item.nome || codigo !== (item.codigo ?? '');

  const save = () =>
    update.mutate({
      lookup: config.lookup,
      id: item.id,
      body: {
        nome: nome.trim(),
        ...(config.hasCodigo && { codigo: codigo.trim() }),
      },
    });

  return (
    <div className="flex items-center gap-2 border-b border-line py-2.5">
      <span className="text-faint text-xs w-8 shrink-0">#{item.id}</span>
      <input
        className={inputClass}
        value={nome}
        onChange={(event) => setNome(event.target.value)}
      />
      {config.hasCodigo && (
        <input
          className={`${inputClass} w-24 shrink-0`}
          value={codigo}
          onChange={(event) => setCodigo(event.target.value)}
        />
      )}
      <Button
        small
        primary
        disabled={!changed || !nome.trim() || update.isPending}
        onClick={save}
      >
        Salvar
      </Button>
      <Button
        small
        disabled={remove.isPending}
        onClick={() => remove.mutate({ lookup: config.lookup, id: item.id })}
      >
        Excluir
      </Button>
    </div>
  );
}

function AddItem({ config }: { config: ListConfig }) {
  const [nome, setNome] = useState('');
  const [codigo, setCodigo] = useState('');
  const create = useCreateLookupMutation();

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

  const valid = !!nome.trim() && (!config.hasCodigo || !!codigo.trim());

  return (
    <div className="flex items-center gap-2 mb-4">
      <input
        className={inputClass}
        placeholder="Novo item"
        value={nome}
        onChange={(event) => setNome(event.target.value)}
      />
      {config.hasCodigo && (
        <input
          className={`${inputClass} w-24 shrink-0`}
          placeholder="Código"
          value={codigo}
          onChange={(event) => setCodigo(event.target.value)}
        />
      )}
      <Button primary disabled={!valid || create.isPending} onClick={add}>
        Adicionar
      </Button>
    </div>
  );
}

export function LookupsAdminTab() {
  const [active, setActive] = useState<ListConfig>(LISTS[0]);
  const { data, isPending, isError } = useGrozzeListQuery(active.list);
  const items = (data ?? []) as LookupRow[];

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

      <div className="border border-line rounded-2xl bg-surface p-5 max-w-[640px]">
        <AddItem config={active} />
        {isPending ? (
          <FilmLoader label="Carregando…" compact />
        ) : isError ? (
          <EmptyState title="Não foi possível carregar a lista." />
        ) : items.length === 0 ? (
          <p className="text-muted text-sm">Nenhum item.</p>
        ) : (
          items.map((item) => (
            <ItemRow key={item.id} config={active} item={item} />
          ))
        )}
      </div>
      <p className="text-xs text-faint mt-3">
        Excluir um item usado por algum usuário é bloqueado pela API (exceto
        gêneros, que saem das preferências automaticamente).
      </p>
    </div>
  );
}
