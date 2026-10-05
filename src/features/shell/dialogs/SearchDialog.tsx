'use client';

import { useMemo, useState } from 'react';
import {
  allMovies,
  dateLabel,
  movieHref,
  normalize,
  sortedCinemas,
  statusLabel,
} from '@/shared/lib/catalog';
import { useAppStore } from '@/shared/store';
import { Icon } from '@/shared/ui';

const MAX_MOVIE_RESULTS = 7;
const MAX_CINEMA_RESULTS = 4;

/**
 * Catalog search over movies (title + genre) and cinemas (name + address).
 * Inside a distributor hub (`scope`) only that distributor's movies are
 * searched and cinemas are left out.
 */
export function SearchDialog({ scope }: { scope?: string | null }) {
  const [query, setQuery] = useState('');
  const content = useAppStore((s) => s.content);
  const cinemaSaved = useAppStore((s) => s.cinemaSaved);

  const { movies, cinemas } = useMemo(() => {
    const normalizedQuery = normalize(query);
    const matchingMovies = allMovies(content)
      .filter(
        (movie) =>
          (!scope || movie.dist === scope) &&
          normalize(movie.t + ' ' + movie.genre).includes(normalizedQuery)
      )
      .slice(0, MAX_MOVIE_RESULTS);
    const matchingCinemas = scope
      ? []
      : sortedCinemas(cinemaSaved)
          .filter((cinema) =>
            normalize(cinema.name + ' ' + cinema.address).includes(
              normalizedQuery
            )
          )
          .slice(0, MAX_CINEMA_RESULTS);
    return { movies: matchingMovies, cinemas: matchingCinemas };
  }, [query, scope, content, cinemaSaved]);

  const hasResults = movies.length || cinemas.length;

  return (
    <div>
      <h2 className="text-[34px] leading-[1.08] tracking-tight m-0 mb-4 pr-10">
        Buscar
      </h2>
      <label className="flex items-center gap-2.5 flex-1 min-w-0 min-h-[52px] rounded-2xl border border-line bg-surface px-4">
        <Icon name="search" />
        {/* The search dialog opens ready to type */}
        <input
          // eslint-disable-next-line jsx-a11y/no-autofocus
          autoFocus
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Filme, cinema ou bairro"
          aria-label="Buscar em todo o catálogo"
          className="min-w-0 w-full text-app-text border-0 outline-none bg-transparent text-base h-[50px]"
        />
      </label>
      <div className="mt-4">
        {!hasResults && (
          <p className="text-muted">Nenhum resultado encontrado.</p>
        )}
        {movies.map((movie) => (
          <a
            key={movie.id}
            className="block mb-1.5 p-4 rounded-2xl border border-line bg-surface2"
            href={movieHref(movie.id, scope)}
          >
            <strong className="block">{movie.t}</strong>
            <small className="text-muted text-xs mt-1.5 block">
              {statusLabel(movie)} · {dateLabel(movie.releaseDate)}
            </small>
          </a>
        ))}
        {cinemas.map((cinema) => (
          <a
            key={cinema.id}
            className="block mb-1.5 p-4 rounded-2xl border border-line bg-surface2"
            href={`/cinema/${cinema.id}`}
          >
            <strong className="block">{cinema.name}</strong>
            <small className="text-muted text-xs mt-1.5 block">Cinema</small>
          </a>
        ))}
      </div>
    </div>
  );
}
