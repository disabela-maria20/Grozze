import type { MetadataRoute } from 'next';
import { getCinemas } from '@/entities/cinema';
import { DISTRIBUTORS } from '@/entities/distributor';
import { getMovies } from '@/entities/movie';
import { grozzeNews } from '@/entities/news';
import type { GrozzeNewsSummary } from '@/shared/api';
import { absoluteUrl } from '@/shared/lib/seo';

/** Rebuilt at most once an hour (movies and sessions change daily). */
export const revalidate = 3600;

/** The API's page size limit; also caps the walk (50 pages = 2,500 articles). */
const NEWS_PAGE_SIZE = 50;
const NEWS_MAX_PAGES = 50;

const STATIC_PAGES: [
  string,
  MetadataRoute.Sitemap[number]['changeFrequency'],
  number,
][] = [
  ['/', 'daily', 1],
  ['/filmes', 'daily', 0.9],
  ['/cinemas', 'weekly', 0.8],
  ['/em-breve', 'daily', 0.8],
  ['/noticias', 'daily', 0.7],
  ['/sobre', 'yearly', 0.3],
  ['/faq', 'yearly', 0.3],
  ['/contato', 'yearly', 0.3],
  ['/newsletter', 'yearly', 0.3],
  ['/privacidade', 'yearly', 0.2],
  ['/termos', 'yearly', 0.2],
];

/** Every published article, page by page (none if the API is down). */
async function allNews(): Promise<GrozzeNewsSummary[]> {
  const items: GrozzeNewsSummary[] = [];
  try {
    for (let page = 1; page <= NEWS_MAX_PAGES; page++) {
      const result = await grozzeNews.list(page, NEWS_PAGE_SIZE);
      items.push(...result.items);
      if (items.length >= result.total || !result.items.length) break;
    }
  } catch {
    // The sitemap still lists the catalog without the articles
  }
  return items;
}

/**
 * Public pages for search engines: the fixed ones, every movie and cinema
 * of the catalog, published articles and live distributor hubs. Account,
 * login and CMS pages stay out (see robots.ts).
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [movies, cinemas, news] = await Promise.all([
    getMovies().catch(() => []),
    getCinemas().catch(() => []),
    allNews(),
  ]);

  return [
    ...STATIC_PAGES.map(([path, changeFrequency, priority]) => ({
      url: absoluteUrl(path),
      changeFrequency,
      priority,
    })),
    ...movies.map((movie) => ({
      url: absoluteUrl(`/filme/${movie.id}`),
      changeFrequency: 'daily' as const,
      priority: 0.8,
      images: [movie.poster].filter((image): image is string => !!image),
    })),
    ...cinemas.map((cinema) => ({
      url: absoluteUrl(`/cinema/${cinema.id}`),
      changeFrequency: 'daily' as const,
      priority: 0.6,
    })),
    ...news.map((article) => ({
      url: absoluteUrl(`/noticia/${article.slug}`),
      lastModified: article.updatedAt,
      changeFrequency: 'weekly' as const,
      priority: 0.6,
      images: article.coverImageUrl ? [article.coverImageUrl] : [],
    })),
    ...DISTRIBUTORS.filter(
      (distributor) => distributor.status === 'active' && distributor.public
    ).map((distributor) => ({
      url: absoluteUrl(`/distribuidora/${distributor.slug}`),
      changeFrequency: 'weekly' as const,
      priority: 0.5,
    })),
  ];
}
