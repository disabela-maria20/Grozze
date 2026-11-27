'use client';

import Link from 'next/link';
import { useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import { setUrlParam } from '@/shared/lib/route';
import { useComingSoonHighlightQuery } from '@/entities/banner';
import { allMovies, movie, movieHref, upcoming } from '@/entities/movie';
import { dateLabel, MONTH_NAMES } from '@/shared/lib/date';
import { unique } from '@/shared/lib/text';
import { useAppStore } from '@/shared/store';
import { MovieCard } from './MovieCard';
import { MoviePoster } from './MoviePoster';
import { Rail } from './Rail';
import { Chip, Icon, RemoteImage } from '@/shared/ui';
import { SaveButton } from './SaveButton';

export function ComingSoonApp() {
  const content = useAppStore((s) => s.content);
  const highlight = useComingSoonHighlightQuery();
  const list = useMemo(() => allMovies(content).filter(upcoming), [content]);
  const years = useMemo(
    () => unique(list.map((film) => film.releaseDate.slice(0, 4))).sort(),
    [list]
  );
  // Year and month live in the URL (`?ano=2027&mes=03`): back from a movie
  // and a reload land on the month the user was browsing
  const searchParams = useSearchParams();
  const pickedYear = searchParams.get('ano') ?? '';
  const year = years.includes(pickedYear) ? pickedYear : years[0] || '';
  const setYear = (value: string) => {
    setUrlParam('mes', '');
    setUrlParam('ano', value, years[0]);
  };
  const months = useMemo(
    () =>
      unique(
        list
          .filter((film) => film.releaseDate.startsWith(year))
          .map((film) => film.releaseDate.slice(5, 7))
      ).sort(),
    [list, year]
  );
  const month = searchParams.get('mes') ?? '';
  // Falls back to the first month when the picked one isn't in the year
  const effectiveMonth = months.includes(month) ? month : months[0] || '';
  const setMonth = (value: string) => setUrlParam('mes', value, months[0]);

  const selected = list
    .filter((film) => film.releaseDate.startsWith(year + '-' + effectiveMonth))
    .sort((a, b) => a.releaseDate.localeCompare(b.releaseDate));

  // Featured movie: the admin's pick while it's still on this page (not yet
  // released), else the next release, preferring one with a banner image.
  // Nothing while the pick loads, so the default doesn't flash before it.
  const pickedId = highlight.data?.movieId;
  const picked = pickedId ? movie(pickedId, content) : null;
  const soonest = [...list].sort((a, b) =>
    a.releaseDate.localeCompare(b.releaseDate)
  );
  const lead = highlight.isPending
    ? null
    : (picked && upcoming(picked) ? picked : null) ||
      // A real banner: without one, `backdrop` repeats the poster
      soonest.find((film) => film.backdrop && film.backdrop !== film.poster) ||
      soonest[0];

  return (
    <div className="page pt-[120px] max-sm:pt-[101px] pb-13 min-h-[65vh]">
      <div className="w-[min(1220px,calc(100%-56px))] max-sm:w-[calc(100%-32px)] mx-auto">
        <header className="mb-6.5">
          <h1 className="text-[48px] max-sm:text-[38px] -tracking-[0.05em] leading-[1.05] mb-3">
            Em breve
          </h1>
        </header>
        {highlight.isPending && list.length > 0 && (
          <div
            aria-hidden
            className="skeleton rounded-app min-h-[420px] max-sm:min-h-[380px] my-5"
          />
        )}
        {lead && (
          <section
            className="rounded-app min-h-[420px] my-5 bg-cover bg-center relative overflow-hidden p-10 max-sm:p-5.5 max-sm:min-h-0 isolate"
            style={{ backgroundColor: lead.colors?.[0] || '#15331c' }}
          >
            {lead.backdrop && (
              <RemoteImage
                src={lead.backdrop}
                alt=""
                fill
                sizes="(max-width: 1280px) 100vw, 1220px"
                className="object-cover -z-20"
              />
            )}
            <div
              className="absolute inset-0 -z-10"
              style={{
                background:
                  'linear-gradient(90deg, rgba(5,8,7,.96), rgba(5,8,7,.5) 66%, rgba(5,8,7,.23))',
              }}
            />
            <div className="grid grid-cols-[1fr_200px] max-sm:grid-cols-1 gap-7.5 max-sm:gap-5 items-center">
              <div>
                <p className="text-[11px] tracking-[0.17em] uppercase font-extrabold text-lime mb-2">
                  Em destaque
                </p>
                <h2 className="text-[44px] max-sm:text-[33px] leading-[1.04] -tracking-[0.05em] mb-3.5">
                  {lead.t}
                </h2>
                <div className="inline-flex items-center gap-3 px-3.5 py-2.5 mb-3.5 border border-lime/30 bg-lime-soft rounded-[14px]">
                  <small className="text-[#c3cfc1] text-[11px] uppercase tracking-[0.12em]">
                    Estreia
                  </small>
                  <strong className="text-lime text-xl">
                    {dateLabel(lead.releaseDate, true)}
                  </strong>
                </div>
                <p className="text-[15px] max-sm:text-[13px] text-[#c7d1c8] max-w-[620px]">
                  {lead.syn}
                </p>
                <div className="flex items-center gap-2.5 mt-4.5 flex-wrap">
                  <Link
                    className="min-h-[46px] px-5 py-2.5 rounded-full bg-lime text-[#081004] font-extrabold inline-flex items-center gap-2 text-sm hover:bg-[#d5ff70] transition-colors"
                    href={movieHref(lead.id)}
                  >
                    Ver filme <Icon name="arrow" className="w-4 h-4" />
                  </Link>
                  <SaveButton m={lead} path={movieHref(lead.id)} />
                </div>
              </div>
              <Link href={movieHref(lead.id)} className="max-sm:hidden">
                <MoviePoster m={lead} className="w-[200px]" />
              </Link>
            </div>
          </section>
        )}
        <div className="grid gap-3 my-6">
          <Rail aria-label="Ano">
            {years.map((yearOption) => (
              <Chip
                key={yearOption}
                active={year === yearOption}
                onClick={() => setYear(yearOption)}
              >
                {yearOption}
              </Chip>
            ))}
          </Rail>
          <Rail aria-label="Mês">
            {months.map((monthOption) => (
              <Chip
                key={monthOption}
                active={effectiveMonth === monthOption}
                onClick={() => setMonth(monthOption)}
              >
                {MONTH_NAMES[Number(monthOption) - 1]}
              </Chip>
            ))}
          </Rail>
        </div>
        <div className="grid grid-cols-6 max-lg:grid-cols-5 max-md:grid-cols-4 max-sm:grid-cols-2 gap-x-4 gap-y-6">
          {selected.map((film) => (
            <MovieCard key={film.id} m={film} />
          ))}
        </div>
      </div>
    </div>
  );
}
