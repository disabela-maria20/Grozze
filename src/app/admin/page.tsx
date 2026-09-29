import type { Metadata } from 'next';
import { ClientOnly } from '@/shared/ui/ClientOnly';
import { AdminApp } from '@/features/admin';

export const metadata: Metadata = { title: 'Grozze CMS' };

export default function Page() {
  return (
    <ClientOnly>
      <AdminApp />
    </ClientOnly>
  );
}
