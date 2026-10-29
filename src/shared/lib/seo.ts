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

/** Size of the sharing card; declared in the tags so previews show on the first share. */
export const OG_CARD_SIZE = { width: 1200, height: 630 } as const;

/**
 * Brand card for sharing (see `app/og/route.tsx`), optionally with a title,
 * a subtitle and a photo behind them. Every preview goes through it: the
 * catalog's own images are ~1 MB and served as `binary/octet-stream`,
 * which WhatsApp and Facebook drop.
 */
export function ogCard(
  title?: string,
  subtitle?: string | null,
  image?: string | null
): string {
  const params = new URLSearchParams();
  if (title) params.set('title', title.slice(0, 120));
  if (subtitle) params.set('subtitle', subtitle.slice(0, 160));
  if (image) params.set('image', image);
  const query = params.toString();
  return `/og/${query ? `?${query}` : ''}`;
}

/** `ogCard` as an Open Graph image, with its size, type and alt text. */
export const ogImage = (
  title?: string,
  subtitle?: string | null,
  image?: string | null
) => ({
  url: ogCard(title, subtitle, image),
  ...OG_CARD_SIZE,
  type: 'image/jpeg',
  alt: title ? `${title} · ${SITE_NAME}` : SITE_NAME,
});

export interface PageSeo {
  title?: string;
  description?: string | null;
  /** Site path of the page, e.g. `/filme/123` (becomes the canonical). */
  path: string;
  /** Line under the title on the sharing card. */
  shareSubtitle?: string | null;
  /** Photo behind the sharing card (backdrop, cover...). */
  shareImage?: string | null;
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
  const sharedImages = [ogImage(seo.title, seo.shareSubtitle, seo.shareImage)];
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
