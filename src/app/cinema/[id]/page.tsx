import type { Metadata } from 'next';
import { CatalogGate } from '@/entities/catalog';
import { ClientOnly, JsonLd } from '@/shared/ui';
import { CinemaPage } from '@/features/cinemas';
import {
  cinemaJsonLd,
  cinemaPageMetadata,
  getCinemaForSeo,
} from '@/entities/cinema';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  return cinemaPageMetadata(await getCinemaForSeo(id), id);
}

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const cinema = await getCinemaForSeo(id);
  return (
    <>
      {cinema && <JsonLd data={cinemaJsonLd(cinema, `/cinema/${id}`)} />}
      <ClientOnly>
        <CatalogGate>
          <CinemaPage id={id} />
        </CatalogGate>
      </ClientOnly>
    </>
  );
}
