import type { Metadata } from 'next';
import { CatalogGate } from '@/entities/catalog';
import { ClientOnly } from '@/shared/ui';
import { MoviePage } from '@/features/movies';
import { getMovies } from '@/entities/movie';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string; id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const movies = await getMovies().catch(() => []);
  const movie = movies.find((candidate) => candidate.id === id);
  return { title: movie?.t, description: movie?.syn };
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
