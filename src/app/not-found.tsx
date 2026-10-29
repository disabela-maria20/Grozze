import type { Metadata } from 'next';
import { ClientOnly, NotFound } from '@/shared/ui';

// No canonical: a 404 is no page of its own. Next adds `noindex` itself.
export const metadata: Metadata = {
  title: 'Página não encontrada',
  description:
    'O endereço que você abriu não existe ou foi removido da Grozze.',
};

export default function NotFoundPage() {
  return (
    <ClientOnly>
      <NotFound />
    </ClientOnly>
  );
}
