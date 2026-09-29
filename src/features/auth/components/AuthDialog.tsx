'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useLoginMutation } from '../api/useLoginMutation';
import { loginSchema, type LoginValues } from '../schema/loginSchema';
import { signupSchema, type SignupValues } from '../schema/signupSchema';
import { Button } from '@/shared/ui/Button';
import { Field } from '@/shared/ui/Field';
import { GenrePicker } from '@/shared/ui/GenrePicker';
import { TextLink } from '@/shared/ui/TextLink';
import { inputClass } from '@/shared/ui/inputClass';

function LoginForm() {
  const login = useLoginMutation();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  return (
    <form noValidate onSubmit={handleSubmit((values) => login.mutate(values))}>
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
      <Field label="Senha" error={errors.password?.message}>
        <input
          className={inputClass}
          type="password"
          autoComplete="current-password"
          aria-invalid={!!errors.password}
          {...register('password')}
        />
      </Field>
      <Button primary full type="submit" disabled={login.isPending}>
        {login.isPending ? 'Entrando…' : 'Entrar'}
      </Button>
    </form>
  );
}

function SignupForm() {
  const login = useLoginMutation();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignupValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
      favoriteGenres: [],
      marketingConsent: false,
    },
  });

  return (
    <form
      noValidate
      onSubmit={handleSubmit(
        ({ name, email, password, favoriteGenres, marketingConsent }) =>
          login.mutate({
            name,
            email,
            password,
            favoriteGenres,
            marketingConsent,
            signup: true,
          })
      )}
    >
      <Field label="Nome" error={errors.name?.message}>
        <input
          className={inputClass}
          autoComplete="name"
          aria-invalid={!!errors.name}
          {...register('name')}
        />
      </Field>
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
      <Field label="Senha" error={errors.password?.message}>
        <input
          className={inputClass}
          type="password"
          autoComplete="new-password"
          aria-invalid={!!errors.password}
          {...register('password')}
        />
      </Field>
      <Field label="Confirmar senha" error={errors.confirmPassword?.message}>
        <input
          className={inputClass}
          type="password"
          autoComplete="new-password"
          aria-invalid={!!errors.confirmPassword}
          {...register('confirmPassword')}
        />
      </Field>
      <GenrePicker
        label="Gêneros favoritos (opcional)"
        error={errors.favoriteGenres?.message}
        inputProps={register('favoriteGenres')}
      />
      <label className="flex items-start gap-2.5 text-[13px] mb-4">
        <input
          type="checkbox"
          className="accent-lime w-[18px] h-[18px] shrink-0 mt-0.5"
          {...register('marketingConsent')}
        />
        <span>Quero receber novidades (opcional).</span>
      </label>
      <Button primary full type="submit" disabled={login.isPending}>
        {login.isPending ? 'Criando conta…' : 'Criar conta'}
      </Button>
    </form>
  );
}

export function AuthDialog({ signup: initialSignup }: { signup?: boolean }) {
  const [signup, setSignup] = useState(!!initialSignup);

  return (
    <div>
      <h2 className="text-[34px] leading-[1.08] tracking-tight m-0 mb-3 pr-10">
        {signup ? 'Criar minha conta' : 'Entrar'}
      </h2>
      <p className="text-sm text-muted leading-relaxed mb-5">
        {signup
          ? 'Guarde seus filmes e cinemas favoritos.'
          : 'Continue de onde parou.'}
      </p>
      {signup ? <SignupForm /> : <LoginForm />}
      <div className="text-[11px] text-faint text-center my-4 tracking-[0.12em]">
        {signup ? 'Já tem conta?' : 'Ainda não tem conta?'}
      </div>
      <TextLink full onClick={() => setSignup((v) => !v)}>
        {signup ? 'Entrar' : 'Criar minha conta'}
      </TextLink>
    </div>
  );
}
