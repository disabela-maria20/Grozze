'use client';

import type { ReactNode } from 'react';
import { useCatalogQuery } from '@/shared/api';
import { Button } from './Button';
import { FilmLoader } from './FilmLoader';

/**
 * Renders children once the catalog (movies + cinemas) has loaded from the
 * API, so they can use the synchronous resolvers in `shared/lib/catalog`.
 * `compact` fits inside dialogs instead of filling a page.
 */
export function CatalogGate({
  children,
  compact = false,
}: {
  children: ReactNode;
  compact?: boolean;
}) {
  const { data, error, refetch, isFetching } = useCatalogQuery();
  if (data) return <>{children}</>;

  const body = error ? (
    <div role="alert">
      <h1 className="text-app-text text-[23px] tracking-tight m-0 mb-2">
        Não foi possível carregar o catálogo
      </h1>
      <p className="mb-4">
        {error instanceof Error ? error.message : 'Tente novamente.'}
      </p>
      <Button onClick={() => refetch()} disabled={isFetching}>
        {isFetching ? 'Tentando…' : 'Tentar novamente'}
      </Button>
    </div>
  ) : (
    <FilmLoader label="Carregando filmes e cinemas…" compact={compact} />
  );

  if (compact) return <div className="text-muted text-sm">{body}</div>;
  return (
    <div className="page pt-[120px] pb-13 min-h-[65vh]">
      <div className="w-[min(1220px,calc(100%-56px))] max-sm:w-[calc(100%-32px)] mx-auto border border-line rounded-app p-6 bg-surface text-muted">
        {body}
      </div>
    </div>
  );
}
