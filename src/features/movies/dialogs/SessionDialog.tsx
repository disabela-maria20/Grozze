'use client';

import { cinema } from '@/shared/lib/catalog/cinema';
import { dateLabel } from '@/shared/lib/catalog/dateLabel';
import { movie } from '@/shared/lib/catalog/movie';
import { sessionIndex } from '@/shared/lib/catalog/sessionIndex';
import { useAppStore } from '@/shared/store/useAppStore';
import { MoviePoster } from '../components/MoviePoster';
import { Button } from '@/shared/ui/Button';
import { Icon } from '@/shared/ui/Icon';

export function SessionDialog({ sessionId }: { sessionId: string }) {
  const content = useAppStore((s) => s.content);
  const openDialog = useAppStore((s) => s.openDialog);
  const s = sessionIndex.get(sessionId);
  if (!s) return <p>Essa sessão não está disponível.</p>;
  const m = movie(s.movie, content)!;
  const c = cinema(s.theater)!;

  return (
    <div>
      <p className="eyebrow text-[11px] tracking-[0.17em] uppercase font-extrabold text-lime mb-2">
        Sua sessão
      </p>
      <h2 className="text-[34px] leading-[1.08] tracking-tight m-0 mb-3 pr-10">
        Confira os detalhes
      </h2>
      <div className="flex items-center gap-4 mb-4">
        <MoviePoster m={m} className="w-[62px] shrink-0 rounded-[9px]" />
        <div>
          <h3 className="text-[22px] leading-[1.2] m-0 mb-1">{m.t}</h3>
          <p className="text-muted m-0 text-[13px]">{c.name}</p>
        </div>
      </div>
      <dl className="grid grid-cols-2 gap-4 my-6">
        {[
          ['Data', dateLabel(s.date, true)],
          ['Horário', s.time],
          ['Sala', s.room],
          ['Experiência', s.tech],
          ['Idioma', s.lang],
          ['Cinema', c.name],
        ].map(([dt, dd]) => (
          <div key={dt}>
            <dt className="text-[11px] uppercase text-faint tracking-wide">
              {dt}
            </dt>
            <dd className="mt-1 text-base font-semibold break-words">{dd}</dd>
          </div>
        ))}
      </dl>
      <div className="flex flex-wrap items-center gap-2.5">
        {s.sellers.map((seller) => (
          <Button
            key={seller}
            primary
            onClick={() => openDialog('partner', { seller })}
          >
            {seller === 'ingresso' ? 'Ingresso.com' : seller}{' '}
            <Icon name="arrow" className="w-4 h-4" />
          </Button>
        ))}
      </div>
      <div className="border border-lime/25 bg-lime-soft p-3.5 rounded-[13px] text-xs text-[#c5d2be] mt-4">
        {s.simulated
          ? 'Horário replicado para simular esta data.'
          : 'Sessão observada no snapshot de setembro/2026.'}{' '}
        Esta homologação não reserva ingressos e não está conectada ao checkout
        da sessão.
      </div>
    </div>
  );
}
