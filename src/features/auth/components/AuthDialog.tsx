'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useLoginMutation } from '../api/useLoginMutation';
import { loginSchema, type LoginValues } from '../schema/loginSchema';
import { signupSchema, type SignupValues } from '../schema/signupSchema';
import { Button } from '@/shared/ui/Button';
import { Field } from '@/shared/ui/Field';
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
    defaultValues: { email: '' },
  });

  return (
    <form
      noValidate
      onSubmit={handleSubmit(({ email }) => login.mutate({ email }))}
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
      <Field label="Senha de teste">
        <input
          className={inputClass}
          name="password"
          type="password"
          defaultValue="demonstracao"
          autoComplete="off"
        />
        <small className="text-xs text-faint">
          A senha não é validada nem armazenada.
        </small>
      </Field>
      <Button primary full type="submit" disabled={login.isPending}>
        {login.isPending ? 'Entrando…' : 'Entrar na homologação'}
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
    defaultValues: { name: '', email: '', marketingConsent: false },
  });

  return (
    <form
      noValidate
      onSubmit={handleSubmit((values) =>
        login.mutate({ ...values, signup: true })
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
      <label className="flex items-start gap-2.5 text-[13px] mb-4">
        <input
          type="checkbox"
          className="accent-lime w-[18px] h-[18px] shrink-0 mt-0.5"
          {...register('marketingConsent')}
        />
        <span>Quero receber novidades (opcional).</span>
      </label>
      <Button primary full type="submit" disabled={login.isPending}>
        {login.isPending ? 'Criando conta…' : 'Criar conta de teste'}
      </Button>
    </form>
  );
}

export function AuthDialog({ signup: initialSignup }: { signup?: boolean }) {
  const [signup, setSignup] = useState(!!initialSignup);
  const demo = useLoginMutation();

  return (
    <div>
      <h2 className="text-[34px] leading-[1.08] tracking-tight m-0 mb-3 pr-10">
        {signup ? 'Criar minha conta' : 'Entrar'}
      </h2>
      <p className="text-sm text-muted leading-relaxed">
        {signup
          ? 'Guarde seus filmes e cinemas favoritos.'
          : 'Continue de onde parou.'}
      </p>
      <div className="grid grid-cols-2 gap-2.5 my-5">
        <Button disabled title="Integração não conectada nesta homologação">
          Google
        </Button>
        <Button disabled title="Integração não conectada nesta homologação">
          Apple
        </Button>
      </div>
      <p className="text-xs text-faint leading-relaxed mb-4">
        Identificação de teste. Google e Apple ainda não estão conectados; não
        use credenciais reais.
      </p>
      {signup ? <SignupForm /> : <LoginForm />}
      <div className="mt-3">
        <Button
          full
          disabled={demo.isPending}
          onClick={() =>
            demo.mutate({ name: 'Henrique', email: 'henrique@grozze.demo' })
          }
        >
          Entrar como usuário de teste
        </Button>
      </div>
      <div className="text-[11px] text-faint text-center my-4 tracking-[0.12em]">
        {signup ? 'Já tem conta?' : 'Ainda não tem conta?'}
      </div>
      <TextLink full onClick={() => setSignup((v) => !v)}>
        {signup ? 'Entrar' : 'Criar minha conta'}
      </TextLink>
    </div>
  );
}
