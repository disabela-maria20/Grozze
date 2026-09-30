import type { Metadata } from 'next';
import { ClientOnly } from '@/shared/ui';
import { CinemasApp } from '@/features/cinemas';

export const metadata: Metadata = { title: 'Cinemas' };

export default function Page() {
  return (
    <ClientOnly>
      <CinemasApp />
    </ClientOnly>
  );
}
