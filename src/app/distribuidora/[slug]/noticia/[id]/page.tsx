import type { Metadata } from 'next';
import { CatalogGate, ClientOnly } from '@/shared/ui';
import { ArticleApp } from '@/features/news';
import { DISTRIBUTORS, NEWS } from '@/shared/lib/catalog';

export function generateStaticParams() {
  const paths: { slug: string; id: string }[] = [];
  const publicDistributors = DISTRIBUTORS.filter(
    (distributor) => distributor.status === 'active' && distributor.public
  );
  for (const distributor of publicDistributors) {
    const distributorNews = NEWS.filter(
      (article) => article.dist === distributor.slug
    );
    for (const article of distributorNews) {
      paths.push({ slug: distributor.slug, id: article.id });
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
  const article = NEWS.find((candidate) => candidate.id === id);
  return { title: article?.t, description: article?.p };
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
        <ArticleApp id={id} scope={slug} />
      </CatalogGate>
    </ClientOnly>
  );
}
