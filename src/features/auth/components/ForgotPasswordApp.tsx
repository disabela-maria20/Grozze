'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForgotPasswordMutation } from '../api';
import { forgotPasswordSchema, type ForgotPasswordValues } from '../schema';
import { Button, Field, LinkButton, inputClass } from '@/shared/ui';
import { AuthCardPage } from './AuthCardPage';

export function ForgotPasswordApp() {
  const forgotPassword = useForgotPasswordMutation();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: '' },
  });

  if (forgotPassword.isSuccess) {
    return (
      <AuthCardPage>
        <h1 className="text-[34px] leading-[1.08] tracking-tight m-0 mb-3">
          Confira seu e-mail
        </h1>
        <p className="text-sm text-muted leading-relaxed mb-5">
          {forgotPassword.data.message} O link vale por pouco tempo; se não
          chegar, olhe a caixa de spam ou peça de novo.
        </p>
        <LinkButton href="/entrar">Voltar para entrar</LinkButton>
      </AuthCardPage>
    );
  }

  return (
    <AuthCardPage>
      <h1 className="text-[34px] leading-[1.08] tracking-tight m-0 mb-3">
        Esqueci minha senha
      </h1>
      <p className="text-sm text-muted leading-relaxed mb-5">
        Informe o e-mail da sua conta e enviaremos um link para criar uma nova
        senha.
      </p>
      <form
        noValidate
        onSubmit={handleSubmit(({ email }) => forgotPassword.mutate(email))}
      >
        <Field label="E-mail" error={errors.email?.message}>
          <input
            className={inputClass}
            type="email"
            placeholder="nome@exemplo.com"
            autoComplete="email"
            aria-invalid={!!errors.email}
            {...register('email')}
          />
        </Field>
        <Button primary full type="submit" disabled={forgotPassword.isPending}>
          {forgotPassword.isPending ? 'Enviando…' : 'Enviar link'}
        </Button>
      </form>
    </AuthCardPage>
  );
}
