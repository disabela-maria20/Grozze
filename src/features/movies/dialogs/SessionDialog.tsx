'use client';

import { useMovieShowtimesQuery } from '@/shared/api';
import { cinema, dateLabel, movie } from '@/shared/lib/catalog';
import { useAppStore } from '@/shared/store';
import { MoviePoster } from '../components';
import { Icon, LinkButton } from '@/shared/ui';

export function SessionDialog({ sessionId }: { sessionId: string }) {
  const content = useAppStore((s) => s.content);
  // Session ids start with the movie id (see `toShowtimes`)
  const movieId = String(sessionId || '').split('|')[0];
  const { data, isPending } = useMovieShowtimesQuery(movieId);
  if (isPending) return <p className="text-muted">Carregando sessão…</p>;
  const s = data?.find((x) => x.id === sessionId);
  const m = s && movie(s.movie, content);
  if (!s || !m) return <p>Essa sessão não está disponível.</p>;
  const c = cinema(s.theater);

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
          <p className="text-muted m-0 text-[13px]">{c?.name}</p>
        </div>
      </div>
      <dl className="grid grid-cols-2 gap-4 my-6">
        {[
          ['Data', dateLabel(s.date, true)],
          ['Horário', s.time],
          ['Sala', s.room],
          ['Experiência', s.tech],
          ['Idioma', s.lang],
          ['Cinema', c?.name || '—'],
        ].map(([dt, dd]) => (
          <div key={dt}>
            <dt className="text-[11px] uppercase text-faint tracking-wide">
              {dt}
            </dt>
            <dd className="mt-1 text-base font-semibold break-words">{dd}</dd>
          </div>
        ))}
      </dl>
      {s.purchaseUrl && (
        <LinkButton
          primary
          href={s.purchaseUrl}
          target="_blank"
          rel="noopener noreferrer"
        >
          Comprar {s.seller ? `na ${s.seller}` : 'ingresso'}{' '}
          <Icon name="arrow" className="w-4 h-4" />
        </LinkButton>
      )}
      <div className="border border-lime/25 bg-lime-soft p-3.5 rounded-[13px] text-xs text-[#c5d2be] mt-4">
        A compra do ingresso é feita no canal de venda. Horários sujeitos a
        alteração pelo cinema.
      </div>
    </div>
  );
}
