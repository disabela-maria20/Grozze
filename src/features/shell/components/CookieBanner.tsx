'use client';

import { useAppStore } from '@/shared/store';
import { Button } from '@/shared/ui';

export function CookieBanner() {
  const consent = useAppStore((s) => s.consent);
  const saveConsent = useAppStore((s) => s.saveConsent);
  const openDialog = useAppStore((s) => s.openDialog);

  if (consent?.version === 1) return null;

  return (
    <section
      id="consent-root"
      className="fixed z-[100] bottom-5 left-5 right-5 border border-white/[0.14] rounded-[20px] p-5 max-sm:p-4.5 bg-[rgba(10,16,12,.98)] shadow-[0_20px_65px_#0009] flex items-center justify-between gap-6 max-sm:flex-col max-sm:items-start max-sm:bottom-[calc(80px+env(safe-area-inset-bottom))] max-sm:left-3 max-sm:right-3"
      aria-label="Cookies e privacidade"
    >
      <div>
        <h2 className="text-[22px] leading-[1.2] m-0 mb-1.5">
          Cookies e privacidade
        </h2>
        <p className="text-[13px] text-muted m-0 max-w-[720px] leading-relaxed">
          O armazenamento necessário mantém suas escolhas e o funcionamento do
          site. Você decide sobre as preferências opcionais.{' '}
          <a
            className="text-muted underline hover:text-lime"
            href="/privacidade"
          >
            Política de Privacidade
          </a>{' '}
          ·{' '}
          <a className="text-muted underline hover:text-lime" href="/termos">
            Termos de Uso
          </a>
          .
        </p>
      </div>
      <div className="flex gap-1.5 shrink-0 max-sm:w-full max-sm:flex-wrap">
        <Button small onClick={() => saveConsent(false)}>
          Somente essenciais
        </Button>
        <Button small onClick={() => openDialog('consent')}>
          Configurar
        </Button>
        <Button small primary onClick={() => saveConsent(true)}>
          Aceitar opcionais
        </Button>
      </div>
    </section>
  );
}
