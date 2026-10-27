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

export const metadata: Metadata = {
  ...pageMetadata({ path: '/', description: SITE_DESCRIPTION }),
  title: { absolute: `${SITE_NAME} · Filmes em cartaz, cinemas e sessões` },
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
