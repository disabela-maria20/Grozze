import type { Metadata } from 'next';
import { CatalogGate, ClientOnly } from '@/shared/ui';
import { AccountApp } from '@/features/account';

export const metadata: Metadata = { title: 'Minha Grozze' };

export default function Page() {
  return (
    <ClientOnly>
      <CatalogGate>
        <AccountApp part="" />
      </CatalogGate>
    </ClientOnly>
  );
}
