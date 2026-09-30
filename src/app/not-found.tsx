import { ClientOnly, NotFound } from '@/shared/ui';

export default function NotFoundPage() {
  return (
    <ClientOnly>
      <NotFound />
    </ClientOnly>
  );
}
