import type { Metadata } from 'next';
import { pageMetadata } from '@/shared/lib/seo';
import { ClientOnly } from '@/shared/ui';
import { NewsListApp } from '@/features/news';

export const metadata: Metadata = pageMetadata({
  title: 'Notícias',
  path: '/noticias',
  description:
    'Notícias de cinema: estreias, bastidores, festivais e tudo o que vale saber antes da sua próxima sessão.',
});

export default function Page() {
  return (
    <ClientOnly>
      <NewsListApp />
    </ClientOnly>
  );
}
