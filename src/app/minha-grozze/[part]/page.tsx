import type { Metadata } from 'next';
import { privatePage } from '@/shared/lib/seo';
import { CatalogGate } from '@/entities/catalog';
import { ClientOnly } from '@/shared/ui';
import { AccountApp } from '@/features/account';

export function generateStaticParams() {
  return ['salvos', 'cinemas', 'preferencias', 'conta', 'alertas'].map(
    (part) => ({ part })
  );
}

export const metadata: Metadata = privatePage('Minha Grozze', '/minha-grozze');

export default async function Page({
  params,
}: {
  params: Promise<{ part: string }>;
}) {
  const { part } = await params;
  // `alertas` is a legacy alias of the preferences tab
  const normalized = part === 'alertas' ? 'preferencias' : part;
  return (
    <ClientOnly>
      <CatalogGate>
        <AccountApp part={normalized} />
      </CatalogGate>
    </ClientOnly>
  );
}
