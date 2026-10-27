import type { Metadata } from 'next';
import { CatalogGate } from '@/entities/catalog';
import { ClientOnly, JsonLd } from '@/shared/ui';
import { MoviePage } from '@/features/movies';
import {
  getMovieForSeo,
  movieJsonLd,
  moviePageMetadata,
} from '@/entities/movie';

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
