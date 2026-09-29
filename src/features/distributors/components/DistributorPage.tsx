'use client';

import { allMovies } from '@/shared/lib/catalog/allMovies';
import { DISTRIBUTORS } from '@/shared/lib/catalog/DISTRIBUTORS';
import { hasSessions } from '@/shared/lib/catalog/hasSessions';
import { movieHref } from '@/shared/lib/catalog/movieHref';
import { NEWS } from '@/shared/lib/catalog/NEWS';
import { useAppStore } from '@/shared/store/useAppStore';
import { MovieMeta } from '@/features/movies';
import { MovieSection } from '@/features/movies';
import { NewsSection } from '@/features/news';
import { NotFound } from '@/shared/ui/NotFound';
import { Icon } from '@/shared/ui/Icon';

export function DistributorPage({ slug }: { slug: string }) {
  const content = useAppStore((s) => s.content);
  const d = DISTRIBUTORS.find(
    (x) => x.slug === slug && x.status === 'active' && x.public
  );
  if (!d) return <NotFound />;
  const list = allMovies(content).filter((m) => m.dist === slug);
  const lead = list[0];

  return (
    <div>
      <div className="page pt-[120px] max-sm:pt-[101px] pb-0 min-h-0">
        <div className="w-[min(1220px,calc(100%-56px))] max-sm:w-[calc(100%-32px)] mx-auto">
          <header className="mb-6.5">
            <p className="text-[11px] tracking-[0.17em] uppercase font-extrabold text-lime mb-2">
              {d.formal}
            </p>
            <h1 className="text-[48px] max-sm:text-[38px] -tracking-[0.05em] leading-[1.05] mb-3">
              {d.name}
            </h1>
          </header>
        </div>
      </div>
      {lead && (
        <section className="hero relative isolate bg-[#09110d] overflow-hidden">
          <div className="absolute inset-0 -z-10">
            {lead.backdrop && (
              <img
                src={lead.backdrop}
                alt=""
                className="w-full h-full object-cover"
              />
            )}
          </div>
          <div className="w-[min(1220px,calc(100%-56px))] max-sm:w-[calc(100%-32px)] mx-auto min-h-[450px] pt-[70px] flex items-end pb-10">
            <div className="w-[720px] max-w-full">
              <div className="text-[11px] tracking-[0.17em] uppercase font-extrabold text-lime mb-2">
                {lead.tag}
              </div>
              <h1 className="text-[44px] max-sm:text-[32px] font-extrabold leading-[1.1] -tracking-[0.04em] mb-3">
                {lead.t}
              </h1>
              <MovieMeta m={lead} />
              <p className="text-[#cbd5cd] text-base leading-relaxed mb-4 max-w-[620px]">
                {lead.syn}
              </p>
              <a
                className="min-h-[46px] px-5 py-2.5 rounded-full bg-lime text-[#081004] font-extrabold inline-flex items-center gap-2 text-sm hover:bg-[#d5ff70] transition-colors"
                href={movieHref(lead.id, slug)}
              >
                Ver filme <Icon name="arrow" className="w-4 h-4" />
              </a>
            </div>
          </div>
        </section>
      )}
      <MovieSection
        title="Nos cinemas"
        list={list.filter((m) => hasSessions(m.id))}
        scope={slug}
      />
      <MovieSection
        title="Vem aí"
        list={list.filter((m) => !hasSessions(m.id))}
        scope={slug}
      />
      <NewsSection
        items={NEWS.filter((n) => n.dist === slug)}
        title="Notícias"
        scope={slug}
      />
    </div>
  );
}
