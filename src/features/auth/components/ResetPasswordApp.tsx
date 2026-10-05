'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useResetPasswordMutation } from '../api';
import { newPasswordSchema, type NewPasswordValues } from '../schema';
import { Button, Field, LinkButton, inputClass } from '@/shared/ui';
import { AuthCardPage } from './AuthCardPage';

/** `?token=` of the link sent by e-mail. Rendered inside <ClientOnly>. */
const readToken = () =>
  new URLSearchParams(window.location.search).get('token') ?? '';

export function ResetPasswordApp() {
  const [token] = useState(readToken);
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

  if (resetPassword.isSuccess) {
    return (
      <AuthCardPage>
        <h1 className="text-[34px] leading-[1.08] tracking-tight m-0 mb-3">
          Senha alterada
        </h1>
        <p className="text-sm text-muted leading-relaxed mb-5">
          Por segurança, saímos da sua conta em todos os dispositivos. Entre de
          novo com a senha nova.
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
        Use pelo menos 8 caracteres.
      </p>
      <form
        noValidate
        onSubmit={handleSubmit(({ password }) =>
          resetPassword.mutate({ token, password })
        )}
      >
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
