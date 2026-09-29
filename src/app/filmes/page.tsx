import type { Metadata } from 'next';
import { ClientOnly } from '@/shared/ui/ClientOnly';
import { CatalogApp } from '@/features/movies';

export const metadata: Metadata = { title: 'Filmes' };

export default function Page() {
  return (
    <ClientOnly>
      <CatalogApp />
    </ClientOnly>
  );
}
