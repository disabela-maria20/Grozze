'use client';

import type { Movie } from '@/shared/lib/types';
import { MovieCard } from './MovieCard';
import { Rail, Icon } from '@/shared/ui';

export function MovieSection({
  title,
  eyebrow,
  list,
  morePath,
  rank = false,
  id,
  scope,
}: {
  title: string;
  eyebrow?: string;
  list: Movie[];
  morePath?: string;
  rank?: boolean;
  id?: string;
  scope?: string | null;
}) {
  if (!list.length) return null;
  return (
    <section className="py-8 max-sm:py-6" id={id}>
      <div className="w-[min(1220px,calc(100%-56px))] max-sm:w-[calc(100%-32px)] mx-auto">
        <div className="flex items-end justify-between gap-6 max-sm:gap-3 mb-4.5 max-sm:mb-3.5 min-w-0">
          <div>
            {eyebrow && (
              <p className="text-[11px] tracking-[0.17em] uppercase font-extrabold text-lime mb-2 max-sm:text-[10px] max-sm:mb-1.5">
                {eyebrow}
              </p>
            )}
            <h2 className="text-[32px] max-sm:text-[26px] tracking-tight leading-[1.15] m-0">
              {title}
            </h2>
          </div>
          {morePath && list.length > 7 && (
            <a
              className="text-[13px] max-sm:text-xs shrink-0 whitespace-nowrap inline-flex items-center gap-1.5 text-[#dce3dc] hover:text-lime transition-colors"
              href={morePath}
            >
              Ver todos <Icon name="arrow" className="w-4 h-4" />
            </a>
          )}
        </div>
        <Rail>
          {list.map((film, index) => (
            <div key={film.id} className="shrink-0 w-[178px] max-sm:w-[148px]">
              <MovieCard
                m={film}
                rank={rank ? index + 1 : null}
                scope={scope}
              />
            </div>
          ))}
        </Rail>
      </div>
    </section>
  );
}
