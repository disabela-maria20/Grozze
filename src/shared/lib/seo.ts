import type { Metadata } from 'next';

export const SITE_NAME = 'Grozze';

/** Public address of the site; `NEXT_PUBLIC_SITE_URL` overrides it (staging...). */
export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL || 'https://grozze.isabelamribeiro.com.br'
).replace(/\/+$/, '');

export const SITE_DESCRIPTION =
  'Filmes em cartaz, estreias, cinemas e horários das sessões perto de você. Compare e encontre sua próxima ida ao cinema.';

/** The site's paths end with "/" (`trailingSlash`), and so must canonicals. */
export function sitePath(path: string): string {
  const withSlash = path.startsWith('/') ? path : `/${path}`;
  return withSlash.endsWith('/') ? withSlash : `${withSlash}/`;
}

export const absoluteUrl = (path: string) => SITE_URL + sitePath(path);

/**
 * Plain text for a meta description: no HTML or Markdown marks, spaces
 * collapsed, cut on a word near `max` characters.
 */
export function metaText(text: string | null | undefined, max = 160): string {
  const plain = String(text || '')
    .replace(/<[^>]*>/g, ' ')
    .replace(/[#*_`>[\]]+/g, '')
    .replace(/\s+/g, ' ')
    .trim();
  if (plain.length <= max) return plain;
  const cut = plain.slice(0, max - 1);
  const space = cut.lastIndexOf(' ');
  return `${(space > max * 0.6 ? cut.slice(0, space) : cut).trimEnd()}…`;
}

/** Brand card for sharing (see `app/og/route.tsx`), optionally with a title. */
export function ogCard(title?: string, subtitle?: string): string {
  const params = new URLSearchParams();
  if (title) params.set('title', title.slice(0, 120));
  if (subtitle) params.set('subtitle', subtitle.slice(0, 160));
  const query = params.toString();
  return `/og/${query ? `?${query}` : ''}`;
}

export interface PageSeo {
  title?: string;
  description?: string | null;
  /** Site path of the page, e.g. `/filme/123` (becomes the canonical). */
  path: string;
  /** Sharing images, best first; the brand card when none is given. */
  images?: (string | null | undefined)[];
  type?: 'website' | 'article' | 'video.movie';
  /** Article dates and author (type `article`). */
  publishedTime?: string | null;
  modifiedTime?: string | null;
  authors?: string[];
  /** Pages that shouldn't be in search results (login, account...). */
  noindex?: boolean;
}

/**
 * Metadata of a public page: title, description, canonical, Open Graph
 * and Twitter card. Relative URLs resolve against `metadataBase` (root
 * layout).
 */
export function pageMetadata(seo: PageSeo): Metadata {
  const description = metaText(seo.description || SITE_DESCRIPTION);
  const title = seo.title ?? SITE_NAME;
  const images = (seo.images ?? []).filter((url): url is string => !!url);
  const sharedImages = images.length ? images : [ogCard(seo.title)];
  const url = sitePath(seo.path);
  const base = {
    title,
    description,
    url,
    siteName: SITE_NAME,
    locale: 'pt_BR',
    images: sharedImages,
  };

  return {
    ...(seo.title && { title: seo.title }),
    description,
    alternates: { canonical: url },
    openGraph:
      seo.type === 'article'
        ? {
            ...base,
            type: 'article',
            ...(seo.publishedTime && { publishedTime: seo.publishedTime }),
            ...(seo.modifiedTime && { modifiedTime: seo.modifiedTime }),
            ...(seo.authors?.length && { authors: seo.authors }),
          }
        : seo.type === 'video.movie'
          ? { ...base, type: 'video.movie' }
          : { ...base, type: 'website' },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: sharedImages,
    },
    ...(seo.noindex && { robots: { index: false, follow: true } }),
  };
}

/** Metadata of a page kept out of search results (it still has a title). */
export const privatePage = (title: string, path: string): Metadata =>
  pageMetadata({ title, path, noindex: true });
