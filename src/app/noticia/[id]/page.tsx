import type { Metadata } from 'next';
import { CatalogGate, ClientOnly } from '@/shared/ui';
import { ArticleApp } from '@/features/news';
import { NEWS } from '@/shared/lib/catalog';

export function generateStaticParams() {
  return NEWS.map((article) => ({ id: article.id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const article = NEWS.find((candidate) => candidate.id === id);
  return { title: article?.t, description: article?.p };
}

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return (
    <ClientOnly>
      <CatalogGate>
        <ArticleApp id={id} />
      </CatalogGate>
    </ClientOnly>
  );
}
