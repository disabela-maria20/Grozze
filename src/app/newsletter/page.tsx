import type { Metadata } from 'next';
import { pageMetadata } from '@/shared/lib/seo';
import { ClientOnly } from '@/shared/ui';
import { ContactApp } from '@/features/contact';

export const metadata: Metadata = pageMetadata({
  title: 'Newsletter',
  path: '/newsletter',
  description:
    'Receba estreias, pré-vendas e novidades do cinema no seu e-mail.',
});

export default function Page() {
  return (
    <ClientOnly>
      <ContactApp newsletter={true} />
    </ClientOnly>
  );
}
