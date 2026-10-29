import type { Metadata } from 'next';
import { CatalogGate } from '@/entities/catalog';
import { ClientOnly, JsonLd } from '@/shared/ui';
import { HomeApp } from '@/features/home';
import {
  absoluteUrl,
  pageMetadata,
  SITE_DESCRIPTION,
  SITE_NAME,
  SITE_URL,
} from '@/shared/lib/seo';

const HOME_TITLE = `${SITE_NAME} · Filmes em cartaz, cinemas e sessões`;
const homeSeo = pageMetadata({ path: '/', description: SITE_DESCRIPTION });

// The shared preview gets the full title too, not just "Grozze"; the card
// itself stays the plain brand one
export const metadata: Metadata = {
  ...homeSeo,
  title: { absolute: HOME_TITLE },
  openGraph: { ...homeSeo.openGraph, title: HOME_TITLE },
  twitter: { ...homeSeo.twitter, title: HOME_TITLE },
};

/** Who publishes the site and what it is (schema.org). */
const siteJsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Organization',
      '@id': `${SITE_URL}/#organization`,
      name: SITE_NAME,
      url: absoluteUrl('/'),
      logo: `${SITE_URL}/logo.png`,
    },
    {
      '@type': 'WebSite',
      '@id': `${SITE_URL}/#website`,
      name: SITE_NAME,
      url: absoluteUrl('/'),
      description: SITE_DESCRIPTION,
      inLanguage: 'pt-BR',
      publisher: { '@id': `${SITE_URL}/#organization` },
    },
  ],
};

export default function Page() {
  return (
    <>
      <JsonLd data={siteJsonLd} />
      <ClientOnly>
        <CatalogGate>
          <HomeApp />
        </CatalogGate>
      </ClientOnly>
    </>
  );
}
