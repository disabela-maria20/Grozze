import type { Metadata } from 'next';
import { Suspense } from 'react';
import { CatalogGate, ClientOnly } from '@/shared/ui';
import { CatalogApp } from '@/features/movies';

export const metadata: Metadata = { title: 'Filmes' };

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
