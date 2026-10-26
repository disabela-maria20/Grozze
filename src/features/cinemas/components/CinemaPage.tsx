'use client';

import Link from 'next/link';
import { useState } from 'react';
import { cinema } from '@/entities/cinema';
import { movie, movieHref, type Movie, type Showtime } from '@/entities/movie';
import {
  DateButton,
  MoviePoster,
  openShowtimes,
  Rail,
  RoomBlocks,
} from '@/features/movies';
import { useAppStore } from '@/shared/store';
import { FilmLoader, Icon, NotFound, TextLink } from '@/shared/ui';
import { useCinemaProgram } from '../api';

function roomCountLabel(roomCount: number) {
  return `${roomCount} ${roomCount === 1 ? 'sala' : 'salas'}`;
}

export function CinemaPage({ id }: { id: string }) {
  const cinemaSaved = useAppStore((s) => s.cinemaSaved(id));
  const openDialog = useAppStore((s) => s.openDialog);
  const cinemaInfo = cinema(id);

  if (!cinemaInfo) return <NotFound />;

  const place = [cinemaInfo.city, cinemaInfo.uf].filter(Boolean).join(' · ');
  const tags = [
    place,
    cinemaInfo.roomCount ? roomCountLabel(cinemaInfo.roomCount) : '',
    ...cinemaInfo.phones,
  ].filter(Boolean);
  const toggleFavorite = () =>
    useAppStore.getState().requestFavorite('cinema', id, `/cinema/${id}`);

  return (
    <div className="page pt-[120px] max-sm:pt-[101px] pb-13 min-h-[65vh]">
      <div className="w-[min(1220px,calc(100%-56px))] max-sm:w-[calc(100%-32px)] mx-auto">
        <header className="mb-6.5 flex justify-between items-start gap-5 max-sm:block">
          <div>
            <p className="text-[11px] tracking-[0.17em] uppercase font-extrabold text-lime mb-2">
              {cinemaInfo.network}
            </p>
            <h1 className="font-bold text-[48px] max-sm:text-[36px] -tracking-[0.05em] leading-[1.05] mb-3">
              {cinemaInfo.name}
            </h1>
            <p className="text-muted text-[15px] mb-3">{cinemaInfo.address}</p>
            <div className="flex gap-2 flex-wrap">
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="text-xs px-2.5 py-1.5 border border-line rounded-full text-[#bec9bf]"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
          <button
            type="button"
            onClick={toggleFavorite}
            aria-pressed={cinemaSaved}
            className={`min-h-[46px] px-5 py-2.5 rounded-full border border-line inline-flex items-center justify-center gap-2 text-sm font-semibold mt-4 max-sm:mt-4.5 ${
              cinemaSaved
                ? 'bg-lime! text-[#081004]! border-lime!'
                : 'text-lime'
            }`}
          >
            <Icon name="heart" />
            <span>{cinemaSaved ? 'Cinema salvo' : 'Favoritar cinema'}</span>
          </button>
        </header>
        <div className="flex items-center gap-3.5 flex-wrap mb-6">
          <button
            type="button"
            onClick={() => openDialog('prices', { cinemaId: id })}
            className="min-h-10 text-[13px] px-3.5 py-2 rounded-full bg-lime text-[#081004] font-extrabold"
          >
            Confira preços
          </button>
          {cinemaInfo.siteUrl && (
            <a
              className="text-[13px] inline-flex items-center gap-1.5 text-[#dce3dc] hover:text-lime transition-colors"
              href={cinemaInfo.siteUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              Site do cinema <Icon name="arrow" className="w-4 h-4" />
            </a>
          )}
          <p className="m-0 text-xs text-faint">
            Valores variam por sala, dia e tecnologia.
          </p>
        </div>
        <CinemaProgram cinemaId={id} />
      </div>
    </div>
  );
}

/** One movie of the cinema's program: poster, title and its sessions by room. */
function CinemaMovie({ film, rows }: { film: Movie; rows: Showtime[] }) {
  const content = useAppStore((s) => s.content);
  const preferences = useAppStore((s) => s.profile()?.preferences);
  // The catalog version carries the CMS edits; the program's is the fallback
  const shown = movie(film.id, content) ?? film;
  const href = movieHref(shown.id);
  return (
    <article
      className="grid grid-cols-[92px_1fr] max-sm:grid-cols-[72px_1fr] gap-4.5 max-sm:gap-3.5 py-5.5 border-t border-line first:border-0 first:pt-0"
      data-movie={shown.id}
    >
      <Link href={href} aria-label={`Ver ${shown.t}`}>
        <MoviePoster m={shown} className="rounded-xl" />
      </Link>
      <div className="min-w-0">
        <h3 className="text-[21px] max-sm:text-lg leading-tight m-0 mb-1">
          <Link href={href} className="hover:text-lime transition-colors">
            {shown.t}
          </Link>
        </h3>
        <p className="text-[13px] text-muted m-0">
          {[shown.genre, shown.dur].filter(Boolean).join(' · ')}
        </p>
        <RoomBlocks rows={rows} preferences={preferences} boxed />
      </div>
    </article>
  );
}

/**
 * "Sessões neste cinema": the days the cinema has sessions and, per movie,
 * its session times (only the ones still ahead).
 */
function CinemaProgram({ cinemaId }: { cinemaId: string }) {
  const program = useCinemaProgram(cinemaId);
  const [picked, setPicked] = useState('');

  const upcoming = openShowtimes(program.data?.rows);
  const dates = [...new Set(upcoming.map((row) => row.date))].sort();
  // Until a day is picked (or if it's gone after a refetch), the first one
  const date = dates.includes(picked) ? picked : (dates[0] ?? '');

  const films = new Map((program.data?.movies ?? []).map((m) => [m.id, m]));
  const byMovie = new Map<string, Showtime[]>();
  for (const row of upcoming) {
    if (row.date !== date) continue;
    if (!byMovie.has(row.movie)) byMovie.set(row.movie, []);
    byMovie.get(row.movie)!.push(row);
  }
  // Movies by their first session of the day
  const earliest = (rows: Showtime[]) =>
    rows.reduce((first, row) => (row.time < first ? row.time : first), '99:99');
  const movies = [...byMovie].sort(([, a], [, b]) =>
    earliest(a).localeCompare(earliest(b))
  );

  let body;
  if (program.isPending) {
    body = <FilmLoader label="Buscando sessões neste cinema…" />;
  } else if (program.isError) {
    body = (
      <div className="border border-line rounded-app p-5 bg-surface text-muted">
        <p className="m-0 mb-2">Não foi possível carregar as sessões.</p>
        <TextLink onClick={() => program.refetch()}>Tentar novamente</TextLink>
      </div>
    );
  } else if (!movies.length) {
    body = (
      <div className="border border-line rounded-app p-5 bg-surface text-muted">
        Este cinema ainda não tem sessões programadas.
      </div>
    );
  } else {
    body = movies.map(([movieId, rows]) => {
      const film = films.get(movieId);
      return film ? (
        <CinemaMovie key={movieId} film={film} rows={rows} />
      ) : null;
    });
  }

  return (
    <section id="sessoes" className="py-8 scroll-mt-[170px]">
      <p className="text-[11px] tracking-[0.17em] uppercase font-extrabold text-lime mb-2">
        Programação
      </p>
      <h2 className="font-bold text-[32px] max-sm:text-[27px] tracking-tight mb-5">
        Sessões neste cinema
      </h2>
      {dates.length > 0 && (
        <Rail aria-label="Datas de sessão">
          {dates.map((day) => (
            <DateButton
              key={day}
              date={day}
              selected={day === date}
              onSelect={() => setPicked(day)}
            />
          ))}
        </Rail>
      )}
      <div className="mt-6">{body}</div>
    </section>
  );
}
