import type { Metadata } from 'next';
import { ClientOnly } from '@/shared/ui/ClientOnly';
import { MoviePage } from '@/features/movies';
import { allBaseMovieIds } from '@/shared/lib/catalog/allBaseMovieIds';
import { baseMovie } from '@/shared/lib/catalog/baseMovie';

export function generateStaticParams() {
  return allBaseMovieIds().map((id) => ({ id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const m = baseMovie(id);
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
      <MoviePage id={id} />
    </ClientOnly>
  );
}
