import type { Metadata } from 'next';
import { CatalogGate, ClientOnly } from '@/shared/ui';
import { ArticleApp } from '@/features/news';

export const metadata: Metadata = { title: 'Notícia' };

// The article is fetched from the API by its slug (the `[id]` segment).
export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return (
    <ClientOnly>
      <CatalogGate>
        <ArticleApp slug={id} />
      </CatalogGate>
    </ClientOnly>
  );
}
