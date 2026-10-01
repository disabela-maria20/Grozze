'use client';

import { dateLabel, nowInSaoPaulo } from '@/shared/lib/catalog';
import { useAppStore } from '@/shared/store';
import { LinkButton } from '@/shared/ui';

/**
 * The catalog API only serves sessions per movie, so there is no list of
 * everything starting in the next hour yet. Points to the movies instead.
 */
export function NowDialog() {
  const closeDialog = useAppStore((s) => s.closeDialog);
  const now = nowInSaoPaulo();

  return (
    <div>
      <p className="text-[11px] tracking-[0.17em] uppercase font-extrabold text-lime mb-2">
        Nos próximos 60 minutos
      </p>
      <h2 className="text-[34px] leading-[1.08] tracking-tight m-0 mb-3 pr-10">
        Começando agora
      </h2>
      <p className="text-sm text-muted leading-relaxed mb-5">
        Agenda de {dateLabel(now.date)} · {now.hour}:{now.minute}.
      </p>
      <div className="border border-line rounded-app p-5 bg-surface text-muted">
        <p>
          Escolha um filme para ver os horários de hoje nos cinemas perto de
          você.
        </p>
        <LinkButton href="/filmes" onClick={() => closeDialog()}>
          Explorar filmes
        </LinkButton>
      </div>
    </div>
  );
}
