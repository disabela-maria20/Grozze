import type { Metadata } from 'next';
import { ClientOnly } from '@/shared/ui/ClientOnly';
import { ComingSoonApp } from '@/features/movies';

export const metadata: Metadata = { title: 'Em breve' };

export default function Page() {
  return (
    <ClientOnly>
      <ComingSoonApp />
    </ClientOnly>
  );
}
