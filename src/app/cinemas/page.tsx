import type { Metadata } from 'next';
import { pageMetadata } from '@/shared/lib/seo';
import { CatalogGate } from '@/entities/catalog';
import { ClientOnly } from '@/shared/ui';
import { CinemasApp, CinemasSkeleton } from '@/features/cinemas';

export const metadata: Metadata = pageMetadata({
  title: 'Cinemas',
  path: '/cinemas',
  description:
    'Encontre cinemas na sua cidade e veja endereço, salas e a programação de cada um com os horários das sessões.',
});

export default function Page() {
  return (
    <ClientOnly>
      <CatalogGate fallback={<CinemasSkeleton />}>
        <CinemasApp />
      </CatalogGate>
    </ClientOnly>
  );
}
