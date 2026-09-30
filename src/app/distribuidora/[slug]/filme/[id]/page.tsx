import type { Metadata } from 'next';
import { ClientOnly } from '@/shared/ui';
import { MoviePage } from '@/features/movies';
import { allMovies, baseMovie, DISTRIBUTORS } from '@/shared/lib/catalog';

export function generateStaticParams() {
  const paths: { slug: string; id: string }[] = [];
  for (const d of DISTRIBUTORS.filter(
    (x) => x.status === 'active' && x.public
  )) {
    for (const m of allMovies().filter((m) => m.dist === d.slug)) {
      paths.push({ slug: d.slug, id: m.id });
    }
  }
  return paths;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string; id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const m = baseMovie(id);
  return { title: m?.t, description: m?.syn };
}

export default async function Page({
  params,
}: {
  params: Promise<{ slug: string; id: string }>;
}) {
  const { slug, id } = await params;
  return (
    <ClientOnly>
      <MoviePage id={id} scope={slug} />
    </ClientOnly>
  );
}
