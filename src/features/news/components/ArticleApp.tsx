'use client';

import { dateLabel, movie } from '@/shared/lib/catalog';
import { useAppStore } from '@/shared/store';
import { MovieSection } from '@/features/movies';
import { EmptyState, FilmLoader, NotFound } from '@/shared/ui';
import { GrozzeApiError } from '@/shared/api';
import type { Movie } from '@/shared/lib/types';
import { useNewsArticleQuery } from '../api';

export function ArticleApp({
  slug,
  scope,
}: {
  slug: string;
  scope?: string | null;
}) {
  const content = useAppStore((s) => s.content);
  const { data: article, isPending, error } = useNewsArticleQuery(slug);

  if (isPending) {
    return (
      <div className="page pt-[120px] max-sm:pt-[101px] pb-13 min-h-[65vh]">
        <FilmLoader label="Carregando notícia…" />
      </div>
    );
  }

  // A published article that doesn't exist (or isn't public) returns 404
  if (error instanceof GrozzeApiError && error.status === 404)
    return <NotFound />;

  if (error || !article) {
    return (
      <div className="page pt-[120px] max-sm:pt-[101px] pb-13 min-h-[65vh]">
        <div className="w-[min(1220px,calc(100%-56px))] max-sm:w-[calc(100%-32px)] mx-auto">
          <EmptyState title="Não foi possível carregar esta notícia.">
            Tente novamente em instantes.
          </EmptyState>
        </div>
      </div>
    );
  }

  const published = article.publishedAt ?? article.createdAt;
  // Resolve the related movie ids against the catalog; skip any no longer there
  const related = article.relatedMovies
    .map((id) => movie(id, content))
    .filter((film): film is Movie => film !== null)
    .slice(0, 12);

  return (
    <div className="page pt-[120px] max-sm:pt-[101px] pb-13 min-h-[65vh]">
      <article className="w-[min(1220px,calc(100%-56px))] max-sm:w-[calc(100%-32px)] mx-auto max-w-[860px]">
        <p className="text-[11px] tracking-[0.17em] uppercase font-extrabold text-lime mb-2">
          {dateLabel(published.slice(0, 10), true)}
          {article.author ? ` · ${article.author.name}` : ''}
        </p>
        <h1 className="text-[46px] max-sm:text-[35px] leading-[1.1] -tracking-[0.045em] mb-4">
          {article.title}
        </h1>
        {article.summary && (
          <p className="text-[#c0cbc2] text-lg leading-[1.6] mb-5">
            {article.summary}
          </p>
        )}
        <div
          className="h-[190px] rounded-app my-5.5 bg-gradient-to-[130deg] from-[#263e2d] to-[#112319] bg-cover bg-center"
          style={
            article.coverImageUrl
              ? { backgroundImage: `url("${article.coverImageUrl}")` }
              : undefined
          }
        />
        {/* Plain text / Markdown from the API — rendered as text, never as HTML */}
        <p className="text-[#c0cbc2] text-base leading-[1.75] whitespace-pre-wrap">
          {article.content}
        </p>
      </article>
      {related.length > 0 && (
        <MovieSection
          title="Filmes relacionados"
          list={related}
          scope={scope}
        />
      )}
    </div>
  );
}
