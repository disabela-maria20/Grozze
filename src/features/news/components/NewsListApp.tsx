'use client';

import { useState } from 'react';
import { useNewsListQuery } from '../api';
import { NewsCard } from './NewsCard';
import { Button, EmptyState, FilmLoader } from '@/shared/ui';

const PAGE_SIZE = 12;

export function NewsListApp() {
  const [page, setPage] = useState(1);
  const { data, isPending, isError, isPlaceholderData } = useNewsListQuery(
    page,
    PAGE_SIZE
  );

  const items = data?.items ?? [];
  const total = data?.total ?? 0;
  const lastPage = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <div className="page pt-30 max-sm:pt-25.25 pb-13 min-h-[65vh]">
      <div className="w-[min(1220px,calc(100%-56px))] max-sm:w-[calc(100%-32px)] mx-auto">
        <header className="mb-6.5">
          <h1 className="text-[48px] max-sm:text-[38px] tracking-tighter leading-[1.05] mb-3">
            Notícias
          </h1>
        </header>

        {isPending ? (
          <FilmLoader label="Carregando notícias…" />
        ) : isError ? (
          <EmptyState title="Não foi possível carregar as notícias.">
            Tente novamente em instantes.
          </EmptyState>
        ) : items.length === 0 ? (
          <EmptyState title="Nenhuma notícia publicada ainda." />
        ) : (
          <>
            <div className="grid grid-cols-3 max-sm:grid-cols-1 gap-4.5">
              {items.map((item) => (
                <NewsCard key={item.id} article={item} />
              ))}
            </div>
            {lastPage > 1 && (
              <div className="flex items-center justify-center gap-3 mt-8">
                <Button
                  disabled={page <= 1 || isPlaceholderData}
                  onClick={() => setPage((current) => Math.max(1, current - 1))}
                >
                  Anterior
                </Button>
                <span className="text-sm text-muted">
                  Página {page} de {lastPage}
                </span>
                <Button
                  disabled={page >= lastPage || isPlaceholderData}
                  onClick={() =>
                    setPage((current) => Math.min(lastPage, current + 1))
                  }
                >
                  Próxima
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
