import { cache } from 'react';
import type { GrozzeNews } from '@/shared/api';
import type { Metadata } from 'next';
import {
  absoluteUrl,
  metaText,
  ogCard,
  pageMetadata,
  SITE_NAME,
  SITE_URL,
} from '@/shared/lib/seo';
import { grozzeNews } from './api';

/** A published article for page metadata on the server (one fetch per request). */
export const getNewsForSeo = cache((slug: string): Promise<GrozzeNews | null> =>
  grozzeNews.getBySlug(slug).catch(() => null)
);

/** schema.org `NewsArticle` of an article page. */
export function newsJsonLd(article: GrozzeNews, path: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'NewsArticle',
    headline: article.title.slice(0, 110),
    description: metaText(article.summary || article.content) || undefined,
    image: article.coverImageUrl ? [article.coverImageUrl] : undefined,
    datePublished: article.publishedAt || undefined,
    dateModified: article.updatedAt || undefined,
    mainEntityOfPage: absoluteUrl(path),
    author: article.author
      ? { '@type': 'Person', name: article.author.name }
      : { '@type': 'Organization', name: SITE_NAME },
    publisher: {
      '@type': 'Organization',
      name: SITE_NAME,
      logo: { '@type': 'ImageObject', url: `${SITE_URL}/logo.png` },
    },
  };
}

/**
 * Metadata of an article page. The canonical is `/noticia/{slug}`, also for
 * a distributor hub's copy of the article.
 */
export function newsPageMetadata(
  article: GrozzeNews | null,
  slug: string
): Metadata {
  const path = `/noticia/${slug}`;
  if (!article) return pageMetadata({ title: 'Notícia', path, noindex: true });
  return pageMetadata({
    title: article.title,
    path,
    type: 'article',
    description: article.summary || article.content,
    images: [article.coverImageUrl || ogCard(article.title, 'Notícias')],
    publishedTime: article.publishedAt,
    modifiedTime: article.updatedAt,
    authors: article.author ? [article.author.name] : undefined,
  });
}
