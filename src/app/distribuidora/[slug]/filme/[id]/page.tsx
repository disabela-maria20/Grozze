import type { Metadata } from 'next';
import { CatalogGate } from '@/entities/catalog';
import { ClientOnly } from '@/shared/ui';
import { MoviePage } from '@/features/movies';
import { getMovieForSeo, moviePageMetadata } from '@/entities/movie';

// Same movie as /filme/{id}: the metadata points there (canonical), so the
// hub's copy doesn't compete with it in search results
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string; id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  return moviePageMetadata(await getMovieForSeo(id), id);
}

export default async function Page({
  params,
}: {
  params: Promise<{ slug: string; id: string }>;
}) {
  const { slug, id } = await params;
  return (
    <ClientOnly>
      <CatalogGate>
        <MoviePage id={id} scope={slug} />
      </CatalogGate>
    </ClientOnly>
  );
}
