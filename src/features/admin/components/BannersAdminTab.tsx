'use client';

import { useState } from 'react';
import {
  MAX_HOME_BANNERS,
  useComingSoonHighlightQuery,
  useHomeBannersQuery,
} from '@/entities/banner';
import { upcoming } from '@/entities/movie';
import { Button, EmptyState, FilmLoader } from '@/shared/ui';
import { useComingSoonHighlightMutation, useHomeBannersMutation } from '../api';
import { MoviePicker } from './MoviePicker';

/** The banners the admin controls: the home carousel and the coming-soon page's. */
export function BannersAdminTab() {
  return (
    <div className="grid gap-10 max-w-[760px]">
      <HomeBannersSection />
      <ComingSoonBannerSection />
    </div>
  );
}

function HomeBannersSection() {
  const { data, isPending, error } = useHomeBannersQuery();
  if (isPending) return <FilmLoader label="Carregando banner…" />;
  if (error)
    return (
      <EmptyState title="Não foi possível carregar o banner da home.">
        {error.message}
      </EmptyState>
    );
  // Remounts with the saved list after each save
  return <HomeBannersEditor key={data.movieIds.join()} saved={data.movieIds} />;
}

function HomeBannersEditor({ saved }: { saved: string[] }) {
  const [movieIds, setMovieIds] = useState(saved);
  const save = useHomeBannersMutation();
  const dirty = movieIds.join() !== saved.join();

  return (
    <section className="grid gap-4">
      <div>
        <h2 className="text-[23px] tracking-tight m-0 mb-1">Banner da home</h2>
        <p className="text-muted text-sm m-0">
          Escolha os filmes do carrossel de destaque, na ordem dos slides (até{' '}
          {MAX_HOME_BANNERS}). Sem nenhum filme, a home mostra os 5 primeiros em
          cartaz.
        </p>
      </div>

      <MoviePicker
        value={movieIds}
        onChange={setMovieIds}
        max={MAX_HOME_BANNERS}
        reorderable
      />

      <div className="flex items-center gap-2.5 flex-wrap">
        <Button
          primary
          type="button"
          disabled={!dirty || save.isPending}
          onClick={() => save.mutate(movieIds)}
        >
          {save.isPending ? 'Salvando…' : 'Salvar banner'}
        </Button>
        <Button
          type="button"
          disabled={!dirty || save.isPending}
          onClick={() => setMovieIds(saved)}
        >
          Descartar alterações
        </Button>
        {movieIds.length > 0 && (
          <Button
            type="button"
            disabled={save.isPending}
            onClick={() => setMovieIds([])}
          >
            Limpar (usar filmes em cartaz)
          </Button>
        )}
      </div>
    </section>
  );
}

function ComingSoonBannerSection() {
  const { data, isPending, error } = useComingSoonHighlightQuery();
  if (isPending) return <FilmLoader label="Carregando banner do Em breve…" />;
  if (error)
    return (
      <EmptyState title="Não foi possível carregar o banner do Em breve.">
        {error.message}
      </EmptyState>
    );
  return (
    <ComingSoonBannerEditor
      key={data.movieId ?? ''}
      saved={data.movieId ?? null}
    />
  );
}

function ComingSoonBannerEditor({ saved }: { saved: string | null }) {
  const [movieId, setMovieId] = useState(saved);
  const save = useComingSoonHighlightMutation();
  const dirty = movieId !== saved;

  return (
    <section className="grid gap-4">
      <div>
        <h2 className="text-[23px] tracking-tight m-0 mb-1">
          Banner do Em breve
        </h2>
        <p className="text-muted text-sm m-0">
          Escolha o filme em destaque no topo da página Em breve. A lista mostra
          só filmes que ainda vão estrear. Sem nenhum filme, a página destaca a
          próxima estreia.
        </p>
      </div>

      <MoviePicker
        value={movieId ? [movieId] : []}
        // One movie: picking another replaces it
        onChange={(ids) => setMovieId(ids.at(-1) ?? null)}
        only={upcoming}
      />

      <div className="flex items-center gap-2.5 flex-wrap">
        <Button
          primary
          type="button"
          disabled={!dirty || save.isPending}
          onClick={() => save.mutate(movieId)}
        >
          {save.isPending ? 'Salvando…' : 'Salvar banner'}
        </Button>
        <Button
          type="button"
          disabled={!dirty || save.isPending}
          onClick={() => setMovieId(saved)}
        >
          Descartar alterações
        </Button>
        {movieId && (
          <Button
            type="button"
            disabled={save.isPending}
            onClick={() => setMovieId(null)}
          >
            Limpar (usar próxima estreia)
          </Button>
        )}
      </div>
    </section>
  );
}
