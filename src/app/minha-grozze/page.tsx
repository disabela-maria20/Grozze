import type { Metadata } from 'next';
import { privatePage } from '@/shared/lib/seo';
import { CatalogGate } from '@/entities/catalog';
import { ClientOnly } from '@/shared/ui';
import { AccountApp } from '@/features/account';

export const metadata: Metadata = privatePage('Minha Grozze', '/minha-grozze');

export default function Page() {
  return (
    <ClientOnly>
      <CatalogGate>
        <AccountApp part="" />
      </CatalogGate>
    </ClientOnly>
  );
}
