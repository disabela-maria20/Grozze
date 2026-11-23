'use client';

import { useEffect } from 'react';
import { useAppStore } from '@/shared/store';
import { movie, movieHref } from '@/entities/movie';
import { NewsSection, useNewsListQuery } from '@/features/news';
import { NotFound } from '@/shared/ui';
import { MovieHero } from './MovieHero';
import { MovieProgram } from './MovieProgram';

/** How long the jump to the sessions follows the page while it loads. */
const SETTLE_MS = 2000;

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
  const found = !!film && (!scope || film.dist === scope);

  // "Compre agora" (home) links here with `?focus=sessoes`, others with
  // `#sessoes`: the program renders after the catalog loads, too late for
  // the browser's own jump to the anchor, so it's done here
  useEffect(() => {
    if (!found) return;
    const wantsSessions =
      new URLSearchParams(window.location.search).get('focus') === 'sessoes' ||
      window.location.hash === '#sessoes';
    if (!wantsSessions) return;
    const align = () =>
      document.getElementById('sessoes')?.scrollIntoView({ block: 'start' });
    const frame = requestAnimationFrame(align);
    // The hero and the program grow as their data arrives: keep the section
    // in place while the page settles, unless the user scrolls first
    const observer = new ResizeObserver(align);
    observer.observe(document.body);
    const stop = () => {
      observer.disconnect();
      window.removeEventListener('wheel', stop);
      window.removeEventListener('touchstart', stop);
      window.removeEventListener('keydown', stop);
    };
    const timer = setTimeout(stop, SETTLE_MS);
    window.addEventListener('wheel', stop, { passive: true });
    window.addEventListener('touchstart', stop, { passive: true });
    window.addEventListener('keydown', stop);
    return () => {
      cancelAnimationFrame(frame);
      clearTimeout(timer);
      stop();
    };
  }, [found, id]);

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
