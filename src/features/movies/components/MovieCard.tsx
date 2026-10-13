'use client';

import Link from 'next/link';
import type { ReactNode } from 'react';
import { useAppStore } from '@/shared/store';
import { dateLabel } from '@/shared/lib/date';
import {
  isRerelease,
  movieHref,
  status,
  statusLabel,
  type Movie,
} from '@/entities/movie';
import { MoviePoster } from './MoviePoster';
import { HeartButton } from '@/shared/ui';

export function MovieCard({
  m,
  rank,
  alwaysSave = false,
  scope,
}: {
  m: Movie;
  rank?: number | null;
  alwaysSave?: boolean;
  scope?: string | null;
}) {
  const logged = useAppStore((s) => s.logged());
  const requestFavorite = useAppStore((s) => s.requestFavorite);
  const movieSaved = useAppStore((s) => s.movieSaved(m.id));
  const href = movieHref(m.id, scope);
  // Re-releases keep their tag instead of the date
  const soon = status(m) === 'soon' && !isRerelease(m);
  const label = soon ? dateLabel(m.releaseDate) : statusLabel(m);

  const heartButton = (
    <HeartButton
      kind="movie"
      id={m.id}
      label={m.t}
      path={href}
      className="absolute right-2 top-2 z-[3]"
    />
  );

  // Upcoming movies show "Quero ver" until saved; others show a heart when allowed
  let controls: ReactNode = null;
  if (soon) {
    controls = movieSaved ? (
      heartButton
    ) : (
      <button
        type="button"
        // With a mouse it slides in on hover (or keyboard focus); touch screens always show it
        className="want-btn absolute bottom-2.5 left-2.5 w-[calc(100%-20px)] z-[3] min-h-[38px] rounded-[11px] bg-bg/90 border border-lime/40 text-xs font-extrabold flex justify-center items-center text-center px-2 hover:bg-lime hover:text-[#081004] transition-[opacity,translate,background-color,color] duration-200 ease-out motion-reduce:transition-none pointer-fine:opacity-0 pointer-fine:translate-y-2 pointer-fine:pointer-events-none group-hover/card:opacity-100 group-hover/card:translate-y-0 group-hover/card:pointer-events-auto group-focus-within/card:opacity-100 group-focus-within/card:translate-y-0 group-focus-within/card:pointer-events-auto"
        onClick={(e) => {
          e.preventDefault();
          requestFavorite('movie', m.id, href);
        }}
      >
        Quero ver
      </button>
    );
  } else if (logged || alwaysSave) {
    controls = heartButton;
  }

  return (
    <article className="movie-card group/card min-w-0 relative">
      <div className="poster-box relative min-w-0 isolate">
        <Link className="block" href={href} aria-label={`Ver ${m.t}`}>
          <MoviePoster m={m} />
        </Link>
        {rank ? (
          <span className="rank-tag absolute -left-0.5 bottom-3.5 z-[4] bg-lime text-[#081004] rounded-r-xl w-[47px] h-[57px] flex items-center justify-center flex-col shadow-[0_6px_15px_#0006] pointer-events-none">
            <small className="text-[8px] font-black leading-none">TOP</small>
            <strong className="text-[29px] leading-[1.1] tracking-[-0.065em]">
              {String(rank).padStart(2, '0')}
            </strong>
          </span>
        ) : label ? (
          <span className="poster-label absolute left-2 top-2 z-[2] text-[10px] font-extrabold text-lime border border-lime/30 rounded-full bg-bg/90 px-2 py-1 max-w-[calc(100%-60px)]">
            {label}
          </span>
        ) : null}
        {controls}
      </div>
      <h3 className="text-[15px] leading-[1.27] mt-2.5 mb-1 break-words whitespace-normal">
        <Link href={href}>{m.t}</Link>
      </h3>
      <p className="text-xs text-muted m-0 leading-relaxed">
        {soon ? m.distLabel : m.genre}
      </p>
    </article>
  );
}
