import type { Metadata } from 'next';
import { ClientOnly } from '@/shared/ui/ClientOnly';
import { ContactApp } from '@/features/contact';

export const metadata: Metadata = { title: 'Newsletter' };

export default function Page() {
  return (
    <ClientOnly>
      <ContactApp newsletter={true} />
    </ClientOnly>
  );
}
