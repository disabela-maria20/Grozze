import type { Metadata } from 'next';
import { CatalogGate, ClientOnly } from '@/shared/ui';
import { ArticleApp } from '@/features/news';
import { DISTRIBUTORS, NEWS } from '@/shared/lib/catalog';

export function generateStaticParams() {
  const paths: { slug: string; id: string }[] = [];
  for (const d of DISTRIBUTORS.filter(
    (x) => x.status === 'active' && x.public
  )) {
    for (const n of NEWS.filter((n) => n.dist === d.slug)) {
      paths.push({ slug: d.slug, id: n.id });
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
  const n = NEWS.find((x) => x.id === id);
  return { title: n?.t, description: n?.p };
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
