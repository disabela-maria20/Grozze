'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { movieHref, statusLabel } from '@/shared/lib/catalog';
import { useAppStore } from '@/shared/store';
import type { Movie } from '@/shared/lib/types';
import { MovieMeta } from '@/features/movies';
import { Icon } from '@/shared/ui';

export function HomeHero({ list }: { list: Movie[] }) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [hovering, setHovering] = useState(false);
  const dialogOpen = useAppStore((s) => !!s.dialog);
  const openDialog = useAppStore((s) => s.openDialog);
  const setHasHero = useAppStore((s) => s.setHasHero);
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    setHasHero(true);
    document.body.classList.add('has-hero');
    return () => {
      setHasHero(false);
      document.body.classList.remove('has-hero');
    };
  }, [setHasHero]);

  // Auto-advance unless paused, hovered/focused or covered by a dialog
  useEffect(() => {
    if (paused || hovering || dialogOpen) return;
    const timer = setInterval(() => {
      if (document.hidden) return;
      setIndex((current) => (current + 1) % list.length);
    }, 7500);
    return () => clearInterval(timer);
  }, [paused, hovering, dialogOpen, list.length]);

  if (!list.length) return null;
  const film = list[index % list.length];
  const href = movieHref(film.id);

  return (
    <section
      ref={sectionRef}
      id="homeHero"
      className="hero home-hero relative isolate bg-[#09110d] overflow-hidden"
      aria-roledescription="carrossel"
      aria-label="Filmes em destaque"
      onMouseEnter={() => setHovering(true)}
      onMouseLeave={() => setHovering(false)}
      onFocus={() => setHovering(true)}
      onBlur={() => setHovering(false)}
    >
      <div
        className="absolute inset-0 -z-20 bg-cover bg-[center_28%] opacity-85"
        style={{
          background: `radial-gradient(circle at 75% 20%, ${film.colors?.[0] || '#294630'}, #06110a)`,
        }}
      >
        {film.backdrop && (
          <img
            src={film.backdrop}
            alt=""
            draggable={false}
            className="w-full h-full object-cover object-[center_28%]"
          />
        )}
      </div>
      <div
        className="absolute inset-0 -z-10"
        style={{
          background:
            'linear-gradient(90deg, rgba(5,8,7,.94), rgba(5,8,7,.68) 43%, rgba(5,8,7,.12) 80%), linear-gradient(0deg, var(--color-bg) 1%, transparent 66%)',
        }}
      />
      <div className="w-[min(1220px,calc(100%-56px))] max-sm:w-[calc(100%-32px)] mx-auto min-h-[650px] max-sm:min-h-[590px] flex items-end pt-[174px] pb-[78px] max-sm:pt-[220px] max-sm:pb-[58px] max-sm:justify-center">
        <div className="w-[720px] max-w-full min-w-0 max-sm:text-center">
          <div className="text-[11px] tracking-[0.17em] uppercase font-extrabold text-lime mb-2 max-sm:text-[10px]">
            {statusLabel(film)}
          </div>
          <h1 className="text-[62px] max-sm:text-[clamp(29px,8.5vw,39px)] font-extrabold leading-[1.04] -tracking-[0.052em] my-2.5 mb-4.5 text-balance">
            <Link href={href}>{film.t}</Link>
          </h1>
          <MovieMeta m={film} />
          <p className="text-[#cbd5cd] text-base max-sm:text-[13px] leading-relaxed max-w-[670px] mb-5 max-sm:mx-auto line-clamp-2">
            {film.syn}
          </p>
          <div className="flex items-center gap-2.5 flex-wrap mt-5.5 max-sm:justify-center">
            <Link
              className="min-h-[46px] max-sm:min-h-[43px] px-5 py-2.5 rounded-full bg-lime text-[#081004] font-extrabold inline-flex items-center gap-2 text-sm hover:bg-[#d5ff70] transition-colors"
              href={`${href}?focus=sessoes`}
            >
              <Icon name="ticket" /> Compre agora
            </Link>
            <button
              type="button"
              className="min-h-[46px] max-sm:min-h-[43px] px-5 py-2.5 rounded-full border border-line bg-white/[0.035] inline-flex items-center gap-2 text-sm font-semibold hover:bg-lime-soft hover:border-lime/40 transition-colors"
              onClick={() => openDialog('trailer', { movieId: film.id })}
            >
              <Icon name="play" /> Trailer
            </button>
          </div>
        </div>
      </div>
      <div className="absolute left-0 right-0 bottom-5.5 flex items-center justify-center gap-2.5">
        {list.map((slide, slideIndex) => (
          <button
            key={slide.id}
            className="w-8 h-8 border-0 rounded-full bg-none p-0 inline-grid place-items-center"
            aria-current={slideIndex === index}
            aria-label={`Destacar ${slide.t}`}
            onClick={() => setIndex(slideIndex)}
          >
            <span
              className={`w-2.5 h-2.5 rounded-full transition-all ${slideIndex === index ? 'w-6 bg-lime' : 'bg-[#515b53]'}`}
            />
          </button>
        ))}
        <button
          type="button"
          className="bg-bg/55 border border-line rounded-full w-8 h-8 grid place-items-center ml-2.5"
          aria-label={`${paused ? 'Retomar' : 'Pausar'} carrossel`}
          onClick={() => setPaused((wasPaused) => !wasPaused)}
        >
          <Icon
            name={paused ? 'play' : 'pause'}
            className="w-[15px] h-[15px]"
          />
        </button>
      </div>
    </section>
  );
}
