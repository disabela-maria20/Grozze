import type { Metadata } from 'next';
import { CatalogGate, ClientOnly } from '@/shared/ui';
import { ArticleApp } from '@/features/news';

export const metadata: Metadata = { title: 'Notícia' };

// `[id]` is the article slug; `[slug]` keeps the distributor in the URL for the
// related-movie links. The article data itself comes from the API by slug.
export default async function Page({
  params,
}: {
  params: Promise<{ slug: string; id: string }>;
}) {
  const { slug, id } = await params;
  return (
    <ClientOnly>
      <CatalogGate>
        <ArticleApp slug={id} scope={slug} />
      </CatalogGate>
    </ClientOnly>
  );
}
