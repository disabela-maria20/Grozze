import { ClientOnly } from '@/shared/ui/ClientOnly';
import { HomeApp } from '@/features/home';

export default function Page() {
  return (
    <ClientOnly>
      <HomeApp />
    </ClientOnly>
  );
}
