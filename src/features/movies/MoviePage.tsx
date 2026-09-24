"use client";

import { useAppStore } from "@/shared/store/store";
import { movie, movieHref, relatedNews } from "@/shared/lib/catalog";
import { NewsSection } from "@/shared/ui/NewsSection";
import { NotFound } from "@/shared/ui/NotFound";
import { MovieHero } from "./MovieHero";
import { MovieProgram } from "./MovieProgram";

export function MoviePage({ id, scope }: { id: string; scope?: string | null }) {
  const content = useAppStore((s) => s.content);
  const m = movie(id, content);
  if (!m || (scope && m.dist !== scope)) return <NotFound />;
  const path = movieHref(id, scope);

  return (
    <>
      <MovieHero m={m} path={path} />
      <div className="w-[min(1220px,calc(100%-56px))] max-sm:w-[calc(100%-32px)] mx-auto">
        <MovieProgram m={m} scope={scope} />
      </div>
      <NewsSection items={relatedNews(m)} title="Notícias relacionadas" scope={scope} />
    </>
  );
}
