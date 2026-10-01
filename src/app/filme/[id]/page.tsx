import type { Metadata } from 'next';
import { CatalogGate, ClientOnly } from '@/shared/ui';
import { MoviePage } from '@/features/movies';
import { getMovies } from '@/shared/api/catalog';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const m = (await getMovies().catch(() => [])).find((x) => x.id === id);
  return { title: m?.t, description: m?.syn };
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
        <MoviePage id={id} />
      </CatalogGate>
    </ClientOnly>
  );
}
