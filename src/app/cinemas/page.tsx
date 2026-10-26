import type { Metadata } from 'next';
import { CatalogGate } from '@/entities/catalog';
import { ClientOnly } from '@/shared/ui';
import { CinemasApp, CinemasSkeleton } from '@/features/cinemas';

export const metadata: Metadata = { title: 'Cinemas' };

export default function Page() {
  return (
    <ClientOnly>
      <CatalogGate fallback={<CinemasSkeleton />}>
        <CinemasApp />
      </CatalogGate>
    </ClientOnly>
  );
}
