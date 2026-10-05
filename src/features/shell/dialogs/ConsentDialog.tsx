'use client';

import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAppStore } from '@/shared/store';
import { consentSchema, type ConsentValues } from '../schema';
import { Button } from '@/shared/ui';

export function ConsentDialog() {
  const consent = useAppStore((s) => s.consent);
  const saveConsent = useAppStore((s) => s.saveConsent);
  const { register, handleSubmit } = useForm<ConsentValues>({
    resolver: zodResolver(consentSchema),
    defaultValues: { optional: !!consent?.preferences },
  });

  return (
    <div>
      <p className="text-[11px] tracking-[0.17em] uppercase font-extrabold text-lime mb-2">
        Privacidade
      </p>
      <h2 className="text-[34px] leading-[1.08] tracking-tight m-0 mb-3 pr-10">
        Preferências de cookies
      </h2>
      <p className="text-sm text-muted leading-relaxed mb-5">
        Este é o mesmo controle usado no primeiro acesso.
      </p>
      <form onSubmit={handleSubmit(({ optional }) => saveConsent(optional))}>
        <div className="grid gap-3 my-5">
          <label className="flex gap-3.5 justify-between border border-line p-3.5 rounded-[13px]">
            <span>
              <strong className="block text-base">Necessários</strong>
              <small className="text-xs text-muted mt-1 block">
                Funcionamento e escolhas solicitadas por você.
              </small>
            </span>
            <input
              type="checkbox"
              checked
              disabled
              className="accent-lime w-5 h-5 shrink-0"
            />
          </label>
          <label className="flex gap-3.5 justify-between border border-line p-3.5 rounded-[13px]">
            <span>
              <strong className="block text-base">
                Preferências opcionais
              </strong>
              <small className="text-xs text-muted mt-1 block">
                Autorizar armazenamento de preferências adicionais.
              </small>
            </span>
            <input
              type="checkbox"
              {...register('optional')}
              className="accent-lime w-5 h-5 shrink-0"
            />
          </label>
        </div>
        <div className="flex items-center gap-2.5">
          <Button primary type="submit">
            Salvar preferências
          </Button>
          <Button type="button" onClick={() => saveConsent(false)}>
            Somente essenciais
          </Button>
        </div>
      </form>
      <p className="text-xs text-faint mt-4.5">
        <Link className="hover:text-lime" href="/privacidade">
          Política de Privacidade
        </Link>{' '}
        ·{' '}
        <Link className="hover:text-lime" href="/termos">
          Termos de Uso
        </Link>
      </p>
    </div>
  );
}
