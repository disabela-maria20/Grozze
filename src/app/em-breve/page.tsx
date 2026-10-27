import type { Metadata } from 'next';
import { pageMetadata } from '@/shared/lib/seo';
import { CatalogGate } from '@/entities/catalog';
import { ClientOnly } from '@/shared/ui';
import { ComingSoonApp } from '@/features/movies';

export const metadata: Metadata = pageMetadata({
  title: 'Em breve nos cinemas',
  path: '/em-breve',
  description:
    'Próximas estreias nos cinemas: datas de lançamento, trailers e pré-vendas dos filmes que estão chegando.',
});

export default function Page() {
  return (
    <ClientOnly>
      <CatalogGate>
        <ComingSoonApp />
      </CatalogGate>
    </ClientOnly>
  );
}
