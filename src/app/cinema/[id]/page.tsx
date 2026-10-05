import type { Metadata } from 'next';
import { CatalogGate, ClientOnly } from '@/shared/ui';
import { CinemaPage } from '@/features/cinemas';
import { getCinema } from '@/shared/api';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const cinema = await getCinema(id).catch(() => null);
  return { title: cinema?.name, description: cinema?.address };
}

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return (
    <ClientOnly>
      <CatalogGate>
        <CinemaPage id={id} />
      </CatalogGate>
    </ClientOnly>
  );
}
