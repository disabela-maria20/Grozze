import type { Metadata } from 'next';
import { CatalogGate, ClientOnly } from '@/shared/ui';
import { LoginPageApp } from '@/features/auth';

export const metadata: Metadata = { title: 'Entrar' };

export default function Page() {
  return (
    <ClientOnly>
      <CatalogGate>
        <LoginPageApp signup={false} />
      </CatalogGate>
    </ClientOnly>
  );
}
