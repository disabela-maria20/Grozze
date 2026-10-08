'use client';

import Link from 'next/link';
import {
  allMovies,
  DISTRIBUTORS,
  hasSessions,
  movieHref,
  statusLabel,
} from '@/shared/lib/catalog';
import { useAppStore } from '@/shared/store';
import { MovieMeta, MovieSection } from '@/features/movies';
import { NewsSection, useNewsListQuery } from '@/features/news';
import { NotFound, Icon } from '@/shared/ui';

export function DistributorPage({ slug }: { slug: string }) {
  const content = useAppStore((s) => s.content);
  // News is no longer distributor-scoped (the API doesn't model that): show the latest
  const latestNews = useNewsListQuery(1, 3).data?.items ?? [];
  const distributor = DISTRIBUTORS.find(
    (candidate) =>
      candidate.slug === slug &&
      candidate.status === 'active' &&
      candidate.public
  );
  if (!distributor) return <NotFound />;
  const distributorMovies = allMovies(content).filter(
    (distributorMovie) => distributorMovie.dist === slug
  );
  // The first movie of the distributor is featured in the hero banner
  const featuredMovie = distributorMovies[0];

  return (
    <div>
      <div className="page pt-[120px] max-sm:pt-[101px] pb-0 min-h-0">
        <div className="w-[min(1220px,calc(100%-56px))] max-sm:w-[calc(100%-32px)] mx-auto">
          <header className="mb-6.5">
            <p className="text-[11px] tracking-[0.17em] uppercase font-extrabold text-lime mb-2">
              {distributor.formal}
            </p>
            <h1 className="text-[48px] max-sm:text-[38px] -tracking-[0.05em] leading-[1.05] mb-3">
              {distributor.name}
            </h1>
          </header>
        </div>
      </div>
      {featuredMovie && (
        <section className="hero relative isolate bg-[#09110d] overflow-hidden">
          <div className="absolute inset-0 -z-10">
            {featuredMovie.backdrop && (
              <img
                src={featuredMovie.backdrop}
                alt=""
                className="w-full h-full object-cover"
              />
            )}
          </div>
          <div className="w-[min(1220px,calc(100%-56px))] max-sm:w-[calc(100%-32px)] mx-auto min-h-[450px] pt-[70px] flex items-end pb-10">
            <div className="w-[720px] max-w-full">
              <div className="text-[11px] tracking-[0.17em] uppercase font-extrabold text-lime mb-2">
                {statusLabel(featuredMovie)}
              </div>
              <h1 className="text-[44px] max-sm:text-[32px] font-extrabold leading-[1.1] -tracking-[0.04em] mb-3">
                {featuredMovie.t}
              </h1>
              <MovieMeta m={featuredMovie} />
              <p className="text-[#cbd5cd] text-base leading-relaxed mb-4 max-w-[620px]">
                {featuredMovie.syn}
              </p>
              <Link
                className="min-h-[46px] px-5 py-2.5 rounded-full bg-lime text-[#081004] font-extrabold inline-flex items-center gap-2 text-sm hover:bg-[#d5ff70] transition-colors"
                href={movieHref(featuredMovie.id, slug)}
              >
                Ver filme <Icon name="arrow" className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </section>
      )}
      <MovieSection
        title="Nos cinemas"
        list={distributorMovies.filter((m) => hasSessions(m.id))}
        scope={slug}
      />
      <MovieSection
        title="Vem aí"
        list={distributorMovies.filter((m) => !hasSessions(m.id))}
        scope={slug}
      />
      <NewsSection items={latestNews} title="Notícias" scope={slug} />
    </div>
  );
}
