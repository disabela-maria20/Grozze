'use client';

import { useMovieShowtimesQuery } from '@/shared/api';
import { cinema, dateLabel, movie } from '@/shared/lib/catalog';
import { useAppStore } from '@/shared/store';
import { MoviePoster } from '../components';
import { FilmLoader, Icon, LinkButton } from '@/shared/ui';

export function SessionDialog({ sessionId }: { sessionId: string }) {
  const content = useAppStore((s) => s.content);
  // Session ids start with the movie id (see `toShowtimes`)
  const movieId = String(sessionId || '').split('|')[0];
  const { data, isPending } = useMovieShowtimesQuery(movieId);
  if (isPending) return <FilmLoader label="Carregando sessão…" compact />;
  const session = data?.find((item) => item.id === sessionId);
  const film = session && movie(session.movie, content);
  if (!session || !film) return <p>Essa sessão não está disponível.</p>;
  const theater = cinema(session.theater);

  return (
    <div>
      <p className="eyebrow text-[11px] tracking-[0.17em] uppercase font-extrabold text-lime mb-2">
        Sua sessão
      </p>
      <h2 className="text-[34px] leading-[1.08] tracking-tight m-0 mb-3 pr-10">
        Confira os detalhes
      </h2>
      <div className="flex items-center gap-4 mb-4">
        <MoviePoster m={film} className="w-[62px] shrink-0 rounded-[9px]" />
        <div>
          <h3 className="text-[22px] leading-[1.2] m-0 mb-1">{film.t}</h3>
          <p className="text-muted m-0 text-[13px]">{theater?.name}</p>
        </div>
      </div>
      <dl className="grid grid-cols-2 gap-4 my-6">
        {[
          ['Data', dateLabel(session.date, true)],
          ['Horário', session.time],
          ['Sala', session.room],
          ['Experiência', session.tech],
          ['Idioma', session.lang],
          ['Cinema', theater?.name || '—'],
        ].map(([term, description]) => (
          <div key={term}>
            <dt className="text-[11px] uppercase text-faint tracking-wide">
              {term}
            </dt>
            <dd className="mt-1 text-base font-semibold break-words">
              {description}
            </dd>
          </div>
        ))}
      </dl>
      {session.purchaseUrl && (
        <LinkButton
          primary
          href={session.purchaseUrl}
          target="_blank"
          rel="noopener noreferrer"
        >
          Comprar {session.seller ? `na ${session.seller}` : 'ingresso'}{' '}
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
