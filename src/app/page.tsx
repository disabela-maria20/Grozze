import { CatalogGate } from '@/entities/catalog';
import { ClientOnly } from '@/shared/ui';
import { HomeApp } from '@/features/home';

export default function Page() {
  return (
    <ClientOnly>
      <CatalogGate>
        <HomeApp />
      </CatalogGate>
    </ClientOnly>
  );
}
