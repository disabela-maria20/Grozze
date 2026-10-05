'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import type { GrozzeSession } from '@/shared/api';
import { newPasswordField } from '@/shared/lib/validation';
import { Button, Field, FilmLoader, TextLink, inputClass } from '@/shared/ui';
import {
  useChangePasswordMutation,
  useRevokeSessionMutation,
  useSessionsQuery,
} from '../api';

const CARD_CLASS = 'p-6 max-sm:p-4.5 border border-line bg-surface rounded-app';
const SECTION_TITLE_CLASS = 'text-[23px] tracking-tight m-0 mb-1.5';

const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Informe sua senha atual.'),
    newPassword: newPasswordField,
    confirmPassword: z.string().min(1, 'Confirme a nova senha.'),
  })
  .refine((values) => values.newPassword === values.confirmPassword, {
    path: ['confirmPassword'],
    message: 'As senhas não coincidem.',
  });

type ChangePasswordValues = z.input<typeof changePasswordSchema>;

const EMPTY_PASSWORDS: ChangePasswordValues = {
  currentPassword: '',
  newPassword: '',
  confirmPassword: '',
};

/** Browser + system from the user agent: "Chrome no Windows". */
function deviceLabel(userAgent: string | null): string {
  const agent = userAgent ?? '';
  const browser =
    [
      [/Edg\//, 'Edge'],
      [/OPR\//, 'Opera'],
      [/Firefox\//, 'Firefox'],
      [/Chrome\//, 'Chrome'],
      [/Safari\//, 'Safari'],
    ].find(([pattern]) => (pattern as RegExp).test(agent))?.[1] ?? 'Navegador';
  const system =
    [
      [/Android/, 'Android'],
      [/iPhone|iPad/, 'iOS'],
      [/Windows/, 'Windows'],
      [/Mac OS X/, 'macOS'],
      [/Linux/, 'Linux'],
    ].find(([pattern]) => (pattern as RegExp).test(agent))?.[1] ?? '';
  return system ? `${browser} no ${system}` : String(browser);
}

const formatDateTime = (iso: string) =>
  new Date(iso).toLocaleString('pt-BR', {
    dateStyle: 'short',
    timeStyle: 'short',
  });

function ChangePasswordForm() {
  const changePassword = useChangePasswordMutation();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ChangePasswordValues>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: EMPTY_PASSWORDS,
  });

  const submit = handleSubmit(({ currentPassword, newPassword }) =>
    changePassword.mutate(
      { currentPassword, newPassword },
      { onSuccess: () => reset(EMPTY_PASSWORDS) }
    )
  );

  return (
    <form className={CARD_CLASS} noValidate onSubmit={submit}>
      <h2 className={SECTION_TITLE_CLASS}>Alterar senha</h2>
      <p className="text-muted text-sm mb-4">
        Os outros dispositivos saem da conta; este continua conectado.
      </p>
      <Field label="Senha atual" error={errors.currentPassword?.message}>
        <input
          className={inputClass}
          type="password"
          autoComplete="current-password"
          aria-invalid={!!errors.currentPassword}
          {...register('currentPassword')}
        />
      </Field>
      <Field label="Nova senha" error={errors.newPassword?.message}>
        <input
          className={inputClass}
          type="password"
          autoComplete="new-password"
          aria-invalid={!!errors.newPassword}
          {...register('newPassword')}
        />
      </Field>
      <Field label="Confirmar nova senha" error={errors.confirmPassword?.message}>
        <input
          className={inputClass}
          type="password"
          autoComplete="new-password"
          aria-invalid={!!errors.confirmPassword}
          {...register('confirmPassword')}
        />
      </Field>
      <Button primary type="submit" disabled={changePassword.isPending}>
        {changePassword.isPending ? 'Salvando…' : 'Alterar senha'}
      </Button>
    </form>
  );
}

function SessionItem({
  session,
  onRevoke,
  revoking,
}: {
  session: GrozzeSession;
  onRevoke: () => void;
  revoking: boolean;
}) {
  return (
    <li className="flex items-center justify-between gap-4 py-3 border-t border-line first:border-t-0">
      <div className="min-w-0">
        <strong className="block text-sm">
          {deviceLabel(session.userAgent)}
          {session.current && (
            <span className="ml-2 text-[11px] font-bold text-lime">
              Este dispositivo
            </span>
          )}
        </strong>
        <small className="block text-muted text-xs mt-0.5">
          Último acesso em {formatDateTime(session.lastUsedAt)}
          {session.ip && ` · IP ${session.ip}`}
        </small>
      </div>
      {!session.current && (
        <TextLink type="button" onClick={onRevoke} disabled={revoking}>
          Desconectar
        </TextLink>
      )}
    </li>
  );
}

function SessionsList() {
  const sessions = useSessionsQuery();
  const revokeSession = useRevokeSessionMutation();
  const hasOtherSessions = sessions.data?.some((session) => !session.current);

  return (
    <section className={CARD_CLASS} aria-labelledby="sessions-title">
      <h2 id="sessions-title" className={SECTION_TITLE_CLASS}>
        Dispositivos conectados
      </h2>
      <p className="text-muted text-sm mb-3">
        Não reconhece algum? Desconecte e troque sua senha.
      </p>
      {sessions.isPending && <FilmLoader label="Carregando dispositivos" compact />}
      {sessions.isError && (
        <p className="text-sm text-muted">{sessions.error.message}</p>
      )}
      {sessions.data && (
        <ul className="list-none m-0 p-0">
          {sessions.data.map((session) => (
            <SessionItem
              key={session.id}
              session={session}
              revoking={revokeSession.isPending}
              onRevoke={() => revokeSession.mutate(session.id)}
            />
          ))}
        </ul>
      )}
      {hasOtherSessions && (
        <Button
          type="button"
          className="mt-4"
          disabled={revokeSession.isPending}
          onClick={() => revokeSession.mutate(null)}
        >
          Sair dos outros dispositivos
        </Button>
      )}
    </section>
  );
}

/** Password change and logged-in devices, at the end of the "Conta" tab. */
export function SecuritySection() {
  return (
    <div className="grid gap-4.5 mt-4.5">
      <ChangePasswordForm />
      <SessionsList />
    </div>
  );
}
