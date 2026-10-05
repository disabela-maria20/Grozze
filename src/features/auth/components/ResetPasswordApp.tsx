'use client';

import { useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useResetPasswordMutation, useResetTokenQuery } from '../api';
import { newPasswordSchema, type NewPasswordValues } from '../schema';
import { Button, Field, FilmLoader, LinkButton, inputClass } from '@/shared/ui';
import { AuthCardPage } from './AuthCardPage';

export function ResetPasswordApp() {
  /** `?token=` of the link sent by e-mail. */
  const token = useSearchParams().get('token') ?? '';
  // Checked on load: says which account the link is for, or that it expired
  const tokenCheck = useResetTokenQuery(token);
  const resetPassword = useResetPasswordMutation();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<NewPasswordValues>({
    resolver: zodResolver(newPasswordSchema),
    defaultValues: { password: '', confirmPassword: '' },
  });

  if (!token) {
    return (
      <AuthCardPage>
        <h1 className="text-[34px] leading-[1.08] tracking-tight m-0 mb-3">
          Link incompleto
        </h1>
        <p className="text-sm text-muted leading-relaxed mb-5">
          Abra o link exatamente como veio no e-mail, ou peça um novo.
        </p>
        <LinkButton href="/esqueci-senha">Pedir novo link</LinkButton>
      </AuthCardPage>
    );
  }

  if (tokenCheck.isPending) {
    return (
      <AuthCardPage>
        <FilmLoader label="Conferindo o link" compact />
      </AuthCardPage>
    );
  }

  if (tokenCheck.isError) {
    return (
      <AuthCardPage>
        <h1 className="text-[34px] leading-[1.08] tracking-tight m-0 mb-3">
          Link expirado
        </h1>
        <p className="text-sm text-muted leading-relaxed mb-5">
          {tokenCheck.error.message}
        </p>
        <LinkButton primary href="/esqueci-senha">
          Pedir novo link
        </LinkButton>
      </AuthCardPage>
    );
  }

  const { email } = tokenCheck.data;

  if (resetPassword.isSuccess) {
    return (
      <AuthCardPage>
        <h1 className="text-[34px] leading-[1.08] tracking-tight m-0 mb-3">
          Senha alterada
        </h1>
        <p className="text-sm text-muted leading-relaxed mb-5">
          A senha de <strong className="text-app-text">{email}</strong> foi
          trocada. Por segurança, saímos dessa conta em todos os dispositivos:
          entre de novo com a senha nova.
        </p>
        <LinkButton primary href="/entrar">
          Entrar
        </LinkButton>
      </AuthCardPage>
    );
  }

  return (
    <AuthCardPage>
      <h1 className="text-[34px] leading-[1.08] tracking-tight m-0 mb-3">
        Criar nova senha
      </h1>
      <p className="text-sm text-muted leading-relaxed mb-5">
        Para a conta <strong className="text-app-text">{email}</strong>. Use
        pelo menos 8 caracteres.
      </p>
      <form
        noValidate
        onSubmit={handleSubmit(({ password }) =>
          resetPassword.mutate({ token, password })
        )}
      >
        <input
          type="email"
          name="username"
          autoComplete="username"
          value={email}
          readOnly
          hidden
        />
        <Field label="Nova senha" error={errors.password?.message}>
          <input
            className={inputClass}
            type="password"
            autoComplete="new-password"
            aria-invalid={!!errors.password}
            {...register('password')}
          />
        </Field>
        <Field
          label="Confirmar nova senha"
          error={errors.confirmPassword?.message}
        >
          <input
            className={inputClass}
            type="password"
            autoComplete="new-password"
            aria-invalid={!!errors.confirmPassword}
            {...register('confirmPassword')}
          />
        </Field>
        <Button primary full type="submit" disabled={resetPassword.isPending}>
          {resetPassword.isPending ? 'Salvando…' : 'Salvar nova senha'}
        </Button>
      </form>
    </AuthCardPage>
  );
}
