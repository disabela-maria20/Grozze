import { cache } from 'react';
import type { Metadata } from 'next';
import { absoluteUrl, ogCard, pageMetadata } from '@/shared/lib/seo';
import { getCinema } from './api';
import type { Cinema } from './types';

/** A cinema for page metadata on the server (one fetch per request). */
export const getCinemaForSeo = cache((id: string): Promise<Cinema | null> =>
  getCinema(id).catch(() => null)
);

/** schema.org `MovieTheater` of a cinema page. */
export function cinemaJsonLd(c: Cinema, path: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'MovieTheater',
    name: c.name,
    url: absoluteUrl(path),
    image: c.image || undefined,
    telephone: c.phones[0] || undefined,
    screenCount: c.roomCount || undefined,
    sameAs: c.siteUrl ? [c.siteUrl] : undefined,
    address: {
      '@type': 'PostalAddress',
      streetAddress: c.address || undefined,
      addressLocality: c.city || undefined,
      addressRegion: c.uf || undefined,
      postalCode: c.postalCode || undefined,
      addressCountry: 'BR',
    },
    geo:
      c.lat !== null && c.lng !== null
        ? { '@type': 'GeoCoordinates', latitude: c.lat, longitude: c.lng }
        : undefined,
  };
}

/** Metadata of a cinema page: name, where it is, its image (or the brand card). */
export function cinemaPageMetadata(c: Cinema | null, id: string): Metadata {
  const path = `/cinema/${id}`;
  if (!c) return pageMetadata({ title: 'Cinema', path, noindex: true });
  const place = [c.city, c.uf].filter(Boolean).join(' - ');
  return pageMetadata({
    title: place ? `${c.name} · ${place}` : c.name,
    path,
    description: `Programação e horários das sessões do ${c.name}${place ? ` em ${place}` : ''}. ${c.address}.`,
    images: [c.image || ogCard(c.name, c.address)],
  });
}
