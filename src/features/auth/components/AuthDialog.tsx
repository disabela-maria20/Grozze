'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useLoginMutation } from '../api';
import {
  loginSchema,
  type LoginValues,
  signupSchema,
  type SignupValues,
} from '../schema';
import { Button, Field, GenrePicker, TextLink, inputClass } from '@/shared/ui';

const SIGNUP_DEFAULT_VALUES: SignupValues = {
  name: '',
  email: '',
  password: '',
  confirmPassword: '',
  favoriteGenres: [],
  marketingConsent: false,
};

/** Copy for each auth mode; the switch link leads to the other mode. */
const COPY = {
  login: {
    title: 'Entrar',
    subtitle: 'Continue de onde parou.',
    switchPrompt: 'Ainda não tem conta?',
    switchLabel: 'Criar minha conta',
  },
  signup: {
    title: 'Criar minha conta',
    subtitle: 'Guarde seus filmes e cinemas favoritos.',
    switchPrompt: 'Já tem conta?',
    switchLabel: 'Entrar',
  },
} as const;

function LoginForm() {
  const loginMutation = useLoginMutation();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  return (
    <form
      noValidate
      onSubmit={handleSubmit((values) => loginMutation.mutate(values))}
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
      <Field label="Senha" error={errors.password?.message}>
        <input
          className={inputClass}
          type="password"
          autoComplete="current-password"
          aria-invalid={!!errors.password}
          {...register('password')}
        />
      </Field>
      <Button primary full type="submit" disabled={loginMutation.isPending}>
        {loginMutation.isPending ? 'Entrando…' : 'Entrar'}
      </Button>
    </form>
  );
}

function SignupForm() {
  const loginMutation = useLoginMutation();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignupValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: SIGNUP_DEFAULT_VALUES,
  });

  // `confirmPassword` only matters for validation and is not sent.
  const submitSignup = handleSubmit(
    ({ name, email, password, favoriteGenres, marketingConsent }) =>
      loginMutation.mutate({
        name,
        email,
        password,
        favoriteGenres,
        marketingConsent,
        signup: true,
      })
  );

  return (
    <form noValidate onSubmit={submitSignup}>
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
      <Button primary full type="submit" disabled={loginMutation.isPending}>
        {loginMutation.isPending ? 'Criando conta…' : 'Criar conta'}
      </Button>
    </form>
  );
}

/** Login / sign-up panel with a link to toggle between the two modes. */
export function AuthDialog({ signup: initialSignup }: { signup?: boolean }) {
  const [signup, setSignup] = useState(!!initialSignup);
  const copy = signup ? COPY.signup : COPY.login;

  return (
    <div>
      <h2 className="text-[34px] leading-[1.08] tracking-tight m-0 mb-3 pr-10">
        {copy.title}
      </h2>
      <p className="text-sm text-muted leading-relaxed mb-5">{copy.subtitle}</p>
      {signup ? <SignupForm /> : <LoginForm />}
      <div className="text-[11px] text-faint text-center my-4 tracking-[0.12em]">
        {copy.switchPrompt}
      </div>
      <TextLink full onClick={() => setSignup((isSignup) => !isSignup)}>
        {copy.switchLabel}
      </TextLink>
    </div>
  );
}
