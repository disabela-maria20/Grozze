import type { Metadata } from 'next';
import { privatePage } from '@/shared/lib/seo';
import { CatalogGate } from '@/entities/catalog';
import { ClientOnly } from '@/shared/ui';
import { LoginPageApp } from '@/features/auth';

export const metadata: Metadata = privatePage('Criar conta', '/cadastro');

export default function Page() {
  return (
    <ClientOnly>
      <CatalogGate>
        <LoginPageApp signup={true} />
      </CatalogGate>
    </ClientOnly>
  );
}
