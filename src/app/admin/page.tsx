import type { Metadata } from 'next';
import { CatalogGate, ClientOnly } from '@/shared/ui';
import { AdminApp } from '@/features/admin';
import { AuthGate } from '@/features/auth';

export const metadata: Metadata = { title: 'Grozze CMS' };

export default function Page() {
  return (
    <ClientOnly>
      <AuthGate requiredRole="admin">
        <CatalogGate>
          <AdminApp />
        </CatalogGate>
      </AuthGate>
    </ClientOnly>
  );
}
