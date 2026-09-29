'use client';

import { allMovies } from '@/shared/lib/catalog/allMovies';
import { NEWS } from '@/shared/lib/catalog/NEWS';
import { useAppStore } from '@/shared/store/useAppStore';
import { MovieSection } from '@/features/movies';
import { NotFound } from '@/shared/ui/NotFound';

export function ArticleApp({
  id,
  scope,
}: {
  id: string;
  scope?: string | null;
}) {
  const content = useAppStore((s) => s.content);
  const n = NEWS.find((x) => x.id === id);
  if (!n || (scope && n.dist !== scope)) return <NotFound />;
  const related = allMovies(content)
    .filter((m) => m.dist === n.dist)
    .slice(0, 6);

  return (
    <div className="page pt-[120px] max-sm:pt-[101px] pb-13 min-h-[65vh]">
      <article className="w-[min(1220px,calc(100%-56px))] max-sm:w-[calc(100%-32px)] mx-auto max-w-[860px]">
        <p className="text-[11px] tracking-[0.17em] uppercase font-extrabold text-lime mb-2">
          {n.k}
        </p>
        <h1 className="text-[46px] max-sm:text-[35px] leading-[1.1] -tracking-[0.045em] mb-4">
          {n.t}
        </h1>
        <div className="h-[190px] rounded-app my-5.5 bg-gradient-to-[130deg] from-[#263e2d] to-[#112319] flex items-end p-4.5 text-lime text-xs font-extrabold tracking-[0.1em] uppercase">
          {n.k}
        </div>
        <p className="text-[#c0cbc2] text-base leading-[1.75]">{n.body}</p>
      </article>
      <MovieSection title="Filmes relacionados" list={related} scope={scope} />
    </div>
  );
}
