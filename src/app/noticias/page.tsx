import type { Metadata } from 'next';
import { ClientOnly } from '@/shared/ui';
import { NewsListApp } from '@/features/news';

export const metadata: Metadata = { title: 'Notícias' };

export default function Page() {
  return (
    <ClientOnly>
      <NewsListApp />
    </ClientOnly>
  );
}
