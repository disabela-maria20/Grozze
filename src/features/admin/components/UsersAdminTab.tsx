'use client';

import { useState } from 'react';
import { type GrozzeRole } from '@/shared/api';
import { dateLabel } from '@/shared/lib/catalog';
import { useAppStore } from '@/shared/store';
import { Button, Chip, EmptyState, FilmLoader, inputClass } from '@/shared/ui';
import {
  useAdminUserQuery,
  useAdminUsersQuery,
  useDeleteUserMutation,
  useRevokeUserSessionsMutation,
  useSetUserRoleMutation,
} from '../api';

const PAGE_SIZE = 20;

const ROLE_FILTERS: [string, GrozzeRole | undefined][] = [
  ['Todos', undefined],
  ['Usuários', 'user'],
  ['Admins', 'admin'],
];

function UserDetail({ id, isSelf }: { id: string; isSelf: boolean }) {
  const { data: user, isPending, isError } = useAdminUserQuery(id);
  const setRole = useSetUserRoleMutation();
  const revoke = useRevokeUserSessionsMutation();
  const remove = useDeleteUserMutation();

  if (isPending) return <FilmLoader label="Carregando usuário…" />;
  if (isError || !user)
    return <EmptyState title="Não foi possível carregar o usuário." />;

  const nextRole: GrozzeRole = user.role === 'admin' ? 'user' : 'admin';

  return (
    <div className="border border-line rounded-2xl bg-surface p-5">
      <h2 className="text-[24px] leading-tight m-0 mb-1">{user.name}</h2>
      <p className="text-muted text-sm m-0">{user.email}</p>
      <dl className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm my-4">
        <div>
          <dt className="text-faint text-xs">Papel</dt>
          <dd className="m-0">
            {user.role === 'admin' ? 'Administrador' : 'Usuário'}
          </dd>
        </div>
        <div>
          <dt className="text-faint text-xs">Desde</dt>
          <dd className="m-0">
            {dateLabel(user.createdAt.slice(0, 10), true)}
          </dd>
        </div>
        <div>
          <dt className="text-faint text-xs">Dispositivos conectados</dt>
          <dd className="m-0">{user.activeSessions}</dd>
        </div>
        <div>
          <dt className="text-faint text-xs">Newsletter</dt>
          <dd className="m-0">{user.receiveNews ? 'Sim' : 'Não'}</dd>
        </div>
      </dl>

      {isSelf ? (
        <p className="text-xs text-faint">
          Esta é a sua conta: papel e exclusão são geridos por outro admin.
        </p>
      ) : (
        <div className="flex items-center gap-2.5 flex-wrap">
          <Button
            primary
            disabled={setRole.isPending}
            onClick={() => setRole.mutate({ id: user.id, role: nextRole })}
          >
            {user.role === 'admin' ? 'Rebaixar a usuário' : 'Promover a admin'}
          </Button>
          <Button
            disabled={revoke.isPending || user.activeSessions === 0}
            onClick={() => revoke.mutate(user.id)}
          >
            Desconectar dispositivos
          </Button>
          <Button
            className="ml-auto border-red-400/40 text-red-300"
            disabled={remove.isPending}
            onClick={() => remove.mutate(user.id)}
          >
            Excluir conta
          </Button>
        </div>
      )}
    </div>
  );
}

export function UsersAdminTab() {
  const myEmail = useAppStore((s) => s.profile()?.email);
  const [selected, setSelected] = useState<string | null>(null);
  const [role, setRole] = useState<GrozzeRole | undefined>();
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  const { data, isPending, isPlaceholderData } = useAdminUsersQuery({
    page,
    pageSize: PAGE_SIZE,
    role,
    search: search.trim() || undefined,
  });
  const items = data?.items ?? [];
  const lastPage = Math.max(1, Math.ceil((data?.total ?? 0) / PAGE_SIZE));

  const resetToFirstPage = () => setPage(1);

  return (
    <div className="grid grid-cols-[360px_1fr] max-md:grid-cols-1 gap-6.5 items-start">
      <aside className="max-md:order-2">
        <input
          className={inputClass}
          placeholder="Buscar por nome ou e-mail…"
          value={search}
          onChange={(event) => {
            setSearch(event.target.value);
            resetToFirstPage();
          }}
        />
        <div className="flex gap-1.5 flex-wrap my-3">
          {ROLE_FILTERS.map(([label, value]) => (
            <Chip
              key={label}
              active={role === value}
              onClick={() => {
                setRole(value);
                resetToFirstPage();
              }}
            >
              {label}
            </Chip>
          ))}
        </div>
        <div className="border border-line rounded-2xl bg-surface p-2 max-h-[56vh] max-md:max-h-none overflow-auto">
          {isPending ? (
            <FilmLoader label="Carregando…" compact className="p-3" />
          ) : items.length === 0 ? (
            <p className="text-muted text-sm p-3">Nenhum usuário.</p>
          ) : (
            items.map((user) => (
              <button
                key={user.id}
                onClick={() => setSelected(user.id)}
                className={`block w-full text-left rounded-[10px] p-3 text-[13px] leading-tight ${selected === user.id ? 'bg-lime-soft text-lime' : ''}`}
              >
                {user.name}
                {user.role === 'admin' && (
                  <span className="text-lime text-[10px] ml-1.5">admin</span>
                )}
                <small className="block text-[10px] text-faint mt-1 truncate">
                  {user.email}
                </small>
              </button>
            ))
          )}
        </div>
        {lastPage > 1 && (
          <div className="flex items-center justify-between gap-2 mt-3">
            <Button
              small
              disabled={page <= 1 || isPlaceholderData}
              onClick={() => setPage((current) => Math.max(1, current - 1))}
            >
              Anterior
            </Button>
            <span className="text-xs text-muted">
              {page} / {lastPage}
            </span>
            <Button
              small
              disabled={page >= lastPage || isPlaceholderData}
              onClick={() =>
                setPage((current) => Math.min(lastPage, current + 1))
              }
            >
              Próxima
            </Button>
          </div>
        )}
      </aside>

      <div className="max-md:order-1">
        {selected ? (
          <UserDetail
            key={selected}
            id={selected}
            isSelf={
              items.find((user) => user.id === selected)?.email === myEmail
            }
          />
        ) : (
          <EmptyState title="Selecione um usuário para ver os detalhes." />
        )}
      </div>
    </div>
  );
}
