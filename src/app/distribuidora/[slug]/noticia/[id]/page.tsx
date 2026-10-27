import type { Metadata } from 'next';
import { CatalogGate } from '@/entities/catalog';
import { ClientOnly } from '@/shared/ui';
import { ArticleApp } from '@/features/news';
import { getNewsForSeo, newsPageMetadata } from '@/entities/news';

// Same article as /noticia/{slug}: the metadata points there (canonical)
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string; id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  return newsPageMetadata(await getNewsForSeo(id), id);
}

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
