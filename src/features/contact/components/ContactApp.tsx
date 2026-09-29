'use client';

import { useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAppStore } from '@/shared/store/useAppStore';
import { useCreateLeadMutation } from '../api/useCreateLeadMutation';
import { contactSchema, type ContactValues } from '../schema/contactSchema';
import { Button } from '@/shared/ui/Button';
import { Field } from '@/shared/ui/Field';
import { FieldError } from '@/shared/ui/FieldError';
import { inputClass } from '@/shared/ui/inputClass';

const EMPTY: ContactValues = {
  name: '',
  email: '',
  message: '',
  marketingConsent: false,
};

export function ContactApp({ newsletter = false }: { newsletter?: boolean }) {
  const toast = useAppStore((s) => s.toast);
  const captureLead = useCreateLeadMutation();
  const schema = useMemo(() => contactSchema(newsletter), [newsletter]);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ContactValues>({
    resolver: zodResolver(schema),
    defaultValues: EMPTY,
  });

  const submit = handleSubmit((values) =>
    captureLead.mutate(
      { source: newsletter ? 'Newsletter' : 'Contato', ...values },
      {
        onSuccess: () => {
          reset(EMPTY);
          toast('Registro salvo para homologação. Nenhum e-mail foi enviado.');
        },
      }
    )
  );

  return (
    <div className="page pt-[120px] max-sm:pt-[101px] pb-13 min-h-[65vh]">
      <div className="w-[min(1220px,calc(100%-56px))] max-sm:w-[calc(100%-32px)] mx-auto max-w-[860px]">
        <header className="mb-6.5">
          <h1 className="text-[48px] max-sm:text-[38px] -tracking-[0.05em] leading-[1.05] mb-3">
            {newsletter ? 'Fique por dentro' : 'Fale com a Grozze'}
          </h1>
          <p className="text-muted text-[15px]">
            {newsletter
              ? 'Estreias e novidades que você quer acompanhar.'
              : 'Deixe sua mensagem.'}
          </p>
        </header>
        <form
          noValidate
          className="p-6 max-sm:p-4.5 border border-line bg-surface rounded-app"
          onSubmit={submit}
        >
          <div className="grid grid-cols-2 max-sm:grid-cols-1 gap-4.5">
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
                autoComplete="email"
                aria-invalid={!!errors.email}
                {...register('email')}
              />
            </Field>
          </div>
          {!newsletter && (
            <Field label="Mensagem" error={errors.message?.message}>
              <textarea
                className={`${inputClass} min-h-[110px] resize-y`}
                aria-invalid={!!errors.message}
                {...register('message')}
              />
            </Field>
          )}
          <div className="mb-4.5">
            <label className="flex items-start gap-2.5 text-[13px]">
              <input
                type="checkbox"
                aria-invalid={!!errors.marketingConsent}
                className="accent-lime w-[18px] h-[18px] shrink-0 mt-0.5"
                {...register('marketingConsent')}
              />
              <span>
                {newsletter
                  ? 'Autorizo o recebimento da newsletter.'
                  : 'Desejo receber novidades por e-mail (opcional).'}{' '}
                <a className="underline hover:text-lime" href="/privacidade">
                  Política de Privacidade
                </a>
                .
              </span>
            </label>
            <FieldError message={errors.marketingConsent?.message} />
          </div>
          <p className="text-xs text-faint mb-4">
            Formulário de homologação: o envio é registrado localmente, sem
            mensagem real.
          </p>
          <Button primary type="submit" disabled={captureLead.isPending}>
            {captureLead.isPending
              ? 'Enviando…'
              : newsletter
                ? 'Cadastrar'
                : 'Enviar mensagem'}
          </Button>
        </form>
      </div>
    </div>
  );
}
