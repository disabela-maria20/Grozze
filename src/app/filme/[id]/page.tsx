import type { Metadata } from 'next';
import { CatalogGate } from '@/entities/catalog';
import { ClientOnly, JsonLd } from '@/shared/ui';
import { MoviePage } from '@/features/movies';
import {
  getMovieForSeo,
  movieJsonLd,
  moviePageMetadata,
} from '@/entities/movie';

/**
 * Rendered on the first visit and then served from cache, refreshed at most
 * every 5 minutes (the catalog API's own cache), instead of on every request.
 */
export const revalidate = 300;

export function generateStaticParams() {
  return [];
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  return moviePageMetadata(await getMovieForSeo(id), id);
}

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const movie = await getMovieForSeo(id);
  return (
    <>
      {movie && <JsonLd data={movieJsonLd(movie, `/filme/${id}`)} />}
      <ClientOnly>
        <CatalogGate>
          <MoviePage id={id} />
        </CatalogGate>
      </ClientOnly>
    </>
  );
}
