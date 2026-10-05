'use client';

import { cinema } from '@/shared/lib/catalog';
import { useAppStore } from '@/shared/store';
import { Button } from '@/shared/ui';

export function PricesDialog({ cinemaId }: { cinemaId: string }) {
  const closeDialog = useAppStore((s) => s.closeDialog);
  const selectedCinema = cinema(cinemaId);
  return (
    <div>
      <h2 className="text-[28px] m-0 mb-3 pr-10">Preços dos ingressos</h2>
      <p className="text-sm text-muted leading-relaxed mb-5">
        Os valores de {selectedCinema?.name || 'este cinema'} não foram
        fornecidos na amostra. Consulte o canal de venda para o preço atualizado
        da sessão, taxas e condições de meia-entrada.
      </p>
      <Button onClick={() => closeDialog()}>Voltar à programação</Button>
    </div>
  );
}
