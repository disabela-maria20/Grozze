import type { Metadata } from 'next';
import { ClientOnly } from '@/shared/ui';
import { ContactApp } from '@/features/contact';

export const metadata: Metadata = { title: 'Contato' };

export default function Page() {
  return (
    <ClientOnly>
      <ContactApp newsletter={false} />
    </ClientOnly>
  );
}
