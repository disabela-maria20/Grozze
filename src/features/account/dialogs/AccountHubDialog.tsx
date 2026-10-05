'use client';

import { MovieCard } from '@/features/movies';
import { allMovies } from '@/shared/lib/catalog';
import { useAppStore, useIsSaved } from '@/shared/store';
import { Button, TextLink } from '@/shared/ui';

export function AccountHubDialog({ scope }: { scope: string }) {
  const content = useAppStore((s) => s.content);
  const movieSaved = useIsSaved('movie');
  const profile = useAppStore((s) => s.profile());
  const closeDialog = useAppStore((s) => s.closeDialog);
  const logout = useAppStore((s) => s.logout);

  const savedHubMovies = allMovies(content).filter(
    (hubMovie) => hubMovie.dist === scope && movieSaved(hubMovie.id)
  );

  return (
    <div>
      <h2 className="text-[34px] leading-[1.08] tracking-tight m-0 mb-3 pr-10">
        {profile?.name.split(' ')[0]}
      </h2>
      <p className="text-sm text-muted leading-relaxed mb-5">
        Seus filmes salvos neste hub.
      </p>
      {savedHubMovies.length ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {savedHubMovies.map((hubMovie) => (
            <MovieCard key={hubMovie.id} m={hubMovie} scope={scope} />
          ))}
        </div>
      ) : (
        <p className="text-muted">
          Nenhum filme salvo desta distribuidora ainda.
        </p>
      )}
      <div className="flex items-center gap-4 mt-5">
        <Button onClick={() => closeDialog()}>Continuar no hub</Button>
        <TextLink onClick={logout}>Sair</TextLink>
      </div>
    </div>
  );
}
