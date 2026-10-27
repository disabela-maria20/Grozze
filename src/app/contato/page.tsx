import type { Metadata } from 'next';
import { pageMetadata } from '@/shared/lib/seo';
import { ClientOnly } from '@/shared/ui';
import { ContactApp } from '@/features/contact';

export const metadata: Metadata = pageMetadata({
  title: 'Contato',
  path: '/contato',
  description: 'Fale com a Grozze: dúvidas, sugestões, parcerias e imprensa.',
});

export default function Page() {
  return (
    <ClientOnly>
      <ContactApp newsletter={false} />
    </ClientOnly>
  );
}
