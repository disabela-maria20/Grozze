import type { Metadata } from 'next';
import { privatePage } from '@/shared/lib/seo';
import { Suspense } from 'react';
import { CatalogGate } from '@/entities/catalog';
import { ClientOnly } from '@/shared/ui';
import { AdminApp } from '@/features/admin';
import { AuthGate } from '@/features/auth';

export const metadata: Metadata = privatePage('Grozze CMS', '/admin');

export default function Page() {
  return (
    <ClientOnly>
      <AuthGate requiredRole="admin">
        <CatalogGate>
          <Suspense>
            <AdminApp />
          </Suspense>
        </CatalogGate>
      </AuthGate>
    </ClientOnly>
  );
}
