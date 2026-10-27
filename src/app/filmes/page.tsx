import type { Metadata } from 'next';
import { pageMetadata } from '@/shared/lib/seo';
import { Suspense } from 'react';
import { CatalogGate } from '@/entities/catalog';
import { ClientOnly } from '@/shared/ui';
import { CatalogApp } from '@/features/movies';

export const metadata: Metadata = pageMetadata({
  title: 'Filmes em cartaz',
  path: '/filmes',
  description:
    'Veja os filmes em cartaz e em pré-venda, filtre por gênero e encontre os horários das sessões nos cinemas perto de você.',
});

export default function Page() {
  return (
    <ClientOnly>
      <CatalogGate>
        <Suspense>
          <CatalogApp />
        </Suspense>
      </CatalogGate>
    </ClientOnly>
  );
}
