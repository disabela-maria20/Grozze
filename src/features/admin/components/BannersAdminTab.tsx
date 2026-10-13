'use client';

import { useState } from 'react';
import { MAX_HOME_BANNERS, useHomeBannersQuery } from '@/entities/banner';
import { Button, EmptyState, FilmLoader } from '@/shared/ui';
import { useHomeBannersMutation } from '../api';
import { MoviePicker } from './MoviePicker';

/** Picks the movies of the home carousel, in slide order. */
export function BannersAdminTab() {
  const { data, isPending, error } = useHomeBannersQuery();
  if (isPending) return <FilmLoader label="Carregando banner…" />;
  if (error)
    return (
      <EmptyState title="Não foi possível carregar o banner.">
        {error.message}
      </EmptyState>
    );
  // Remounts with the saved list after each save
  return <BannersEditor key={data.movieIds.join()} saved={data.movieIds} />;
}

function BannersEditor({ saved }: { saved: string[] }) {
  const [movieIds, setMovieIds] = useState(saved);
  const save = useHomeBannersMutation();
  const dirty = movieIds.join() !== saved.join();

  return (
    <div className="grid gap-4 max-w-[760px]">
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
    </div>
  );
}
