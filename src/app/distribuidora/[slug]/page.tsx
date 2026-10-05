import type { Metadata } from 'next';
import { CatalogGate, ClientOnly } from '@/shared/ui';
import { DistributorPage } from '@/features/distributors';
import { DISTRIBUTORS } from '@/shared/lib/catalog';

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
  return { title: distributor?.name };
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
