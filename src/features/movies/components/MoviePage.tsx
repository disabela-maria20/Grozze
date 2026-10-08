'use client';

import { useAppStore } from '@/shared/store';
import { movie, movieHref } from '@/shared/lib/catalog';
import { NewsSection, useNewsListQuery } from '@/features/news';
import { NotFound } from '@/shared/ui';
import { MovieHero } from './MovieHero';
import { MovieProgram } from './MovieProgram';

export function MoviePage({
  id,
  scope,
}: {
  id: string;
  scope?: string | null;
}) {
  const content = useAppStore((s) => s.content);
  const latestNews = useNewsListQuery(1, 3).data?.items ?? [];
  const film = movie(id, content);
  if (!film || (scope && film.dist !== scope)) return <NotFound />;
  const path = movieHref(id, scope);

  return (
    <>
      <MovieHero m={film} path={path} />
      <div className="w-[min(1220px,calc(100%-56px))] max-sm:w-[calc(100%-32px)] mx-auto">
        <MovieProgram m={film} scope={scope} />
      </div>
      <NewsSection items={latestNews} title="Notícias" scope={scope} />
    </>
  );
}
