import type { Metadata } from 'next';
import { CatalogGate, ClientOnly } from '@/shared/ui';
import { CatalogApp } from '@/features/movies';

export const metadata: Metadata = { title: 'Filmes' };

export default function Page() {
  return (
    <ClientOnly>
      <CatalogGate>
        <CatalogApp />
      </CatalogGate>
    </ClientOnly>
  );
}
