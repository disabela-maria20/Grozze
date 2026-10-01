import type { Metadata } from 'next';
import { CatalogGate, ClientOnly } from '@/shared/ui';
import { AdminApp } from '@/features/admin';

export const metadata: Metadata = { title: 'Grozze CMS' };

export default function Page() {
  return (
    <ClientOnly>
      <CatalogGate>
        <AdminApp />
      </CatalogGate>
    </ClientOnly>
  );
}
