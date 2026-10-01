import type { Metadata } from 'next';
import { CatalogGate, ClientOnly } from '@/shared/ui';
import { ComingSoonApp } from '@/features/movies';

export const metadata: Metadata = { title: 'Em breve' };

export default function Page() {
  return (
    <ClientOnly>
      <CatalogGate>
      <ComingSoonApp />
      </CatalogGate>
    </ClientOnly>
  );
}
