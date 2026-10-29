import type { Metadata } from 'next';
import { CatalogGate } from '@/entities/catalog';
import { ClientOnly, JsonLd } from '@/shared/ui';
import { ArticleApp } from '@/features/news';
import { getNewsForSeo, newsJsonLd, newsPageMetadata } from '@/entities/news';

/**
 * Rendered on the first visit and then served from cache, refreshed at most
 * every 5 minutes (the catalog API's own cache), instead of on every request.
 */
export const revalidate = 300;

export function generateStaticParams() {
  return [];
}

// The `[id]` segment is the article slug
export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  return newsPageMetadata(await getNewsForSeo(id), id);
}

// The article is fetched from the API by its slug (the `[id]` segment).
export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const article = await getNewsForSeo(id);
  return (
    <>
      {article && <JsonLd data={newsJsonLd(article, `/noticia/${id}`)} />}
      <ClientOnly>
        <CatalogGate>
          <ArticleApp slug={id} />
        </CatalogGate>
      </ClientOnly>
    </>
  );
}
