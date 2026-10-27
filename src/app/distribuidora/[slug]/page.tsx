import type { Metadata } from 'next';
import { CatalogGate } from '@/entities/catalog';
import { ClientOnly } from '@/shared/ui';
import { DistributorPage } from '@/features/distributors';
import { DISTRIBUTORS } from '@/entities/distributor';
import { ogCard, pageMetadata } from '@/shared/lib/seo';

/** Hubs that are live and publicly listed get a pre-rendered page. */
function isPublicDistributor(distributor: (typeof DISTRIBUTORS)[number]) {
  return distributor.status === 'active' && distributor.public;
}

export function generateStaticParams() {
  return DISTRIBUTORS.filter(isPublicDistributor).map((distributor) => ({
    slug: distributor.slug,
  }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const distributor = DISTRIBUTORS.find((candidate) => candidate.slug === slug);
  const path = `/distribuidora/${slug}`;
  if (!distributor || !isPublicDistributor(distributor))
    return pageMetadata({ title: 'Distribuidora', path, noindex: true });
  return pageMetadata({
    title: distributor.name,
    path,
    description:
      distributor.desc ||
      `Filmes, estreias e notícias de ${distributor.name} nos cinemas.`,
    images: [ogCard(distributor.name, distributor.formal)],
  });
}

export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return (
    <ClientOnly>
      <CatalogGate>
        <DistributorPage slug={slug} />
      </CatalogGate>
    </ClientOnly>
  );
}
