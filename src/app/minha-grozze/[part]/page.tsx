import type { Metadata } from 'next';
import { CatalogGate, ClientOnly } from '@/shared/ui';
import { AccountApp } from '@/features/account';

export function generateStaticParams() {
  return ['salvos', 'cinemas', 'preferencias', 'conta', 'alertas'].map(
    (part) => ({ part })
  );
}

export const metadata: Metadata = { title: 'Minha Grozze' };

export default async function Page({
  params,
}: {
  params: Promise<{ part: string }>;
}) {
  const { part } = await params;
  const normalized = part === 'alertas' ? 'preferencias' : part;
  return (
    <ClientOnly>
      <CatalogGate>
      <AccountApp part={normalized} />
      </CatalogGate>
    </ClientOnly>
  );
}
